import type { RFQData } from "@/types/rfq";

// ────────────────────────────────────────────────────────────────
// Data Minification — strip empty/default values to save tokens
// Uses FULL field names so the LLM mirrors them in output
// ────────────────────────────────────────────────────────────────

export function minifyRFQData(data: RFQData): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  // Buyer info
  const buyer: Record<string, string> = {};
  if (data.buyerInfo.companyName) buyer.companyName = data.buyerInfo.companyName;
  if (data.buyerInfo.contactPerson) buyer.contactPerson = data.buyerInfo.contactPerson;
  if (data.buyerInfo.email) buyer.email = data.buyerInfo.email;
  if (data.buyerInfo.phone) buyer.phone = data.buyerInfo.phone;
  if (data.buyerInfo.gstNumber) buyer.gstNumber = data.buyerInfo.gstNumber;
  if (Object.keys(buyer).length > 0) result.buyerInfo = buyer;

  // Address info
  const addr: Record<string, unknown> = {};
  const deliv = data.addressInfo.deliveryAddress;
  if (deliv.city) addr.deliveryAddress = deliv;
  if (!data.addressInfo.billingSameAsDelivery) {
    addr.billingAddress = data.addressInfo.billingAddress;
    addr.billingSameAsDelivery = false;
  } else {
    addr.billingSameAsDelivery = true;
  }
  if (Object.keys(addr).length > 0) result.addressInfo = addr;

  // Line items
  if (data.lineItems && data.lineItems.length > 0) {
    result.lineItems = data.lineItems.map((item) => {
      const m: Record<string, unknown> = { id: item.id, slNo: item.slNo };
      if (item.materialCategory) m.materialCategory = item.materialCategory;
      if (item.materialGrade) m.materialGrade = item.materialGrade;
      if (item.productForm) m.productForm = item.productForm;
      if (item.specification) m.specification = item.specification;
      if (item.dimensions && Object.keys(item.dimensions).length > 0) m.dimensions = item.dimensions;
      if (item.quantity) m.quantity = item.quantity;
      if (item.unit && item.unit !== "MT") m.unit = item.unit;
      if (item.surfaceFinish) m.surfaceFinish = item.surfaceFinish;
      if (item.remarks) m.remarks = item.remarks;
      return m;
    });
  }

  // Delivery terms
  const delivery: Record<string, string> = {};
  if (data.deliveryTerms.deliveryLocation) delivery.deliveryLocation = data.deliveryTerms.deliveryLocation;
  if (data.deliveryTerms.deliveryDate) delivery.deliveryDate = data.deliveryTerms.deliveryDate;
  if (data.deliveryTerms.transportMode && data.deliveryTerms.transportMode !== "Road")
    delivery.transportMode = data.deliveryTerms.transportMode;
  if (Object.keys(delivery).length > 0) result.deliveryTerms = delivery;

  // Commercial terms
  const commercial: Record<string, unknown> = {};
  if (data.commercialTerms.paymentTerms) commercial.paymentTerms = data.commercialTerms.paymentTerms;
  if (data.commercialTerms.taxTerms && data.commercialTerms.taxTerms !== "GST Extra @ 18%")
    commercial.taxTerms = data.commercialTerms.taxTerms;
  if (Object.keys(commercial).length > 0) result.commercialTerms = commercial;

  // Additional info
  const additional: Record<string, unknown> = {};
  if (data.additionalInfo.specialInstructions) additional.specialInstructions = data.additionalInfo.specialInstructions;
  if (data.additionalInfo.preferredBrands && data.additionalInfo.preferredBrands.length > 0) additional.preferredBrands = data.additionalInfo.preferredBrands;
  if (data.additionalInfo.projectName) additional.projectName = data.additionalInfo.projectName;
  if (data.additionalInfo.rfqReference) additional.rfqReference = data.additionalInfo.rfqReference;
  if (data.additionalInfo.priorityLevel && data.additionalInfo.priorityLevel !== "Normal") additional.priorityLevel = data.additionalInfo.priorityLevel;
  if (Object.keys(additional).length > 0) result.additionalInfo = additional;

  // Quality requirements
  const quality: Record<string, unknown> = {};
  if (data.qualityRequirements.standards && data.qualityRequirements.standards.length > 0) quality.standards = data.qualityRequirements.standards;
  if (data.qualityRequirements.certifications && data.qualityRequirements.certifications.length > 0) quality.certifications = data.qualityRequirements.certifications;
  if (data.qualityRequirements.testReports && data.qualityRequirements.testReports.length > 0) quality.testReports = data.qualityRequirements.testReports;
  if (data.qualityRequirements.toleranceNotes) quality.toleranceNotes = data.qualityRequirements.toleranceNotes;
  if (Object.keys(quality).length > 0) result.qualityRequirements = quality;

  return result;
}

// ────────────────────────────────────────────────────────────────
// Unified Prompt — single call for extraction + chat reply
// ────────────────────────────────────────────────────────────────

export function buildUnifiedRFQPrompt(rfqData: RFQData, language: string = "english"): string {
  const minified = minifyRFQData(rfqData);
  const stateJson = JSON.stringify(minified);

  return `You are MetalRFQ AI, Indian metals procurement assistant.
TASK: Reply in ${language.toUpperCase()}, then provide updated RFQ data.
FORMAT: [1-2 sentence natural reply] then <rfq_json>{"updatedData":{ONLY_CHANGED_FIELDS}}</rfq_json>

CRITICAL REPLY RULES:
- NEVER mention "JSON", "tags", "schema", "updatedData", "fields", or any technical terms in your reply text.
- Talk like a helpful procurement professional. Summarize what you understood and what was added to the RFQ.
- Example good reply: "Got it, Rahul! I've added 200 MT of MS Plates and 50 seamless pipes to your RFQ. Could you also share your delivery pincode?"
- Example bad reply: "I'll update the JSON with the new information." ← NEVER DO THIS.

EXHAUSTIVE EXTRACTION — Extract EVERY piece of info from the user message:
- Company name, contact person, GST number → buyerInfo
- City, state, pincode, delivery address → addressInfo.deliveryAddress
- Each material/grade/size/quantity → separate lineItem (unique id, sequential slNo)
- Delivery location, date, transport mode → deliveryTerms
- Payment terms (advance/credit/LC/CAD) → commercialTerms.paymentTerms
- "urgent"/"critical"/"ASAP" → additionalInfo.priorityLevel ("Urgent"/"Critical")
- Preferred mills/brands (Jindal/SAIL/Tata/JSW) → additionalInfo.preferredBrands (string[])
- Special instructions, project name → additionalInfo
- Mill TC, certifications, test reports → qualityRequirements

FIELD MAP (use these exact keys):
- buyerInfo: {companyName,contactPerson,email,phone,gstNumber}
- addressInfo: {deliveryAddress:{city,state,pincode,country},billingAddress:{...},billingSameAsDelivery:bool}
- lineItems: [{id,slNo,materialCategory,materialGrade,productForm,specification,dimensions:{thickness,width,length,dia,outerDiameter,wallThickness,custom},quantity,unit,surfaceFinish,remarks}]
- deliveryTerms: {deliveryLocation,deliveryDate,transportMode}
- commercialTerms: {paymentTerms,taxTerms}
- qualityRequirements: {standards:[],certifications:[],testReports:[],toleranceNotes}
- additionalInfo: {specialInstructions,preferredBrands:[],projectName,rfqReference,priorityLevel}

DIMENSIONS: TMT→dia(mm),length(m) | Plate/Sheet→thickness(mm),width(mm),length(mm) | Pipe/Tube→outerDiameter(mm),wallThickness(mm),length(m) | Other→custom
VALID materialCategory: "Mild Steel (MS)","Stainless Steel (SS)","Aluminium","Copper","Brass","Galvanized Iron (GI)","TMT Bars","Alloy Steel","Tool Steel"
VALID productForm: "Sheet","Plate","Coil","HR Coil","CR Coil","Round Bar","Flat Bar","Angle","Channel","Beam (I/H)","Pipe (Seamless)","Pipe (ERW)","Pipe (Welded)","Tube","Wire","Wire Rod","TMT Bar"
RULES:
- Auto-correct: MS→"Mild Steel (MS)", SS→"Stainless Steel (SS)", 304→"SS 304", ton/tonne→"MT", kg→"KG", meter→"Mtr"
- MERGE into existing state. Never erase existing data.
- Each material/grade/size combo = separate lineItem with unique id and sequential slNo.
- After extracting data, check what's still MISSING (companyName, gstNumber, city, pincode, deliveryDate, paymentTerms) and ASK the user in your reply.
- Keep reply brief, warm, and professional. List what you captured, then ask for missing details.
- Understand all Indian languages. ALL extracted DATA must be in ENGLISH.
CURRENT STATE: ${stateJson}
`;
}
