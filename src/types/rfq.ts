// ============================================================
// RFQ (Request for Quotation) Data Types — Metal Industry
// ============================================================

/** Company / Buyer information */
export interface BuyerInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
}

/** Individual metal line-item in the RFQ */
export interface LineItem {
  id: string;
  slNo: number;
  materialCategory: string;    // e.g., "Steel", "Aluminium", "Copper"
  materialGrade: string;       // e.g., "IS 2062 E250", "SS 304", "6061-T6"
  productForm: string;         // e.g., "Sheet", "Plate", "Coil", "Bar", "Pipe"
  specification: string;       // e.g., "IS 2062", "ASTM A240", "BIS"
  dimensions: {
    thickness?: string;
    width?: string;
    length?: string;
    dia?: string;
    outerDiameter?: string;
    innerDiameter?: string;
    wallThickness?: string;
    custom?: string;
  };
  quantity: number;
  unit: string;                // "MT", "KG", "Nos", "Mtr", "Sqm"
  surfaceFinish: string;       // e.g., "HR", "CR", "Galvanized", "Mirror"
  remarks: string;
}

/** Delivery & logistics terms */
export interface DeliveryTerms {
  deliveryLocation: string;
  deliveryDate: string;
  transportMode: string;       // "Road", "Rail", "Sea"
}

/** Address Information */
export interface AddressDetails {
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface AddressInfo {
  deliveryAddress: AddressDetails;
  billingAddress: AddressDetails;
  billingSameAsDelivery: boolean;
}

/** Payment and commercial terms */
export interface CommercialTerms {
  paymentTerms: string;        // "Advance", "30 Days Credit", "LC", "CAD"
  validityPeriod: string;      // e.g., "7 days", "15 days"
  priceBase: string;           // "Per MT", "Per KG", "Lumpsum"
  taxTerms: string;            // "GST Extra", "GST Inclusive"
}

/** Quality / compliance requirements */
export interface QualityRequirements {
  standards: string[];         // e.g., ["IS 2062", "ASTM A36"]
  certifications: string[];    // e.g., ["Mill TC", "IBR", "NABL"]
  testReports: string[];       // e.g., ["Chemical", "Mechanical", "Ultrasonic"]
  toleranceNotes: string;
}

/** Additional notes and terms */
export interface AdditionalInfo {
  specialInstructions: string;
  preferredBrands: string[];   // e.g., ["Tata Steel", "JSW", "SAIL", "Hindalco"]
  rfqReference: string;        // buyer's internal RFQ number
  projectName: string;
  priorityLevel: string;       // "Normal", "Urgent", "Critical"
}

/** The master RFQ state object */
export interface RFQData {
  buyerInfo: BuyerInfo;
  addressInfo: AddressInfo;
  lineItems: LineItem[];
  deliveryTerms: DeliveryTerms;
  commercialTerms: CommercialTerms;
  qualityRequirements: QualityRequirements;
  additionalInfo: AdditionalInfo;
  createdAt: string;
  rfqNumber: string;
}

/** Chat message shape */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

/** Supported metal categories for quick-fill */
export const METAL_CATEGORIES = [
  "Mild Steel (MS)",
  "Stainless Steel (SS)",
  "Aluminium",
  "Copper",
  "Brass",
  "Galvanized Iron (GI)",
  "TMT Bars",
  "Alloy Steel",
  "Tool Steel",
  "Inconel / Nickel Alloys",
  "Titanium",
  "Zinc",
  "Lead",
] as const;

/** Common product forms */
export const PRODUCT_FORMS = [
  "Sheet",
  "Plate",
  "Coil",
  "HR Coil",
  "CR Coil",
  "Round Bar",
  "Flat Bar",
  "Angle",
  "Channel",
  "Beam (I/H)",
  "Pipe (Seamless)",
  "Pipe (ERW)",
  "Pipe (Welded)",
  "Tube",
  "Wire",
  "Wire Rod",
  "TMT Bar",
  "Forging",
  "Casting",
  "Flange",
  "Fitting",
] as const;

/** Common units */
export const UNITS = [
  "MT",
  "KG",
  "Nos",
  "Mtr",
  "Rmt",
  "Sqm",
  "Sqft",
  "Set",
  "Bundle",
] as const;

/** Common grades */
export const COMMON_GRADES: Record<string, string[]> = {
  "Mild Steel (MS)": [
    "IS 2062 E250 A",
    "IS 2062 E250 BR",
    "IS 2062 E350",
    "IS 2062 E410",
    "SA 516 Gr.70",
    "ASTM A36",
  ],
  "Stainless Steel (SS)": [
    "SS 304",
    "SS 304L",
    "SS 316",
    "SS 316L",
    "SS 321",
    "SS 410",
    "SS 430",
    "SS 202",
    "SS 310",
    "Duplex 2205",
    "Super Duplex 2507",
  ],
  "Aluminium": [
    "1050",
    "1100",
    "2024-T3",
    "3003-H14",
    "5052-H32",
    "5083-H321",
    "6061-T6",
    "6082-T6",
    "7075-T6",
  ],
  "Copper": [
    "C11000 (ETP)",
    "C12200 (DHP)",
    "C26000 (Brass)",
    "C51000 (Phosphor Bronze)",
  ],
  "TMT Bars": [
    "Fe 415",
    "Fe 415D",
    "Fe 500",
    "Fe 500D",
    "Fe 550",
    "Fe 550D",
    "Fe 600",
  ],
  "Alloy Steel": [
    "SA 387 Gr.11",
    "SA 387 Gr.22",
    "EN8",
    "EN19",
    "EN24",
    "EN31",
    "42CrMo4",
    "4140",
    "4340",
  ],
};

/** Incoterms options */
export const INCOTERMS = [
  "Ex-Works",
  "FOR Destination",
  "FOR Dispatch",
  "CIF",
  "FOB",
  "CFR",
  "DAP",
  "DDP",
] as const;

/** Payment terms options */
export const PAYMENT_TERMS = [
  "100% Advance",
  "50% Advance, 50% Before Dispatch",
  "30 Days Credit",
  "45 Days Credit",
  "60 Days Credit",
  "90 Days Credit",
  "Against Delivery",
  "Letter of Credit (LC)",
  "Cash Against Documents (CAD)",
] as const;
