import React from "react";
import Link from "next/link";

export type LogoVariant = "full" | "compact" | "wordmark";
export type LogoSize = "sm" | "md" | "lg";

export interface ChessVerseLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  className?: string;
}

const sizeConfig = {
  sm: {
    container: "gap-2",
    iconBox: "h-7 w-7 text-sm rounded-lg",
    text: "text-sm tracking-tight",
    tagline: "text-[10px]",
  },
  md: {
    container: "gap-2.5",
    iconBox: "h-8 w-8 text-base rounded-lg",
    text: "text-base tracking-tight",
    tagline: "text-xs",
  },
  lg: {
    container: "gap-3",
    iconBox: "h-10 w-10 text-xl rounded-xl",
    text: "text-xl tracking-tight",
    tagline: "text-sm",
  },
};

export default function ChessVerseLogo({
  variant = "full",
  size = "md",
  href = "/",
  className = "",
}: ChessVerseLogoProps) {
  const currentSize = sizeConfig[size];

  const content = (
    <div
      className={`inline-flex items-center select-none ${currentSize.container} ${className}`}
      aria-label="ChessVerse"
    >
      {/* Icon Mark: Compact & Full */}
      {variant !== "wordmark" && (
        <span
          className={`flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] font-serif shadow-xs ${currentSize.iconBox}`}
          aria-hidden="true"
        >
          ♞
        </span>
      )}

      {/* Wordmark: Wordmark & Full */}
      {variant !== "compact" && (
        <span className={`font-semibold text-[var(--color-text)] ${currentSize.text}`}>
          Chess<span className="text-[var(--color-primary)] font-bold">Verse</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus-visible:rounded-lg p-0.5 transition-opacity hover:opacity-90"
        aria-label="ChessVerse home"
      >
        {content}
      </Link>
    );
  }

  return content;
}
