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
  if (Object.keys(additional).length > 0) result.additionalInfo = additional;

  return result;
}

// ────────────────────────────────────────────────────────────────
// Unified Prompt — single call for extraction + chat reply
// ────────────────────────────────────────────────────────────────

export function buildUnifiedRFQPrompt(rfqData: RFQData, language: string = "english"): string {
  const minified = minifyRFQData(rfqData);
  const stateJson = JSON.stringify(minified);

  return `You are MetalRFQ AI, an Indian metals procurement assistant.

TASK: Extract RFQ data from user message AND provide a brief chat reply. Return ONLY valid JSON, no markdown fences.

LANGUAGE: Respond in ${language.toUpperCase()}. Understand all Indian languages. ALL extracted DATA must be ENGLISH.

DIMENSIONS EXTRACTION RULES:
- For TMT: Extract "dia" (mm) and "length" (m).
- For Plate/Sheet: Extract "thickness" (mm), "width" (mm), "length" (mm).
- For Pipe/Tube: Extract "outerDiameter" (mm), "wallThickness" (mm), "length" (m).
- For Others: Use "custom" description.
- Example: "3mm 4x8 ft MS Sheet" -> {"thickness":"3","width":"1220","length":"2440"}

VALID VALUES:
- materialCategory: "Mild Steel (MS)","Stainless Steel (SS)","Aluminium","Copper","Brass","Galvanized Iron (GI)","TMT Bars","Alloy Steel","Tool Steel"
- productForm: "Sheet","Plate","Coil","HR Coil","CR Coil","Round Bar","Flat Bar","Angle","Channel","Beam (I/H)","Pipe (Seamless)","Pipe (ERW)","Pipe (Welded)","Tube","Wire","Wire Rod","TMT Bar"

RULES:
- Auto-correct: MS→"Mild Steel (MS)", SS→"Stainless Steel (SS)", 304→"SS 304"
- ton/tonne→"MT", kg→"KG", meter→"Mtr"
- MERGE new data into existing. Never erase.
- Each material/grade/size combo = separate line item.
- Fill ALL possible fields across ALL sections: buyerInfo, addressInfo, deliveryTerms, commercialTerms, additionalInfo.
- PROACTIVE CHAT: If fields like companyName, gstNumber, or address details (city/pincode) are MISSING in the current state, ASK the user for them politely in your assistantMessage.
- If a user provides partial info (e.g. just material), ask for other details like Grade, Quantity, or Company Name if they aren't filled yet.
- Keep assistantMessage under 100 words, professional.

CURRENT STATE: ${stateJson}

REQUIRED OUTPUT JSON structure:
{
  "updatedData": {
    "buyerInfo": {"companyName":"","contactPerson":"","email":"","phone":"","gstNumber":""},
    "addressInfo": {
      "deliveryAddress": {"city":"","state":"","pincode":"","country":"India"},
      "billingAddress": {"city":"","state":"","pincode":"","country":"India"},
      "billingSameAsDelivery": true
    },
    "lineItems": [{
      "id":"abc123",
      "slNo":1,
      "materialCategory":"","materialGrade":"","productForm":"","specification":"","dimensions":{"thickness":"","width":"","length":"","dia":"","outerDiameter":"","wallThickness":"","custom":""},"quantity":0,"unit":"MT","surfaceFinish":"","remarks":""
    }],
    "deliveryTerms": {"deliveryLocation":"","deliveryDate":"","transportMode":"Road"},
    "commercialTerms": {"paymentTerms":"100% Advance","taxTerms":"GST Extra @ 18%"},
    "additionalInfo": {"specialInstructions":"","projectName":"","rfqReference":"","priorityLevel":"Normal"},
    "createdAt": "${rfqData.createdAt}",
    "rfqNumber": "${rfqData.rfqNumber}"
  },
  "fieldsUpdated": ["lineItems", "additionalInfo.priorityLevel"],
  "assistantMessage": "Your reply here (Mention what was updated and ask for missing details if any)"
}
`;
}
