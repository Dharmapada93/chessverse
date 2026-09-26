"use client";

import React from "react";
import Dropdown, { DropdownItem } from "@/components/ui/Dropdown";
import { MoreVertical } from "lucide-react";

export interface ActionMenuProps {
  actions: (DropdownItem | "divider")[];
  className?: string;
}

export default function ActionMenu({ actions, className = "" }: ActionMenuProps) {
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          aria-label="Row actions"
          className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition cursor-pointer"
        >
          <MoreVertical size={14} />
        </button>
      }
      items={actions}
      align="right"
      className={className}
    />
  );
}
