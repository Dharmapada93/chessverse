"use client";

import React, { useState } from "react";

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
}

const positionStyles = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({
  content,
  children,
  position = "top",
  delayMs = 150,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  function handleMouseEnter() {
    const id = setTimeout(() => setIsVisible(true), delayMs);
    setTimeoutId(id);
  }

  function handleMouseLeave() {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-tooltip)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] shadow-md pointer-events-none animate-in fade-in duration-100 ${positionStyles[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
