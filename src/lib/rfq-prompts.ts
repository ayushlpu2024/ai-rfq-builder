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
  const stateJson = JSON.stringify(minifyRFQData(rfqData));

  return `You are MetalRFQ AI, Indian metals procurement assistant.
Reply in ${language.toUpperCase()}. All extracted data must be in ENGLISH.

OUTPUT FORMAT:
1-2 sentence reply, then:
<rfq_json>{"updatedData":{...},"fieldsUpdated":[...]}</rfq_json>

EXTRACTION:
- Dimensions by form — TMT: dia(mm)+length(m) | Plate/Sheet: thickness+width+length(mm) | Pipe: outerDiameter+wallThickness(mm)+length(m) | else: custom
- Auto-correct: MS→"Mild Steel (MS)", SS→"Stainless Steel (SS)", ton/tonne→"MT", kg→"KG"
- Each material/grade/size = separate line item. Merge, never erase.
- Missing companyName/gstNumber/city/pincode → ask user politely.

VALID materialCategory: "Mild Steel (MS)","Stainless Steel (SS)","Aluminium","Copper","Brass","Galvanized Iron (GI)","TMT Bars","Alloy Steel","Tool Steel"
VALID productForm: "Sheet","Plate","Coil","HR Coil","CR Coil","Round Bar","Flat Bar","Angle","Channel","Beam (I/H)","Pipe (Seamless)","Pipe (ERW)","Pipe (Welded)","Tube","Wire","Wire Rod","TMT Bar"

STATE: ${stateJson}

updatedData schema: {buyerInfo:{companyName,contactPerson,email,phone,gstNumber},addressInfo:{deliveryAddress:{city,state,pincode,country},billingAddress:{city,state,pincode,country},billingSameAsDelivery},lineItems:[{id,slNo,materialCategory,materialGrade,productForm,specification,dimensions:{thickness,width,length,dia,outerDiameter,wallThickness,custom},quantity,unit,surfaceFinish,remarks}],deliveryTerms:{deliveryLocation,deliveryDate,transportMode},commercialTerms:{paymentTerms,taxTerms},additionalInfo:{specialInstructions,projectName,rfqReference,priorityLevel},createdAt:"${rfqData.createdAt}",rfqNumber:"${rfqData.rfqNumber}"}`;
}