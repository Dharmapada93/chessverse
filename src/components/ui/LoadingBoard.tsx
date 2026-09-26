import React from "react";

export interface LoadingBoardProps {
  label?: string;
  sizePx?: number;
  className?: string;
}

export default function LoadingBoard({
  label = "Loading game...",
  sizePx = 480,
  className = "",
}: LoadingBoardProps) {
  // Generate 8x8 squares for subtle skeleton checkerboard
  const squares = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const isDark = (row + col) % 2 === 1;
    return { id: i, isDark };
  });

  return (
    <div
      role="status"
      aria-label={label}
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ maxWidth: sizePx, width: "100%" }}
    >
      {/* Subtle Skeleton Chessboard Grid */}
      <div
        className="w-full aspect-square rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden grid grid-cols-8 shadow-md"
        style={{
          backgroundColor: "var(--color-surface)",
        }}
      >
        {squares.map((sq) => (
          <div
            key={sq.id}
            className="transition-opacity duration-300"
            style={{
              backgroundColor: sq.isDark
                ? "rgba(255, 255, 255, 0.03)"
                : "rgba(255, 255, 255, 0.07)",
            }}
          />
        ))}
      </div>

      {/* Floating Quiet Status Pill */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-[var(--radius-md)]">
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 py-2 shadow-lg backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <span className="text-xs font-medium text-[var(--color-text)]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
