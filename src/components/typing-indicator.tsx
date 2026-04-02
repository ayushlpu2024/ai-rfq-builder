"use client";

import React from "react";
import { Layers, Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1.5 animate-fade-in group">
      <div className="flex items-center gap-2 pl-1 mb-0.5">
        <Sparkles size={12} className="text-amber-500 animate-pulse" />
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          MetalRFQ AI is thinking
        </span>
      </div>
      
      <div className="flex items-start gap-3">
        {/* Avatar with pulse ring */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800 text-white border border-white/10 shadow-lg">
            <Layers size={14} className="animate-pulse" />
          </div>
        </div>

        {/* Premium Glass Bubble */}
        <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-white/90 dark:bg-white/8 border border-gray-200/60 dark:border-white/10 backdrop-blur-md shadow-sm flex items-center">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 shadow-sm animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

