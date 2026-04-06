"use client";

import { useState, useCallback, useEffect } from "react";
import type { RFQData, ChatMessage, LineItem } from "@/types/rfq";
import { defaultRFQData, createEmptyLineItem } from "@/lib/rfq-defaults";
import { generateId } from "@/lib/utils";

/**
 * Safe deep merge helper for RFQ objects
 */
const deepMerge = (prev: any, next: any) => {
  if (!next) return prev;
  const result = { ...prev };
  for (const key in next) {
    if (next[key] && typeof next[key] === 'object' && !Array.isArray(next[key])) {
      result[key] = deepMerge(prev[key] || {}, next[key]);
    } else {
      result[key] = next[key];
    }
  }
  return result;
};

/**
 * RFQ store hook — manages all RFQ state, chat messages, and persistence.
 */
export function useRFQStore() {
  const [rfqData, setRFQData] = useState<RFQData>(defaultRFQData);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [language, setLanguage] = useState("english");

  // ── Sync with localStorage AFTER mount ──
  useEffect(() => {
    const savedLanguage = localStorage.getItem("rfqLanguage");
    if (savedLanguage) setLanguage(savedLanguage);

    const savedData = localStorage.getItem("rfqData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as RFQData;
        // Merge with defaults to handle new schema fields
        setRFQData({
          ...defaultRFQData,
          ...parsed,
          buyerInfo: { ...defaultRFQData.buyerInfo, ...parsed.buyerInfo },
          addressInfo: { ...defaultRFQData.addressInfo, ...parsed.addressInfo },
          deliveryTerms: { ...defaultRFQData.deliveryTerms, ...parsed.deliveryTerms },
          commercialTerms: { ...defaultRFQData.commercialTerms, ...parsed.commercialTerms },
          qualityRequirements: { ...defaultRFQData.qualityRequirements, ...parsed.qualityRequirements },
          additionalInfo: { ...defaultRFQData.additionalInfo, ...parsed.additionalInfo },
          lineItems: (parsed.lineItems || []).map(item => ({
            ...item,
            dimensions: typeof item.dimensions === 'string' 
              ? { custom: item.dimensions } 
              : (item.dimensions || {})
          }))
        });
      } catch (err) {
        console.error("Failed to parse saved RFQ data:", err);
      }
    }
    const savedMessages = localStorage.getItem("rfqMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages) as ChatMessage[]);
      } catch (err) {
        console.error("Failed to parse saved messages:", err);
      }
    }
    setHasHydrated(true);
  }, []);

  /** 
   * Smart merge RFQ data 
   * Prevents partial AI updates from deleting existing items.
   */
  const updateRFQData = useCallback((newData: RFQData) => {
    setRFQData((prev) => {
      // 1. Merge top-level metadata and basic sections
      const merged: RFQData = {
        ...prev,
        ...newData,
        buyerInfo: deepMerge(prev.buyerInfo, newData.buyerInfo),
        addressInfo: deepMerge(prev.addressInfo, newData.addressInfo),
        deliveryTerms: deepMerge(prev.deliveryTerms, newData.deliveryTerms),
        commercialTerms: deepMerge(prev.commercialTerms, newData.commercialTerms),
        qualityRequirements: deepMerge(prev.qualityRequirements, newData.qualityRequirements),
        additionalInfo: deepMerge(prev.additionalInfo, newData.additionalInfo),
      };

      // 2. SMART MERGE for Line Items
      if (newData.lineItems && newData.lineItems.length > 0) {
        const existingItems = [...prev.lineItems];
        
        newData.lineItems.forEach((newItem) => {
          const index = existingItems.findIndex((item) => item.id === newItem.id);
          
          // Ensure dimensions is always a valid object
          const sanitizedItem = {
            ...newItem,
            dimensions: typeof newItem.dimensions === 'string' 
              ? { custom: newItem.dimensions } 
              : (newItem.dimensions || {})
          };

          if (index > -1) {
            // Update existing item
            existingItems[index] = { ...existingItems[index], ...sanitizedItem };
          } else {
            // Append new item
            existingItems.push(sanitizedItem as any);
          }
        });

        // Maintain slNo order and ensure ID consistency
        merged.lineItems = existingItems.map((item, idx) => ({
          ...item,
          slNo: idx + 1,
        }));
      } else {
        merged.lineItems = prev.lineItems;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("rfqData", JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  /** Update a specific field in the RFQ data */
  const updateField = useCallback(
    <K extends keyof RFQData>(section: K, value: RFQData[K]) => {
      setRFQData((prev) => {
        const updated = { ...prev, [section]: value };
        if (typeof window !== "undefined") {
          localStorage.setItem("rfqData", JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  /** Add a line item */
  const addLineItem = useCallback(() => {
    setRFQData((prev) => {
      const newItem = createEmptyLineItem(prev.lineItems.length + 1);
      const updated = { ...prev, lineItems: [...prev.lineItems, newItem] };
      localStorage.setItem("rfqData", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Update a specific line item */
  const updateLineItem = useCallback((id: string, updates: Partial<LineItem>) => {
    setRFQData((prev) => {
      const updated = {
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      };
      localStorage.setItem("rfqData", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Remove a line item */
  const removeLineItem = useCallback((id: string) => {
    setRFQData((prev) => {
      const filtered = prev.lineItems.filter((item) => item.id !== id);
      // Reorder slNo
      const reordered = filtered.map((item, idx) => ({
        ...item,
        slNo: idx + 1,
      }));
      const updated = { ...prev, lineItems: reordered };
      localStorage.setItem("rfqData", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /** Add a chat message */
  const addMessage = useCallback(
    (role: "user" | "assistant", content: string) => {
      const msg: ChatMessage = {
        id: generateId(),
        role,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const updated = [...prev, msg];
        localStorage.setItem("rfqMessages", JSON.stringify(updated));
        return updated;
      });
      return msg;
    },
    []
  );

  /** Highlight fields that were just updated by AI */
  const highlightUpdatedFields = useCallback((fields: string[]) => {
    setHighlightedFields(fields);
    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightedFields([]), 3000);
  }, []);

  /** Reset everything */
  const resetRFQ = useCallback(() => {
    const fresh = {
      ...defaultRFQData,
      createdAt: new Date().toISOString(),
      rfqNumber: defaultRFQData.rfqNumber,
    };
    setRFQData(fresh);
    setMessages([]);
    setHighlightedFields([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("rfqData");
      localStorage.removeItem("rfqMessages");
    }
  }, []);

  /** Update language */
  const updateLanguage = useCallback((lang: string) => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("rfqLanguage", lang);
    }
  }, []);

  return {
    rfqData,
    updateRFQData,
    updateField,
    addLineItem,
    updateLineItem,
    removeLineItem,
    messages,
    setMessages,
    addMessage,
    isLoading,
    setIsLoading,
    hasHydrated,
    highlightedFields,
    highlightUpdatedFields,
    resetRFQ,
    language,
    updateLanguage,
  };
}
