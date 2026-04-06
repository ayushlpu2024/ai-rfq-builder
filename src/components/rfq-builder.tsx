"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RFQData, PAYMENT_TERMS } from "@/types/rfq";
import { useRFQStore } from "@/hooks/use-rfq-store";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { RFQHeader } from "@/components/rfq-header";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import { TypingIndicator } from "@/components/typing-indicator";
import { RFQFormPanel } from "@/components/rfq-form-panel";
import { RFQDownload } from "@/components/rfq-download";
import { RFQBillTemplate } from "@/components/rfq-bill-template";
// defaults used by useRFQStore
import {
  MessageSquare,
  FileText,
  Sparkles,
  Package,
  Zap,
} from "lucide-react";




/** Quick action suggestions shown when chat is empty */
const QUICK_ACTIONS = [
  {
    icon: <Package size={16} />,
    label: "SS 304 Sheets",
    prompt: "I need 5 MT of SS 304 sheets, 2mm thick, size 1250x2500mm, 2B finish",
  },
  {
    icon: <Zap size={16} />,
    label: "MS Plates",
    prompt: "We need MS plates IS 2062 E250, 12mm and 16mm thickness, 10 MT each, for structural use",
  },
  {
    icon: <Package size={16} />,
    label: "Aluminium Coils",
    prompt: "Need quotation for Aluminium 3003-H14 coils, 0.5mm thick, 1000mm width, 3 MT",
  },
  {
    icon: <Zap size={16} />,
    label: "GI Pipes (Hindi)",
    prompt: "हमें GI पाइप चाहिए, 1 इंच और 2 इंच, B-class, 200 पीस, 6 मीटर लम्बाई",
  },
];

export default function RFQBuilder() {
  const {
    rfqData,
    updateRFQData,
    updateField,
    addLineItem,
    updateLineItem,
    removeLineItem,
    messages,
    addMessage,
    isLoading,
    setIsLoading,
    hasHydrated,
    highlightedFields,
    highlightUpdatedFields,
    resetRFQ,
    language,
    updateLanguage,
  } = useRFQStore();

  const { isDark, toggle: toggleDark } = useDarkMode();
  const bottomRef = useAutoScroll(messages);
  const [streamingText, setStreamingText] = useState("");
  const [mobileTab, setMobileTab] = useState<"chat" | "form">("chat");

  // ── Initial greeting (only after hydration completes) ──
  useEffect(() => {
    if (hasHydrated && messages.length === 0) {
      addMessage(
        "assistant",
        "Welcome to **MetalRFQ** 🔩\n\nI'm your AI procurement assistant for the metals industry. You can describe your requirements in **English** or any **Indian Regional Language** (Hindi, Telugu, Bengali, Tamil, etc.).\n\n**Try something like:**\n• \"मुझे 10 MT MS प्लेट चाहिए IS 2062\"\n• \"SS 304 sheet venum, 2mm thickness\"\n• \"I need 5 MT of SS 304 sheets, 2mm thick\"\n\nTell me what materials you need, and I'll fill the form in English for you! 👇"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // ── Handle user message — single unified AI call with streaming ──
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsLoading(true);
      setStreamingText("");
      addMessage("user", text);

      try {
        const history = messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessage: text,
            rfqData: rfqData,
            conversationHistory: history,
            language: language,
          }),
        });

        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedMessage = "";
        let hasStartedStreaming = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedMessage += chunk;
          hasStartedStreaming = true;
          
          // Only show text before the JSON tag in the typing effect
          const displayPart = accumulatedMessage.split("<rfq_json>")[0];
          setStreamingText(displayPart.trim());
        }


        // ── Post-processing after stream finish ──
        let assistantMessage = accumulatedMessage;
        let extractedJson = "";

        if (accumulatedMessage.includes("<rfq_json>")) {
          const parts = accumulatedMessage.split("<rfq_json>");
          assistantMessage = parts[0].trim();
          const jsonPart = parts[1].split("</rfq_json>")[0].trim();
          extractedJson = jsonPart;
        }

        if (extractedJson) {
          try {
            const parsed = JSON.parse(extractedJson) as {
              updatedData?: RFQData;
              fieldsUpdated?: string[];
            };

            if (parsed.updatedData) {
              updateRFQData(parsed.updatedData);
              
              if (parsed.fieldsUpdated) {
                highlightUpdatedFields(parsed.fieldsUpdated);
              }
              
              if (window.innerWidth < 1024) {
                setTimeout(() => setMobileTab("form"), 500);
              }
            }
          } catch (err) {
            console.error("Failed to parse extracted RFQ JSON:", err);
          }
        }

        addMessage("assistant", assistantMessage || "I've updated the RFQ based on your input.");
      } catch (err) {
        console.error("Chat error:", err);
        addMessage(
          "assistant",
          "I'm sorry, I encountered an error processing your request. Please try again."
        );
      } finally {
        setStreamingText("");
        setIsLoading(false);
      }
    },
    [addMessage, rfqData, messages, updateRFQData, highlightUpdatedFields, setIsLoading, language]
  );



  // ── Reset handler ──
  const handleReset = useCallback(() => {
    if (window.confirm("Start a new RFQ? This will clear the current form and chat.")) {
      resetRFQ();
      setTimeout(() => {
        addMessage(
          "assistant",
          "Fresh RFQ created! 🔩\n\nTell me what metals you need, and I'll build your RFQ. What materials are you looking for?"
        );
      }, 100);
    }
  }, [resetRFQ, addMessage]);

  // Wait for hydration
  if (!hasHydrated) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <RFQHeader
        isDark={isDark}
        onToggleDark={toggleDark}
        onReset={handleReset}
        rfqNumber={rfqData.rfqNumber}
        language={language}
        onLanguageChange={(lang) => {
          updateLanguage(lang);
          const langLabel = lang.charAt(0).toUpperCase() + lang.slice(1);
          addMessage("assistant", `Language switched to **${langLabel}**. We'll continue in ${langLabel} from now on. How can I help you?`);
        }}
      />

      {/* Mobile tab bar */}
      <div className="flex lg:hidden border-b border-gray-200/60 dark:border-white/8 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md">
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === "chat"
              ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
              : "text-gray-500 dark:text-gray-500"
          }`}
        >
          <MessageSquare size={16} />
          AI Chat
        </button>
        <button
          onClick={() => setMobileTab("form")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
            mobileTab === "form"
              ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
              : "text-gray-500 dark:text-gray-500"
          }`}
        >
          <FileText size={16} />
          RFQ Form
        </button>
      </div>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT: Chat Panel ── */}
        <div
          className={`flex flex-col w-full lg:w-[45%] xl:w-[40%] border-r border-gray-200/60 dark:border-white/8 ${
            mobileTab !== "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((msg) => {
              const isPaymentAsk = msg.role === "assistant" && msg.content.toLowerCase().includes("payment terms");
              const actions = isPaymentAsk ? PAYMENT_TERMS.map(t => ({ label: t, value: t, type: 'payment' })) : undefined;
              
              return (
                <ChatBubble 
                  key={msg.id} 
                  role={msg.role} 
                  content={msg.content} 
                  actions={actions}
                  onAction={(val, type) => {
                    if (type === 'payment') {
                      updateField('commercialTerms', { ...rfqData.commercialTerms, paymentTerms: val });
                      handleSend(`The user selected ${val} for payment terms. Update the form and confirm.`);
                    }
                  }}
                />
              );
            })}

            {/* Streaming text */}
            {isLoading && streamingText && (
              <ChatBubble role="assistant" content={streamingText} isStreaming />
            )}

            {/* Typing indicator */}
            {isLoading && !streamingText && <TypingIndicator />}

            {/* Quick actions — show when no user messages yet */}
            {messages.length <= 1 && !isLoading && (
              <div className="pt-2 space-y-2 animate-fade-in">
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
                  Quick Start
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action.prompt)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200/80 dark:border-white/8 bg-white/60 dark:bg-white/5 text-left hover:border-amber-300 dark:hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {action.label}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                          {action.prompt}
                        </p>
                      </div>
                      <Sparkles size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            placeholder="Describe the metals you need..."
          />
        </div>

        {/* ── RIGHT: RFQ Form Panel ── */}
        <div
          className={`flex flex-col w-full lg:w-[55%] xl:w-[60%] bg-gray-100/50 dark:bg-gray-900/50 ${
            mobileTab !== "form" ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200/60 dark:border-white/8 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                RFQ Form
              </span>
              {rfqData.lineItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  {rfqData.lineItems.length} item{rfqData.lineItems.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <RFQDownload rfqData={rfqData} />
          </div>

          {/* Form scroll area */}
          <div id="rfq-form-content" className="flex-1 overflow-y-auto">
            <RFQFormPanel
              data={rfqData}
              onUpdateField={updateField}
              onAddLineItem={addLineItem}
              onUpdateLineItem={updateLineItem}
              onRemoveLineItem={removeLineItem}
              highlightedFields={highlightedFields}
            />
          </div>
        </div>
      </div>

      {/* ── Hidden Bill Template for Export ── */}
      <div id="rfq-bill-container" style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" }}>
        <RFQBillTemplate data={rfqData} />
      </div>
    </div>
  );
}
