"use client";

import React, { useRef } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}: TabsProps) {
  const tabListRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex: number | null = null;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      onChange(tabs[nextIndex].id);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>("button");
      buttons?.[nextIndex]?.focus();
    }
  }

  return (
    <div
      ref={tabListRef}
      role="tablist"
      className={`flex items-center gap-1 border-b border-[var(--color-border)] p-1 overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center gap-2 rounded-[var(--radius-sm)] px-3.5 py-2 text-xs font-medium transition-all duration-120 outline-none cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              isActive
                ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)] font-semibold border border-[var(--color-border)] shadow-xs"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive
                    ? "bg-[var(--color-primary)] text-black"
                    : "bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
