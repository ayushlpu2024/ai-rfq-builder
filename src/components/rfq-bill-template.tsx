import type { RFQData, LineItem } from "@/types/rfq";

interface RFQBillTemplateProps {
  data: RFQData;
}

export function RFQBillTemplate({ data }: RFQBillTemplateProps) {
  const { 
    buyerInfo = { companyName: "", contactPerson: "", email: "", phone: "", gstNumber: "" }, 
    addressInfo = { 
      deliveryAddress: { city: "", state: "", pincode: "", country: "India" },
      billingAddress: { city: "", state: "", pincode: "", country: "India" },
      billingSameAsDelivery: true
    }, 
    lineItems = [], 
    deliveryTerms = { deliveryLocation: "", deliveryDate: "", transportMode: "Road" }, 
    commercialTerms = { paymentTerms: "", taxTerms: "GST Extra @ 18%" }, 
    additionalInfo = { specialInstructions: "", projectName: "", rfqReference: "" } 
  } = data || {};

  const formatDimensions = (item: LineItem) => {
    const dimensions = item.dimensions || {};
    const productForm = (item.productForm || "").toLowerCase();
    const isSheetPlate = ["sheet", "plate", "coil"].some(f => productForm.includes(f));
    const isPipeTube = ["pipe", "tube"].some(f => productForm.includes(f));
    const isTMT = item.materialCategory === "TMT Bars" || productForm.includes("tmt");

    if (isTMT && (dimensions.dia || dimensions.length)) {
      return `${dimensions.dia || "-"}mm x ${dimensions.length || "-"}m`;
    }
    if (isSheetPlate && (dimensions.thickness || dimensions.width || dimensions.length)) {
      return `${dimensions.thickness || "-"}mm x ${dimensions.width || "-"}mm x ${dimensions.length || "-"}mm`;
    }
    if (isPipeTube && (dimensions.outerDiameter || dimensions.wallThickness || dimensions.length)) {
      return `OD: ${dimensions.outerDiameter || "-"}mm | WT: ${dimensions.wallThickness || "-"}mm | ${dimensions.length || "-"}m`;
    }
    return typeof dimensions === 'string' ? dimensions : (dimensions.custom || "N/A");
  };

  return (
    <div
      id="rfq-bill-content"
      style={{
        width: "210mm",
        padding: "15mm",
        backgroundColor: "white",
        color: "#1a202c",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontSize: "11px",
        lineHeight: "1.4",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ── Top Accent Bar ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(90deg, #b45309, #d97706)" }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px", paddingTop: "10px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", letterSpacing: "-0.025em", color: "#111827", textTransform: "uppercase" }}>
            Quotation Request
          </h1>
          <div style={{ display: "flex", gap: "15px", marginTop: "8px" }}>
            <p style={{ margin: 0, color: "#6b7280" }}>
              RFQ NO: <span style={{ fontWeight: "700", color: "#111827" }}>{data?.rfqNumber || "N/A"}</span>
            </p>
            <p style={{ margin: 0, color: "#6b7280" }}>
              DATE: <span style={{ fontWeight: "700", color: "#111827" }}>{data?.createdAt ? new Date(data.createdAt).toLocaleDateString("en-GB") : "N/A"}</span>
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "6px 12px", borderRadius: "6px" }}>
            <p style={{ margin: 0, fontSize: "10px", color: "#92400e", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</p>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#b45309" }}>PENDING QUOTE</p>
          </div>
        </div>
      </div>

      {/* ── Company & Address Info ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px", marginBottom: "35px" }}>
        <div style={{ padding: "15px", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: "800", color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.05em" }}>Company Details</h3>
          <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "700", color: "#111827" }}>{buyerInfo?.companyName || "N/A"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
            <div>
              <p style={{ margin: "0", color: "#6b7280", fontSize: "10px" }}>Contact Person</p>
              <p style={{ margin: "0", fontWeight: "600" }}>{buyerInfo?.contactPerson || "-"}</p>
            </div>
            <div>
              <p style={{ margin: "0", color: "#6b7280", fontSize: "10px" }}>Ph / Email</p>
              <p style={{ margin: "0", fontWeight: "600" }}>{buyerInfo?.phone || "-"}</p>
            </div>
          </div>
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #d1d5db" }}>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "10px" }}>GST Identification Number</p>
            <p style={{ margin: "0", fontWeight: "700", fontSize: "14px", letterSpacing: "0.025em" }}>{buyerInfo?.gstNumber || "NOT PROVIDED"}</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: "800", color: "#4b5563", textTransform: "uppercase" }}>Delivery Address</h3>
            <p style={{ margin: 0, fontWeight: "600", color: "#374151" }}>
              {addressInfo?.deliveryAddress?.city}, {addressInfo?.deliveryAddress?.state} {addressInfo?.deliveryAddress?.pincode}
            </p>
          </div>
          <div style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: "800", color: "#4b5563", textTransform: "uppercase" }}>Billing Details</h3>
            <p style={{ margin: 0, color: "#6b7280" }}>
              {addressInfo?.billingSameAsDelivery ? "Same as Delivery Address" : 
                `${addressInfo?.billingAddress?.city}, ${addressInfo?.billingAddress?.state} ${addressInfo?.billingAddress?.pincode}`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Line Items ── */}
      <div style={{ marginBottom: "35px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 10px", background: "#111827", color: "white", textAlign: "left", borderRadius: "8px 0 0 0", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>#</th>
              <th style={{ padding: "12px 10px", background: "#111827", color: "white", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Description</th>
              <th style={{ padding: "12px 10px", background: "#111827", color: "white", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Size / Dimensions</th>
              <th style={{ padding: "12px 10px", background: "#111827", color: "white", textAlign: "right", borderRadius: "0 8px 0 0", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length > 0 ? (
              lineItems.map((item, index) => (
                <tr key={item.id} style={{ background: index % 2 === 0 ? "white" : "#f9fafb" }}>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top", fontWeight: "700", color: "#9ca3af" }}>{String(index + 1).padStart(2, '0')}</td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ fontWeight: "700", fontSize: "13px", color: "#111827" }}>{item.materialCategory} | {item.productForm}</div>
                    <div style={{ color: "#4b5563", marginTop: "2px", fontWeight: "500" }}>Grade: <span style={{ color: "#d97706" }}>{item.materialGrade}</span></div>
                    {item.remarks && <div style={{ fontSize: "10px", color: "#9ca3af", fontStyle: "italic", marginTop: "4px" }}>Note: {item.remarks}</div>}
                  </td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" }}>
                    <div style={{ fontWeight: "600", color: "#374151" }}>{formatDimensions(item)}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>{item.specification || "Standard Spec"}</div>
                  </td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #f3f4f6", textAlign: "right", verticalAlign: "top" }}>
                    <div style={{ fontWeight: "800", fontSize: "14px", color: "#111827" }}>{item.quantity}</div>
                    <div style={{ fontSize: "10px", fontWeight: "600", color: "#6b7280" }}>{item.unit}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>No items listed.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Terms & Notes ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px", paddingTop: "20px", borderTop: "2px solid #f3f4f6" }}>
        <div style={{ spaceY: "15px" }}>
          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 5px", fontSize: "10px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase" }}>Commercial Terms</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ margin: 0 }}>Payment: <span style={{ fontWeight: "700" }}>{commercialTerms?.paymentTerms || "As Discussed"}</span></p>
              <p style={{ margin: 0 }}>Taxes: <span style={{ fontWeight: "700" }}>{commercialTerms?.taxTerms}</span></p>
            </div>
          </div>
          <div>
            <h4 style={{ margin: "0 0 5px", fontSize: "10px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase" }}>Logistics</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ margin: 0 }}>Mode: <span style={{ fontWeight: "700" }}>{deliveryTerms?.transportMode}</span></p>
              <p style={{ margin: 0 }}>Expected: <span style={{ fontWeight: "700" }}>{deliveryTerms?.deliveryDate || "Urgent"}</span></p>
            </div>
          </div>
        </div>

        {additionalInfo.specialInstructions && (
          <div style={{ padding: "15px", borderRadius: "10px", background: "#fdf2f8", border: "1px solid #fce7f3" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: "800", color: "#be185d", textTransform: "uppercase" }}>Special Instructions</h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#831843", whiteSpace: "pre-wrap" }}>{additionalInfo.specialInstructions}</p>
          </div>
        )}
      </div>

      {/* ── Disclaimer ── */}
      <div style={{ marginTop: "50px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "9px", color: "#9ca3af", letterSpacing: "0.025em" }}>
          THIS IS AN AUTOMATED REQUEST GENERATED BY METALRFQ AI. VERIFY ALL DIMENSIONS BEFORE QUOTING.
        </p>
      </div>
    </div>
  );
}
  );
}
