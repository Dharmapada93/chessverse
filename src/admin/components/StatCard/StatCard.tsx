"use client";

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: string;
  subtitle?: string;
  statusBadge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  subtitle,
  statusBadge,
}) => {
  return (
    <div className="p-4 md:p-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs flex flex-col justify-between transition-all hover:border-[var(--color-primary)]/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
          {title}
        </span>
        {icon && <span className="text-lg opacity-80">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)]">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        {subtitle && <span>{subtitle}</span>}
        {statusBadge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            {statusBadge}
          </span>
        )}
      </div>
    </div>
  );
};
