"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { User, Layers } from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

/**
 * Render simple markdown: **bold**, *italic*, bullet lists, and newlines.
 */
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Bullet point
    if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[•\-*]\s+/, "");
      elements.push(
        <div key={lineIdx} className="flex gap-2 pl-1 py-0.5">
          <span className="text-amber-500 mt-0.5">•</span>
          <span>{renderInline(bulletText)}</span>
        </div>
      );
      return;
    }

    // Empty line = line break
    if (trimmed === "") {
      elements.push(<br key={lineIdx} />);
      return;
    }

    // Normal text
    elements.push(
      <span key={lineIdx}>
        {renderInline(trimmed)}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });

  return elements;
}

/** Render inline markdown: **bold** and *italic* */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // Bold
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic
      parts.push(<em key={match.index}>{match[3]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 w-full animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
          isUser
            ? "bg-gradient-to-br from-amber-500 to-orange-500"
            : "bg-gradient-to-br from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800"
        )}
      >
        {isUser ? <User size={16} /> : <Layers size={16} />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "relative max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-sm"
            : "bg-white/90 dark:bg-white/8 text-gray-800 dark:text-gray-100 rounded-tl-sm border border-gray-200/60 dark:border-white/8 backdrop-blur-sm"
        )}
      >
        {isUser ? content : renderMarkdown(content)}
        {isStreaming && (
          <span className="inline-flex gap-0.5 ml-1.5 opacity-70">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-current animate-bounce"
                style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
