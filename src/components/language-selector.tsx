"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const LANGUAGES = [
  { id: "english", label: "English", icon: "🇺🇸" },
  { id: "hinglish", label: "Hinglish", icon: "🇮🇳" },
  { id: "hindi", label: "Hindi (हिन्दी)", icon: "🇮🇳" },
  { id: "marathi", label: "Marathi (मराठी)", icon: "🇮🇳" },
  { id: "bengali", label: "Bengali (বাংলা)", icon: "🇮🇳" },
  { id: "telugu", label: "Telugu (తెలుగు)", icon: "🇮🇳" },
  { id: "tamil", label: "Tamil (தமிழ்)", icon: "🇮🇳" },
  { id: "gujarati", label: "Gujarati (ગુજરાતી)", icon: "🇮🇳" },
  { id: "urdu", label: "Urdu (اردو)", icon: "🇮🇳" },
  { id: "kannada", label: "Kannada (ಕನ್ನಡ)", icon: "🇮🇳" },
  { id: "odia", label: "Odia (ଓଡ଼િଆ)", icon: "🇮🇳" },
  { id: "malayalam", label: "Malayalam (മലയാളം)", icon: "🇮🇳" },
  { id: "punjabi", label: "Punjabi (ਪੰਜਾਬী)", icon: "🇮🇳" },
];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = LANGUAGES.find((l) => l.id === currentLanguage) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 shadow-sm",
          "bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10",
          "hover:border-amber-300 dark:hover:border-amber-500/30 hover:bg-amber-50/30 dark:hover:bg-amber-500/5",
          isOpen && "ring-2 ring-amber-500/20 border-amber-500"
        )}
      >
        <Globe size={14} className="text-gray-400 dark:text-gray-500" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {selectedLang.icon} {selectedLang.label}
        </span>
        <ChevronDown size={14} className={cn("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-100 dark:border-white/5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                autoFocus
                type="text"
                placeholder="Search language..."
                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none ring-1 ring-gray-200 dark:ring-white/10 focus:ring-amber-500/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    onLanguageChange(lang.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-lg text-left transition-colors",
                    currentLanguage === lang.id
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <span className="text-xs font-medium">
                    {lang.icon} {lang.label}
                  </span>
                  {currentLanguage === lang.id && <Check size={12} className="text-amber-500" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-xs text-gray-400">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
