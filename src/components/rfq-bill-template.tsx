import React from "react";
import type { RFQData } from "@/types/rfq";

interface RFQBillTemplateProps {
  data: RFQData;
}

export function RFQBillTemplate({ data }: RFQBillTemplateProps) {
  const { buyerInfo, lineItems, deliveryTerms, commercialTerms, qualityRequirements, additionalInfo } = data;

  return (
    <div
      id="rfq-bill-content"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        backgroundColor: "white",
        color: "black",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: "12px",
        lineHeight: "1.5",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ── */}
      <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold", textTransform: "uppercase", color: "#1a202c" }}>
              Request For Quotation
            </h1>
            <p style={{ margin: "4px 0 0", color: "#4a5568", fontSize: "14px" }}>
              Ref: <span style={{ fontWeight: "600" }}>{data.rfqNumber}</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Date: <span style={{ fontWeight: "600" }}>{new Date(data.createdAt).toLocaleDateString("en-IN")}</span>
            </p>
            {additionalInfo.priorityLevel !== "Normal" && (
              <p style={{ margin: "4px 0 0", color: "#e53e3e", fontWeight: "bold", fontSize: "12px" }}>
                PRIORITY: {additionalInfo.priorityLevel.toUpperCase()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Buyer Info ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", color: "#718096", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>
            Buyer Details
          </h2>
          <div style={{ fontSize: "14px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: "bold", fontSize: "16px" }}>{buyerInfo.companyName || "N/A"}</p>
            <p style={{ margin: "0 0 2px" }}>{buyerInfo.address}</p>
            <p style={{ margin: "0 0 8px" }}>{buyerInfo.city}{buyerInfo.state ? `, ${buyerInfo.state}` : ""}{buyerInfo.pincode ? ` - ${buyerInfo.pincode}` : ""}</p>
            {buyerInfo.gstNumber && (
              <p style={{ margin: "0", fontSize: "12px" }}>
                GSTIN: <span style={{ fontWeight: "600" }}>{buyerInfo.gstNumber}</span>
              </p>
            )}
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: "13px", fontWeight: "bold", color: "#718096", textTransform: "uppercase", marginBottom: "8px", borderBottom: "1px solid #e2e8f0" }}>
            Contact Person
          </h2>
          <div style={{ fontSize: "14px" }}>
            <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>{buyerInfo.contactPerson || "N/A"}</p>
            <p style={{ margin: "0 0 2px" }}>{buyerInfo.email}</p>
            <p style={{ margin: "0 0 8px" }}>{buyerInfo.phone}</p>
            {additionalInfo.projectName && (
              <p style={{ margin: "0", fontSize: "12px" }}>
                Project: <span style={{ fontWeight: "600" }}>{additionalInfo.projectName}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f7fafc", borderTop: "1px solid #000", borderBottom: "1px solid #000" }}>
            <th style={{ padding: "10px 8px", textAlign: "left", width: "40px", fontSize: "11px", textTransform: "uppercase" }}>Sl</th>
            <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "11px", textTransform: "uppercase" }}>Material Description</th>
            <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "11px", textTransform: "uppercase" }}>Specification / Grade</th>
            <th style={{ padding: "10px 8px", textAlign: "right", width: "80px", fontSize: "11px", textTransform: "uppercase" }}>Qty</th>
            <th style={{ padding: "10px 8px", textAlign: "left", width: "60px", fontSize: "11px", textTransform: "uppercase" }}>Unit</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length > 0 ? (
            lineItems.map((item, index) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 8px", verticalAlign: "top" }}>{item.slNo || index + 1}</td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ fontWeight: "bold", fontSize: "13px" }}>
                    {item.materialCategory} {item.productForm}
                  </div>
                  <div style={{ fontSize: "12px", color: "#4a5568", marginTop: "4px" }}>
                    {item.dimensions}
                  </div>
                  {item.surfaceFinish && (
                    <div style={{ fontSize: "11px", color: "#718096", marginTop: "2px" }}>
                      Finish: {item.surfaceFinish}
                    </div>
                  )}
                  {item.remarks && (
                    <div style={{ fontSize: "11px", color: "#718096", marginTop: "4px", fontStyle: "italic" }}>
                      Note: {item.remarks}
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                  <div style={{ fontWeight: "600" }}>{item.materialGrade}</div>
                  <div style={{ fontSize: "11px", color: "#4a5568" }}>{item.specification}</div>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", verticalAlign: "top", fontWeight: "bold" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "12px 8px", verticalAlign: "top" }}>{item.unit}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#a0aec0" }}>
                No items added to this RFQ yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Terms & Conditions Table ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "4px", padding: "12px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#2d3748" }}>
            Delivery Terms
          </h3>
          <table style={{ width: "100%", fontSize: "12px" }}>
            <tbody>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0", width: "40%" }}>Destination:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{deliveryTerms.deliveryLocation || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0" }}>Required By:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{deliveryTerms.deliveryDate || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0" }}>Incoterms:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{deliveryTerms.incoterms}</td>
              </tr>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0" }}>Transport:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{deliveryTerms.transportMode}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "4px", padding: "12px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#2d3748" }}>
            Commercial Terms
          </h3>
          <table style={{ width: "100%", fontSize: "12px" }}>
            <tbody>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0", width: "40%" }}>Payment:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{commercialTerms.paymentTerms}</td>
              </tr>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0" }}>Validity:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{commercialTerms.validityPeriod}</td>
              </tr>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0" }}>Taxation:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>{commercialTerms.taxTerms}</td>
              </tr>
              <tr>
                <td style={{ color: "#718096", padding: "4px 0" }}>Certificates:</td>
                <td style={{ fontWeight: "600", padding: "4px 0" }}>
                  {commercialTerms.testCertificateRequired ? "Mill TC Required" : "Not Required"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quality & Compliance ── */}
      <div style={{ marginTop: "20px", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "12px" }}>
        <h3 style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#2d3748" }}>
          Quality & Special Requirements
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#718096" }}>Standards & Certifications:</p>
            <p style={{ margin: 0, fontWeight: "600" }}>
              {[...qualityRequirements.standards, ...qualityRequirements.certifications].join(", ") || "Standard commercial quality"}
            </p>
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#718096" }}>Preferred Brands:</p>
            <p style={{ margin: 0, fontWeight: "600" }}>{additionalInfo.preferredBrands.join(", ") || "Any reputable make"}</p>
          </div>
        </div>
        {additionalInfo.specialInstructions && (
          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed #e2e8f0" }}>
            <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#718096" }}>Special Instructions:</p>
            <p style={{ margin: 0, fontStyle: "italic" }}>{additionalInfo.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #000", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#718096" }}>
          This is a computer-generated Request for Quotation created via MetalRFQ AI.
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#a0aec0" }}>
          © {new Date().getFullYear()} MetalRFQ • Procurement Excellence
        </p>
      </div>
    </div>
  );
}
