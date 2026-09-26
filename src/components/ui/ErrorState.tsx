import React from "react";
import Button from "@/components/ui/Button";
import { AlertCircle, WifiOff } from "lucide-react";

export interface ErrorStateProps {
  type?: "error" | "connection";
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorState({
  type = "error",
  title,
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  const isConnection = type === "connection";

  const defaultTitle = isConnection ? "Connection lost" : "Something went wrong.";
  const defaultMessage = isConnection
    ? "We're trying to reconnect you to the game."
    : "We couldn't load this information. Try again in a moment.";

  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs ${className}`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-[var(--radius-md)] border mb-4 shadow-xs ${
          isConnection
            ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
            : "border-red-500/20 bg-red-500/10 text-red-400"
        }`}
      >
        {isConnection ? <WifiOff size={24} /> : <AlertCircle size={24} />}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)] tracking-tight">
        {title || defaultTitle}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {message || defaultMessage}
      </p>

      {isConnection && (
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-400 font-medium">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Reconnecting...</span>
        </div>
      )}

      {onRetry && (
        <div className="mt-6">
          <Button variant="secondary" size="md" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
