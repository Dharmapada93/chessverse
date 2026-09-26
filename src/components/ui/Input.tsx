"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";

export type InputState = "default" | "error" | "success";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  inputState?: InputState;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputState = error ? "error" : "default",
      leftIcon,
      type = "text",
      className = "",
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    const stateStyles: Record<InputState, string> = {
      default:
        "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]",
      error:
        "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500",
      success:
        "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500",
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[var(--color-text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled}
            aria-invalid={inputState === "error"}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            className={`w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-all duration-120 disabled:opacity-40 disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${isPassword || inputState === "success" || inputState === "error" ? "pr-10" : "pr-3.5"} ${
              stateStyles[inputState]
            } ${className}`}
            {...props}
          />

          {/* Password visibility toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition p-0.5 rounded cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}

          {/* State icon indicators */}
          {!isPassword && inputState === "error" && (
            <AlertCircle size={16} className="absolute right-3 text-red-400 pointer-events-none" />
          )}
          {!isPassword && inputState === "success" && (
            <Check size={16} className="absolute right-3 text-emerald-400 pointer-events-none" />
          )}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="text-xs text-red-400">
            {error}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-[var(--color-text-muted)]">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-all duration-120 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed ${
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
