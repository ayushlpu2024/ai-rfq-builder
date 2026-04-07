"use client";

import React, { useState } from "react";
import type {
  RFQData,
  LineItem,
  BuyerInfo,
  DeliveryTerms,
  CommercialTerms,
  QualityRequirements,
  AdditionalInfo,
} from "@/types/rfq";
import {
  METAL_CATEGORIES,
  PRODUCT_FORMS,
  UNITS,
  COMMON_GRADES,
  INCOTERMS,
  PAYMENT_TERMS,
} from "@/types/rfq";
import { createEmptyLineItem } from "@/lib/rfq-defaults";
import { cn } from "@/lib/utils";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Truck,
  CreditCard,
  ShieldCheck,
  StickyNote,
  Hash,
  Ruler,
  Weight,
  Sparkles,
  Layers,
} from "lucide-react";

interface RFQFormPanelProps {
  data: RFQData;
  onUpdateField: <K extends keyof RFQData>(section: K, value: RFQData[K]) => void;
  onAddLineItem: () => void;
  onUpdateLineItem: (id: string, updates: Partial<LineItem>) => void;
  onRemoveLineItem: (id: string) => void;
  highlightedFields: string[];
}

// ── Collapsible Section wrapper ──
function FormSection({
  icon,
  title,
  badge,
  children,
  defaultOpen = true,
  accentColor = "amber",
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200",
      "bg-white dark:bg-gray-900/50",
      "border-gray-200/80 dark:border-white/8",
      "hover:border-gray-300 dark:hover:border-white/12",
    )}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left group"
      >
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          accentColor === "amber" && "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
          accentColor === "blue" && "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400",
          accentColor === "emerald" && "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          accentColor === "violet" && "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
          accentColor === "rose" && "bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400",
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
            {badge}
          </span>
        )}
        <div className="text-gray-400 dark:text-gray-600 transition-transform duration-200 group-hover:text-gray-600 dark:group-hover:text-gray-400">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-white/5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Field Input component ──
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  highlight,
  className,
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className={cn(
        "relative flex items-center rounded-lg border transition-all duration-300",
        highlight
          ? "border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/50 dark:bg-amber-500/5"
          : "border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5",
        "focus-within:border-amber-400 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20"
      )}>
        {icon && (
          <span className="pl-3 text-gray-400 dark:text-gray-500">{icon}</span>
        )}
        {highlight && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center">
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2 text-sm bg-transparent outline-none",
            "text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          )}
        />
      </div>
    </div>
  );
}

// ── Select field ──
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  highlight,
  className,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className={cn(
        "relative rounded-lg border transition-all duration-300",
        highlight
          ? "border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/50 dark:bg-amber-500/5"
          : "border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5",
        "focus-within:border-amber-400 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-400/20"
      )}>
        {highlight && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center">
            <Sparkles size={12} className="text-amber-500 animate-pulse" />
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-transparent outline-none text-gray-800 dark:text-gray-200 appearance-none cursor-pointer"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {/* If current value doesn't match any option, show it as a custom entry */}
          {value && !options.includes(value) && (
            <option value={value} className="bg-white dark:bg-gray-900">
              {value}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-white dark:bg-gray-900">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ── Checkbox field ──
function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div className={cn(
        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
        checked
          ? "bg-amber-500 border-amber-500 text-white"
          : "border-gray-300 dark:border-gray-600 group-hover:border-amber-400"
      )}>
        {checked && (
          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </label>
  );
}

// ── Button Selector ──
function ButtonSelector({
  label,
  value,
  onChange,
  options,
  columns = "grid-cols-2 sm:grid-cols-3",
  highlight,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[] | string[];
  columns?: string;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </label>
        {highlight && <Sparkles size={12} className="text-amber-500 animate-pulse" />}
      </div>
      <div className={cn("grid gap-2", columns)}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-all duration-200 truncate",
              value === option
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-400 text-amber-700 dark:text-amber-400 shadow-sm"
                : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-amber-300"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Line Item Card ──
function LineItemCard({
  item,
  onUpdate,
  onRemove,
  highlight,
}: {
  item: LineItem;
  onUpdate: (updates: Partial<LineItem>) => void;
  onRemove: () => void;
  highlight: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const availableGrades = item.materialCategory ? COMMON_GRADES[item.materialCategory] || [] : [];

  const updateDim = (dim: keyof LineItem["dimensions"], val: string) => {
    onUpdate({ dimensions: { ...(item.dimensions || {}), [dim]: val } });
  };

  const isSheetPlate = ["Sheet", "Plate", "Coil", "HR Coil", "CR Coil"].includes(item.productForm);
  const isPipeTube = ["Pipe (Seamless)", "Pipe (ERW)", "Pipe (Welded)", "Tube"].includes(item.productForm);
  const isTMT = item.materialCategory === "TMT Bars" || item.productForm === "TMT Bar";
  const isBar = ["Round Bar", "Flat Bar", "Angle", "Channel", "Beam (I/H)"].includes(item.productForm);

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-300",
      highlight
        ? "border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/10"
        : "border-gray-200 dark:border-white/8",
      "bg-gray-50/50 dark:bg-white/[0.02]"
    )}>
      {/* Item header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">{item.slNo}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
            {item.materialCategory && item.productForm
              ? `${item.materialCategory} ${item.productForm}`
              : item.materialCategory || "New Item"}
            {item.materialGrade && ` — ${item.materialGrade}`}
          </p>
        </div>
        {highlight && <Sparkles size={14} className="text-amber-500 animate-pulse flex-shrink-0" />}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          title="Remove item"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Item details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-200/60 dark:border-white/5 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Material Category"
              value={item.materialCategory}
              onChange={(v) => onUpdate({ materialCategory: v, materialGrade: "" })}
              options={METAL_CATEGORIES}
              placeholder="Select material..."
            />
            <SelectField
              label="Grade"
              value={item.materialGrade}
              onChange={(v) => onUpdate({ materialGrade: v })}
              options={availableGrades.length > 0 ? availableGrades : ["Custom..."]}
              placeholder="Select grade..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Product Form"
              value={item.productForm}
              onChange={(v) => onUpdate({ productForm: v })}
              options={PRODUCT_FORMS}
              placeholder="Select form..."
            />
            <Field
              label="Specification"
              value={item.specification}
              onChange={(v) => onUpdate({ specification: v })}
              placeholder="e.g., IS 2062, ASTM A240"
              icon={<FileText size={13} />}
            />
          </div>

          {/* Dynamic Dimensions */}
          <div className="p-3 rounded-lg bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/5 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dimensions</label>
            {/* Safe access to dimensions */}
            {(() => {
              const dims = item.dimensions || {};
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {isTMT && (
                    <>
                      <Field label="Dia (mm)" value={dims.dia || ""} onChange={(v) => updateDim("dia", v)} placeholder="e.g., 8, 10, 12" />
                      <Field label="Length (m)" value={dims.length || ""} onChange={(v) => updateDim("length", v)} placeholder="e.g., 12" />
                    </>
                  )}
                  {isSheetPlate && (
                    <>
                      <Field label="Thickness (mm)" value={dims.thickness || ""} onChange={(v) => updateDim("thickness", v)} placeholder="3" />
                      <Field label="Width (mm)" value={dims.width || ""} onChange={(v) => updateDim("width", v)} placeholder="1250" />
                      <Field label="Length (mm)" value={dims.length || ""} onChange={(v) => updateDim("length", v)} placeholder="2500" />
                    </>
                  )}
                  {isPipeTube && (
                    <>
                      <Field label="Outer Dia (mm)" value={dims.outerDiameter || ""} onChange={(v) => updateDim("outerDiameter", v)} placeholder="60.3" />
                      <Field label="Wall Thk (mm)" value={dims.wallThickness || ""} onChange={(v) => updateDim("wallThickness", v)} placeholder="3.9" />
                      <Field label="Length (m)" value={dims.length || ""} onChange={(v) => updateDim("length", v)} placeholder="6" />
                    </>
                  )}
                  {isBar && (
                    <>
                      <Field label="Dia (mm)" value={dims.dia || ""} onChange={(v) => updateDim("dia", v)} placeholder="e.g., 25" />
                      <Field label="Length (m)" value={dims.length || ""} onChange={(v) => updateDim("length", v)} placeholder="e.g., 6" />
                    </>
                  )}
                  {!isTMT && !isSheetPlate && !isPipeTube && !isBar && (
                    <div className="col-span-full">
                      <Field
                        label="Description / Dimensions"
                        value={dims.custom || ""}
                        onChange={(v) => updateDim("custom", v)}
                        placeholder="e.g., 50 x 50 x 5mm Angle, 6m long"
                        icon={<Ruler size={13} />}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Quantity"
              value={item.quantity || ""}
              onChange={(v) => onUpdate({ quantity: parseFloat(v) || 0 })}
              placeholder="0"
              type="number"
              icon={<Weight size={13} />}
            />
            <SelectField
              label="Unit"
              value={item.unit}
              onChange={(v) => onUpdate({ unit: v })}
              options={UNITS}
            />
            <Field
              label="Surface Finish"
              value={item.surfaceFinish}
              onChange={(v) => onUpdate({ surfaceFinish: v })}
              placeholder="HR / CR / GI"
            />
          </div>
          <Field
            label="Remarks"
            value={item.remarks}
            onChange={(v) => onUpdate({ remarks: v })}
            placeholder="Any special requirements..."
            icon={<StickyNote size={13} />}
          />
        </div>
      )}
    </div>
  );
}

// ── Main RFQ Form Panel ──
export function RFQFormPanel({
  data,
  onUpdateField,
  onAddLineItem,
  onUpdateLineItem,
  onRemoveLineItem,
  highlightedFields,
}: RFQFormPanelProps) {
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
      paymentTerms: "100% Advance",
      validityPeriod: "7 days",
      priceBase: "Per MT",
      taxTerms: "GST Extra @ 18%",
    }, 
    additionalInfo = {
      specialInstructions: "",
      preferredBrands: [],
      rfqReference: "",
      projectName: "",
      priorityLevel: "Normal",
    } 
  } = data || {};

  const isHighlighted = (path: string) => highlightedFields.some(f => f.includes(path));

  // No content state
  const isEmpty = !buyerInfo.companyName && lineItems.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/10">
          <Layers size={32} className="text-amber-500" />
        </div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Your RFQ will appear here
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
          Start chatting with MetalRFQ AI to build your quotation request, or manually add items below
        </p>
        <button
          onClick={onAddLineItem}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 transition-all duration-200 active:scale-95"
        >
          <Plus size={16} />
          Add First Item Manually
        </button>
      </div>
    );
  }

  // Address form helper
  const renderAddressFields = (type: 'delivery' | 'billing', label: string) => {
    const addr = type === 'delivery' ? addressInfo.deliveryAddress : addressInfo.billingAddress;
    const updateAddr = (updates: Partial<typeof addr>) => {
      const newAddr = { ...addr, ...updates };
      if (type === 'delivery') {
        onUpdateField("addressInfo", {
          ...addressInfo,
          deliveryAddress: newAddr,
          billingAddress: addressInfo.billingSameAsDelivery ? newAddr : addressInfo.billingAddress
        });
      } else {
        onUpdateField("addressInfo", { ...addressInfo, billingAddress: newAddr });
      }
    };

    return (
      <div className="space-y-3 pt-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" value={addr.city} onChange={(v) => updateAddr({ city: v })} placeholder="Mumbai" />
          <Field label="State" value={addr.state} onChange={(v) => updateAddr({ state: v })} placeholder="Maharashtra" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="PIN Code" value={addr.pincode} onChange={(v) => updateAddr({ pincode: v })} placeholder="400001" />
          <Field label="Country" value={addr.country} onChange={(v) => updateAddr({ country: v })} placeholder="India" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 p-4">
      {/* RFQ Header info */}
      <div className="flex items-center justify-between px-1 mb-1">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Request for Quotation
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
            {data.rfqNumber} • {new Date(data.createdAt).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      {/* ── Buyer Information ── */}
      <FormSection
        icon={<Building2 size={16} />}
        title="Company Details"
        accentColor="amber"
      >
        <div className="space-y-3">
          <Field
            label="GST Number"
            value={buyerInfo.gstNumber}
            onChange={(v) => onUpdateField("buyerInfo", { ...buyerInfo, gstNumber: v.toUpperCase() })}
            placeholder="e.g., 27AABCT1234D1Z5"
            icon={<Hash size={13} />}
            highlight={isHighlighted("gstNumber")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Company Name"
              value={buyerInfo.companyName}
              onChange={(v) => onUpdateField("buyerInfo", { ...buyerInfo, companyName: v })}
              placeholder="e.g., Tata Projects Ltd"
              icon={<Building2 size={13} />}
              highlight={isHighlighted("companyName")}
            />
            <Field
              label="Contact Person"
              value={buyerInfo.contactPerson}
              onChange={(v) => onUpdateField("buyerInfo", { ...buyerInfo, contactPerson: v })}
              placeholder="Full name"
              icon={<User size={13} />}
              highlight={isHighlighted("contactPerson")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Email"
              value={buyerInfo.email}
              onChange={(v) => onUpdateField("buyerInfo", { ...buyerInfo, email: v })}
              placeholder="procurement@company.com"
              type="email"
              icon={<Mail size={13} />}
              highlight={isHighlighted("email")}
            />
            <Field
              label="Phone"
              value={buyerInfo.phone}
              onChange={(v) => onUpdateField("buyerInfo", { ...buyerInfo, phone: v })}
              placeholder="+91 XXXXX XXXXX"
              icon={<Phone size={13} />}
              highlight={isHighlighted("phone")}
            />
          </div>
        </div>
      </FormSection>

      {/* ── Address Details ── */}
      <FormSection
        icon={<MapPin size={16} />}
        title="Address Details"
        accentColor="emerald"
        defaultOpen={false}
      >
        <div className="space-y-4">
          {renderAddressFields('delivery', 'Delivery Address')}
          
          <div className="pt-2 border-t border-gray-100 dark:border-white/5">
            <CheckboxField
              label="Billing address same as delivery"
              checked={addressInfo.billingSameAsDelivery}
              onChange={(v) => {
                onUpdateField("addressInfo", {
                  ...addressInfo,
                  billingSameAsDelivery: v,
                  billingAddress: v ? { ...addressInfo.deliveryAddress } : addressInfo.billingAddress
                });
              }}
            />
          </div>

          {!addressInfo.billingSameAsDelivery && renderAddressFields('billing', 'Billing Address')}
        </div>
      </FormSection>

      {/* ── Products Section ── */}
      <FormSection
        icon={<Package size={16} />}
        title={`Products & Materials (${lineItems.length})`}
        accentColor="blue"
        defaultOpen={true}
      >
        <div className="space-y-4">
          {lineItems.map((item) => (
            <LineItemCard
              key={item.id}
              item={item}
              onUpdate={(updates) => onUpdateLineItem(item.id, updates)}
              onRemove={() => onRemoveLineItem(item.id)}
              highlight={isHighlighted(`lineItem-${item.id}`)}
            />
          ))}
          <button
            onClick={onAddLineItem}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
          >
            <Plus size={15} />
            Add Product
          </button>
        </div>
      </FormSection>

      {/* ── Payment & Delivery Terms ── */}
      <FormSection
        icon={<CreditCard size={16} />}
        title="Payment & Delivery Terms"
        accentColor="violet"
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 pb-2">
            <SelectField
              label="Payment Terms"
              value={commercialTerms.paymentTerms}
              onChange={(v) => onUpdateField("commercialTerms", { ...commercialTerms, paymentTerms: v })}
              options={PAYMENT_TERMS}
              placeholder="Select..."
              highlight={isHighlighted("paymentTerms")}
            />
            <SelectField
              label="Priority Level"
              value={additionalInfo.priorityLevel}
              onChange={(v) => onUpdateField("additionalInfo", { ...additionalInfo, priorityLevel: v })}
              options={["Normal", "Urgent", "Critical"]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Field
              label="Required By Date"
              value={deliveryTerms.deliveryDate}
              onChange={(v) => onUpdateField("deliveryTerms", { ...deliveryTerms, deliveryDate: v })}
              placeholder="DD/MM/YYYY"
              type="date"
              highlight={isHighlighted("deliveryDate")}
            />
            <Field
              label="Tax Terms"
              value={commercialTerms.taxTerms}
              onChange={(v) => onUpdateField("commercialTerms", { ...commercialTerms, taxTerms: v })}
              placeholder="e.g., GST Extra @ 18%"
            />
          </div>
        </div>
      </FormSection>

      {/* ── Additional Detail ── */}
      <FormSection
        icon={<StickyNote size={16} />}
        title="Additional Requirement"
        accentColor="rose"
        defaultOpen={true}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Project Name"
              value={additionalInfo.projectName}
              onChange={(v) => onUpdateField("additionalInfo", { ...additionalInfo, projectName: v })}
              placeholder="e.g. Metro Line 3"
              icon={<FileText size={13} />}
            />
            <Field
              label="Reference #"
              value={additionalInfo.rfqReference}
              onChange={(v) => onUpdateField("additionalInfo", { ...additionalInfo, rfqReference: v })}
              placeholder="Internal Ref"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Special Instructions
            </label>
            <textarea
              value={additionalInfo.specialInstructions}
              onChange={(e) =>
                onUpdateField("additionalInfo", {
                  ...additionalInfo,
                  specialInstructions: e.target.value,
                })
              }
              placeholder="Any additional notes, special instructions, or specific requirements..."
              rows={4}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none focus:border-amber-400 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 resize-none transition-all duration-200"
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
}
