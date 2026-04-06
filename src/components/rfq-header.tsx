"use client";

import React from "react";
import { LanguageSelector } from "@/components/language-selector";
import { Moon, Sun, RotateCcw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface RFQHeaderProps {
  isDark: boolean;
  onToggleDark: () => void;
  onReset: () => void;
  rfqNumber: string;
  language: string;
  onLanguageChange: (lang: string) => void;
}

export function RFQHeader({
  isDark,
  onToggleDark,
  onReset,
  rfqNumber,
  language,
  onLanguageChange,
}: RFQHeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 py-2.5 border-b border-gray-200/60 dark:border-white/8 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
          <Layers size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent leading-tight">
            MetalRFQ
          </h1>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium -mt-0.5">
            AI-Powered RFQ Builder for Metals
          </p>
        </div>
      </div>

      {/* Center — RFQ Number badge & Language Support */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 shadow-sm shadow-amber-500/5">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
            {rfqNumber}
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm shadow-emerald-500/5">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span>🇮🇳</span>
            Regional Languages Support
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} />
        
        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 flex lg:hidden xl:flex" />

        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            title="New RFQ"
            className={cn(
              "p-2 rounded-lg text-gray-500 dark:text-gray-400 transition-all duration-200",
              "hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
            )}
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onToggleDark}
            title="Toggle dark mode"
            className={cn(
              "p-2 rounded-lg text-gray-500 dark:text-gray-400 transition-all duration-200",
              "hover:bg-gray-100 dark:hover:bg-white/5"
            )}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
