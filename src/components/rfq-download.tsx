"use client";

import React, { useState } from "react";
import { Download, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import type { RFQData, LineItem } from "@/types/rfq";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { cn } from "@/lib/utils";

interface RFQDownloadProps {
  rfqData: RFQData;
}

/**
 * Download RFQ as PDF or CSV.
 */
export function RFQDownload({ rfqData }: RFQDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ── PDF Export via html2canvas ──
  const handlePDF = async () => {
    setShowMenu(false);
    const el = document.getElementById("rfq-bill-content");
    if (!el) return;

    setLoading(true);
    try {
      // Temporarily show the element for capture if needed, 
      // though html2canvas usually handles off-screen elements.
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById("rfq-bill-content");
          if (clonedEl) {
            clonedEl.style.opacity = "1";
            clonedEl.style.position = "relative";
            clonedEl.style.left = "0";
            clonedEl.style.top = "0";
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
      } else {
        let y = 0;
        while (y < imgHeight) {
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = imgWidth;
          const remainingHeight = imgHeight - y;
          pageCanvas.height = Math.min(pdfHeight / ratio, remainingHeight);

          const ctx = pageCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(canvas, 0, y, imgWidth, pageCanvas.height, 0, 0, imgWidth, pageCanvas.height);
            const pageData = pageCanvas.toDataURL("image/png");
            if (y > 0) pdf.addPage();
            pdf.addImage(pageData, "PNG", 0, 0, pdfWidth, pageCanvas.height * ratio);
          }
          y += pageCanvas.height;
        }
      }

      pdf.save(`${rfqData.rfqNumber || "RFQ"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── CSV Export ──
  const handleCSV = () => {
    setShowMenu(false);
    const { buyerInfo, addressInfo, lineItems, deliveryTerms, commercialTerms } = rfqData;

    const formatDims = (item: LineItem) => {
      const { dimensions } = item;
      const isSheetPlate = ["Sheet", "Plate", "Coil"].some(f => item.productForm.includes(f));
      const isPipeTube = ["Pipe", "Tube"].some(f => item.productForm.includes(f));
      const isTMT = item.materialCategory === "TMT Bars" || item.productForm === "TMT Bar";

      if (isTMT) return `Dia: ${dimensions.dia || "-"}mm, Len: ${dimensions.length || "-"}m`;
      if (isSheetPlate) return `${dimensions.thickness || "-"}x${dimensions.width || "-"}x${dimensions.length || "-"}mm`;
      if (isPipeTube) return `OD: ${dimensions.outerDiameter || "-"}mm, WT: ${dimensions.wallThickness || "-"}mm, Len: ${dimensions.length || "-"}m`;
      return dimensions.custom || "";
    };

    const headers = [
      "Sl.No", "Material Category", "Grade", "Product Form", "Specification",
      "Dimensions", "Quantity", "Unit", "Surface Finish", "Remarks"
    ];

    const rows = lineItems.map((item) => [
      item.slNo,
      item.materialCategory,
      item.materialGrade,
      item.productForm,
      item.specification,
      formatDims(item),
      item.quantity,
      item.unit,
      item.surfaceFinish,
      item.remarks,
    ]);

    const meta = [
      ["RFQ SUMMARY"],
      ["RFQ Number", rfqData.rfqNumber],
      ["Date", new Date(rfqData.createdAt).toLocaleDateString("en-IN")],
      ["Buyer", buyerInfo.companyName],
      ["GSTIN", buyerInfo.gstNumber],
      ["Contact", `${buyerInfo.contactPerson} (${buyerInfo.phone})`],
      ["Delivery Address", `${addressInfo.deliveryAddress.address}, ${addressInfo.deliveryAddress.city}, ${addressInfo.deliveryAddress.pincode}`],
      ["Billing Address", addressInfo.billingSameAsDelivery ? "Same as Delivery" : `${addressInfo.billingAddress.address}, ${addressInfo.billingAddress.city}, ${addressInfo.billingAddress.pincode}`],
      [],
      headers,
      ...rows,
    ];

    const csv = meta.map((row) =>
      row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rfqData.rfqNumber || "RFQ"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200",
          "bg-gradient-to-r from-emerald-500 to-teal-500",
          "hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-500/25",
          "active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Download size={16} />
            Export
          </>
        )}
      </button>

      {/* Dropdown */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            <button
              onClick={handlePDF}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <FileText size={16} className="text-red-500" />
              Export as PDF
            </button>
            <button
              onClick={handleCSV}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5"
            >
              <FileSpreadsheet size={16} className="text-emerald-500" />
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
