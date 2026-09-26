"use client";

import React from "react";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "surface" | "primary" | "danger";
}

const sizeConfig = {
  sm: "h-8 w-8 min-w-[32px] p-1.5 text-xs rounded-[var(--radius-sm)]",
  md: "h-10 w-10 min-w-[40px] p-2 text-sm rounded-[var(--radius-md)]",
  lg: "h-11 w-11 min-w-[44px] p-2.5 text-base rounded-[var(--radius-lg)]",
};

const variantConfig = {
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
  surface:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] shadow-xs",
  primary:
    "bg-[var(--color-primary)] text-black font-bold hover:bg-[var(--color-primary-hover)] shadow-xs",
  danger:
    "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300",
};

export default function IconButton({
  icon,
  label,
  size = "md",
  variant = "surface",
  className = "",
  disabled,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-120 cursor-pointer outline-none select-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] disabled:opacity-40 disabled:cursor-not-allowed ${sizeConfig[size]} ${variantConfig[variant]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
}
