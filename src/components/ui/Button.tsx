"use client";

import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline"
  | "icon";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-primary)] text-black font-semibold shadow-xs hover:bg-[var(--color-primary-hover)] active:scale-[0.98] border border-transparent",
  secondary:
    "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] font-medium hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border)] active:scale-[0.98]",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] active:scale-[0.98]",
  danger:
    "border border-red-500/25 bg-red-500/10 text-red-300 font-medium hover:bg-red-500/20 hover:text-red-200 active:scale-[0.98]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98]",
  icon:
    "p-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-[var(--radius-sm)] gap-1.5 min-h-[32px]",
  md: "px-4 py-2.5 text-sm rounded-[var(--radius-md)] gap-2 min-h-[40px]",
  lg: "px-6 py-3.5 text-base rounded-[var(--radius-lg)] gap-2.5 min-h-[48px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        className={[
          "inline-flex items-center justify-center select-none font-sans",
          "transition-all duration-120 outline-none cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
          variantStyles[variant],
          variant !== "icon" ? sizeStyles[size] : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5 shrink-0"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
