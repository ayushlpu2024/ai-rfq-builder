"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-scrolls a container to the bottom whenever `dependency` changes.
 * Used to keep the chat scrolled to the latest message.
 */
export function useAutoScroll<T>(dependency: T) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dependency]);

  return bottomRef;
}
