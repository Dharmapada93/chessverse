import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-3 ${className}`}
    >
      <div>
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--color-text)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>

      {actionLabel && (
        <div>
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition"
            >
              <span>{actionLabel}</span>
              <ChevronRight size={14} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
