import type { RFQData, LineItem } from "@/types/rfq";

interface RFQBillTemplateProps {
  data: RFQData;
}

export function RFQBillTemplate({ data }: RFQBillTemplateProps) {
  const { 
    buyerInfo = {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      gstNumber: "",
    }, 
    addressInfo = { 
      deliveryAddress: { city: "", state: "", pincode: "", country: "India" },
      billingAddress: { city: "", state: "", pincode: "", country: "India" },
      billingSameAsDelivery: true
    }, 
    lineItems = [], 
    deliveryTerms = {
      deliveryLocation: "",
      deliveryDate: "",
      incoterms: "FOR Destination",
      packagingRequirements: "",
      transportMode: "Road",
    }, 
    commercialTerms = {
      paymentTerms: "",
      validityPeriod: "7 days",
      priceBase: "Per MT",
      taxTerms: "GST Extra @ 18%",
      inspectionRequired: false,
      testCertificateRequired: true,
      insuranceRequired: false,
    }, 
    qualityRequirements = {
      standards: [],
      certifications: ["Mill Test Certificate"],
      testReports: [],
      toleranceNotes: "",
    }, 
    additionalInfo = {
      specialInstructions: "",
      preferredBrands: [],
      rfqReference: "",
      projectName: "",
      priorityLevel: "Normal",
    } 
  } = data || {};

  const formatDimensions = (item: LineItem) => {
    const dimensions = item.dimensions || {};
    const isSheetPlate = ["Sheet", "Plate", "Coil"].some(f => (item.productForm || "").includes(f));
    const isPipeTube = ["Pipe", "Tube"].some(f => (item.productForm || "").includes(f));
    const isTMT = item.materialCategory === "TMT Bars" || item.productForm === "TMT Bar";

    if (isTMT && (dimensions.dia || dimensions.length)) {
      return `Dia: ${dimensions.dia || "-"} mm x Length: ${dimensions.length || "-"} m`;
    }
    if (isSheetPlate && (dimensions.thickness || dimensions.width || dimensions.length)) {
      return `Thk: ${dimensions.thickness || "-"} mm x Width: ${dimensions.width || "-"} mm x Length: ${dimensions.length || "-"} mm`;
    }
    if (isPipeTube && (dimensions.outerDiameter || dimensions.wallThickness || dimensions.length)) {
      return `OD: ${dimensions.outerDiameter || "-"} mm x WT: ${dimensions.wallThickness || "-"} mm x Length: ${dimensions.length || "-"} m`;
    }
    // Fallback if dimensions is still a string due to old data not being migrated (handled in store but for safety here too)
    return typeof dimensions === 'string' ? dimensions : (dimensions.custom || "N/A");
  };

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
              Ref: <span style={{ fontWeight: "600" }}>{data?.rfqNumber || "N/A"}</span>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "14px" }}>
              Date: <span style={{ fontWeight: "600" }}>{data?.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN") : "N/A"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Buyer & GST ── */}
      <div style={{ marginBottom: "30px", padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>Purchaser / Company</p>
            <p style={{ margin: "0 0 2px", fontWeight: "bold", fontSize: "16px" }}>{buyerInfo?.companyName || "N/A"}</p>
            <p style={{ margin: "0", fontSize: "13px" }}>Contact: {buyerInfo?.contactPerson || "N/A"} | Ph: {buyerInfo?.phone || "N/A"}</p>
            <p style={{ margin: "0", fontSize: "13px", color: "#4a5568" }}>Email: {buyerInfo?.email || "N/A"}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#718096", textTransform: "uppercase" }}>GST Number</p>
            <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", letterSpacing: "1px" }}>{buyerInfo?.gstNumber || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* ── Addresses ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "bold", color: "#718096", textTransform: "uppercase" }}>Delivery Address</h3>
          <div style={{ fontSize: "13px" }}>
            <p style={{ margin: 0 }}>{addressInfo?.deliveryAddress?.city || "-"}, {addressInfo?.deliveryAddress?.state || "-"} - {addressInfo?.deliveryAddress?.pincode || "-"}</p>
            <p style={{ margin: 0 }}>{addressInfo?.deliveryAddress?.country || "India"}</p>
          </div>
        </div>
        <div style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "bold", color: "#718096", textTransform: "uppercase" }}>Billing Address</h3>
          <div style={{ fontSize: "13px" }}>
            {addressInfo?.billingSameAsDelivery ? (
              <p style={{ fontStyle: "italic", color: "#718096" }}>Same as delivery address</p>
            ) : (
              <>
                <p style={{ margin: 0 }}>{addressInfo?.billingAddress?.city || "-"}, {addressInfo?.billingAddress?.state || "-"} - {addressInfo?.billingAddress?.pincode || "-"}</p>
                <p style={{ margin: 0 }}>{addressInfo?.billingAddress?.country || "India"}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Line Items Table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
        <thead>
          <tr style={{ backgroundColor: "#1a202c", color: "white" }}>
            <th style={{ padding: "10px 8px", textAlign: "left", width: "40px", fontSize: "11px", textTransform: "uppercase" }}>Sl</th>
            <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "11px", textTransform: "uppercase" }}>Material / Form / Grade</th>
            <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "11px", textTransform: "uppercase" }}>Dimensions & Spec</th>
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
                  <div style={{ fontWeight: "600", color: "#2b6cb0", marginTop: "2px" }}>Grade: {item.materialGrade}</div>
                  {item.surfaceFinish && (
                    <div style={{ fontSize: "11px", color: "#718096", marginTop: "2px" }}>Finish: {item.surfaceFinish}</div>
                  )}
                </td>
                <td style={{ padding: "12px 8px", verticalAlign: "top" }}>
                  <div style={{ fontWeight: "bold" }}>{formatDimensions(item)}</div>
                  <div style={{ fontSize: "11px", color: "#4a5568", marginTop: "2px" }}>{item.specification || "Standard Specification"}</div>
                  {item.remarks && (
                    <div style={{ fontSize: "11px", color: "#718096", marginTop: "4px", fontStyle: "italic" }}>
                      Note: {item.remarks}
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", verticalAlign: "top", fontWeight: "bold" }}>
                  {item.quantity}
                </td>
                <td style={{ padding: "12px 8px", verticalAlign: "top" }}>{item.unit}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#a0aec0" }}>No items added.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Payment & Delivery Terms ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#718096" }}>Delivery Details</h3>
          <table style={{ width: "100%", fontSize: "12px" }}>
            <tbody>
              <tr><td style={{ color: "#718096", padding: "4px 0" }}>Required Date:</td><td style={{ fontWeight: "600" }}>{deliveryTerms?.deliveryDate || "N/A"}</td></tr>
              <tr><td style={{ color: "#718096", padding: "4px 0" }}>Transport:</td><td style={{ fontWeight: "600" }}>{deliveryTerms?.transportMode || "Road"}</td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#718096" }}>Commercial Terms</h3>
          <table style={{ width: "100%", fontSize: "12px" }}>
            <tbody>
              <tr><td style={{ color: "#718096", padding: "4px 0" }}>Payment:</td><td style={{ fontWeight: "600" }}>{commercialTerms?.paymentTerms || "As per policy"}</td></tr>
              <tr><td style={{ color: "#718096", padding: "4px 0" }}>Taxation:</td><td style={{ fontWeight: "600" }}>{commercialTerms?.taxTerms}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Additional Info ── */}
      {additionalInfo.specialInstructions && (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", color: "#718096" }}>Special Instructions / Additional Details</h3>
          <p style={{ margin: 0, fontSize: "13px", whiteSpace: "pre-wrap" }}>{additionalInfo.specialInstructions}</p>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "11px", color: "#718096" }}>This is an AI-generated Request for Quotation.</p>
        <p style={{ margin: "4px 0 0", fontSize: "10px", color: "#a0aec0" }}>© {new Date().getFullYear()} MetalRFQ Builder</p>
      </div>
    </div>
  );
}
