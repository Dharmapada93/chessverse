import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs ${className}`}
    >
      {/* Icon Container */}
      <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-elevated)] text-2xl text-[var(--color-primary)] mb-4 shadow-xs">
        {icon || <span aria-hidden="true">♟</span>}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)] tracking-tight">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="md">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
