"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon, X } from "lucide-react";

export interface SearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export default function Search({
  placeholder = "Search players, games...",
  value: controlledValue,
  onChange,
  onSearch,
  debounceMs = 250,
  className = "",
}: SearchProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "");

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onSearch]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextVal = e.target.value;
    setInternalValue(nextVal);
    if (onChange) onChange(nextVal);
  }

  function handleClear() {
    setInternalValue("");
    if (onChange) onChange("");
    if (onSearch) onSearch("");
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <SearchIcon
        size={16}
        className="absolute left-3.5 text-[var(--color-text-muted)] pointer-events-none"
      />

      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
      />

      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition p-0.5 rounded cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
