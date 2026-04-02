import type { RFQData } from "@/types/rfq";
import { generateId } from "@/lib/utils";

/** Generate a unique RFQ number */
export function generateRFQNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `RFQ-${y}${m}${d}-${rand}`;
}

/** Empty RFQ state — used as the initial value */
export const defaultRFQData: RFQData = {
  buyerInfo: {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  },
  lineItems: [],
  deliveryTerms: {
    deliveryLocation: "",
    deliveryDate: "",
    incoterms: "FOR Destination",
    packagingRequirements: "",
    transportMode: "Road",
  },
  commercialTerms: {
    paymentTerms: "",
    validityPeriod: "7 days",
    priceBase: "Per MT",
    taxTerms: "GST Extra @ 18%",
    inspectionRequired: false,
    testCertificateRequired: true,
    insuranceRequired: false,
  },
  qualityRequirements: {
    standards: [],
    certifications: ["Mill Test Certificate"],
    testReports: [],
    toleranceNotes: "",
  },
  additionalInfo: {
    specialInstructions: "",
    preferredBrands: [],
    rfqReference: "",
    projectName: "",
    priorityLevel: "Normal",
  },
  createdAt: new Date().toISOString(),
  rfqNumber: generateRFQNumber(),
};

/** Create a new blank line item */
export function createEmptyLineItem(slNo: number): import("@/types/rfq").LineItem {
  return {
    id: generateId(),
    slNo,
    materialCategory: "",
    materialGrade: "",
    productForm: "",
    specification: "",
    dimensions: "",
    quantity: 0,
    unit: "MT",
    surfaceFinish: "",
    remarks: "",
  };
}
