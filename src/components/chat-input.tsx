"use client";

import React, { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Describe the metals you need...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-3 bg-white/70 dark:bg-white/5 border-t border-gray-200/60 dark:border-white/8 backdrop-blur-md"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-xl px-4 py-3 text-sm bg-gray-100/80 dark:bg-white/8",
          "border border-gray-200/60 dark:border-white/8",
          "text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40",
          "transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className={cn(
          "flex-shrink-0 p-3 rounded-xl text-white transition-all duration-200",
          "bg-gradient-to-r from-amber-500 to-orange-500",
          "hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25",
          "active:scale-95",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
        )}
      >
        <SendHorizonal size={18} />
      </button>
    </form>
  );
}
