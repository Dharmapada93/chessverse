"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  isDangerous?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger?: React.ReactNode;
  label?: string;
  items: (DropdownItem | "divider")[];
  align?: "left" | "right";
  className?: string;
}

export default function Dropdown({
  trigger,
  label = "Options",
  items,
  align = "right",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button
            type="button"
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition cursor-pointer"
          >
            <span>{label}</span>
            <ChevronDown size={14} className="text-[var(--color-text-muted)]" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={`absolute ${
            align === "right" ? "right-0" : "left-0"
          } mt-2 z-50 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1.5 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-100`}
        >
          {items.map((item, index) => {
            if (item === "divider") {
              return (
                <div
                  key={`div-${index}`}
                  className="my-1 border-t border-[var(--color-border-subtle)]"
                  role="separator"
                />
              );
            }

            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-xs font-medium text-left transition cursor-pointer outline-none focus-visible:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed ${
                  item.isDangerous
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                }`}
              >
                {item.icon && <span className="shrink-0 text-sm">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
