"use client";

import React from "react";
import Search from "@/components/ui/Search";

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  options?: FilterOption[];
  selectedOption?: string;
  onOptionChange?: (opt: string) => void;
  className?: string;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Filter results...",
  options,
  selectedOption,
  onOptionChange,
  className = "",
}: FilterBarProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}
    >
      {onSearchChange && (
        <div className="w-full sm:max-w-xs">
          <Search
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      )}

      {options && options.length > 0 && onOptionChange && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {options.map((opt) => {
            const isSelected = opt.id === selectedOption;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onOptionChange(opt.id)}
                className={`rounded-[var(--radius-md)] px-3 py-1.5 text-xs font-medium transition cursor-pointer select-none whitespace-nowrap ${
                  isSelected
                    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/40 font-semibold"
                    : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
