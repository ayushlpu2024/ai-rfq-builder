"use client";

import { useState, useCallback, useEffect } from "react";
import type { RFQData, ChatMessage, LineItem } from "@/types/rfq";
import { defaultRFQData, createEmptyLineItem } from "@/lib/rfq-defaults";
import { generateId } from "@/lib/utils";

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
        // Merge with defaults to handle new schema fields (like addressInfo or structured dimensions)
        setRFQData({
          ...defaultRFQData,
          ...parsed,
          buyerInfo: { ...defaultRFQData.buyerInfo, ...parsed.buyerInfo },
          addressInfo: { ...defaultRFQData.addressInfo, ...parsed.addressInfo },
          deliveryTerms: { ...defaultRFQData.deliveryTerms, ...parsed.deliveryTerms },
          commercialTerms: { ...defaultRFQData.commercialTerms, ...parsed.commercialTerms },
          qualityRequirements: { ...defaultRFQData.qualityRequirements, ...parsed.qualityRequirements },
          additionalInfo: { ...defaultRFQData.additionalInfo, ...parsed.additionalInfo },
          lineItems: parsed.lineItems.map(item => ({
            ...item,
            dimensions: typeof item.dimensions === 'string' ? { custom: item.dimensions } : item.dimensions
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

  /** Persist RFQ data with merging */
  const updateRFQData = useCallback((newData: RFQData) => {
    setRFQData((prev) => {
      const merged = {
        ...prev,
        ...newData,
        buyerInfo: { ...prev.buyerInfo, ...newData.buyerInfo },
        addressInfo: {
          ...prev.addressInfo,
          ...newData.addressInfo,
          deliveryAddress: { ...prev.addressInfo.deliveryAddress, ...newData.addressInfo?.deliveryAddress },
          billingAddress: { ...prev.addressInfo.billingAddress, ...newData.addressInfo?.billingAddress },
        },
        deliveryTerms: { ...prev.deliveryTerms, ...newData.deliveryTerms },
        commercialTerms: { ...prev.commercialTerms, ...newData.commercialTerms },
        qualityRequirements: { ...prev.qualityRequirements, ...newData.qualityRequirements },
        additionalInfo: { ...prev.additionalInfo, ...newData.additionalInfo },
        // Line items are handled differently (usually replaced or appended by AI logic)
        lineItems: newData.lineItems || prev.lineItems,
      };

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
