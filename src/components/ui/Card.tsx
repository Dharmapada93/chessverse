import React from "react";

export type CardVariant = "standard" | "interactive" | "stat" | "elevated";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children?: React.ReactNode;
}

export function Card({
  variant = "standard",
  children,
  className = "",
  ...props
}: CardProps) {
  const variantStyles: Record<CardVariant, string> = {
    standard:
      "border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs",
    interactive:
      "border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-primary)] cursor-pointer transition-all duration-120 shadow-xs focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
    elevated:
      "border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-md",
    stat:
      "border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs",
  };

  return (
    <div
      className={`rounded-[var(--radius-lg)] p-5 sm:p-6 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  delta,
  isPositive = true,
  icon,
  subtitle,
  className = "",
}: StatCardProps) {
  return (
    <Card variant="standard" className={`flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          {title}
        </span>
        {icon && (
          <div className="text-[var(--color-text-muted)] text-base">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text)] font-mono">
          {value}
        </span>
        {delta && (
          <span
            className={`text-xs font-medium ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {subtitle}
        </p>
      )}
    </Card>
  );
}

export default Card;
