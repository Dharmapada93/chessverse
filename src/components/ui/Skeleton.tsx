import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-md)] bg-white/[0.06] ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({
  lines = 2,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded-[var(--radius-sm)] bg-white/[0.06] animate-pulse ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ sizePx = 36 }: { sizePx?: number }) {
  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className="shrink-0 rounded-[var(--radius-md)] bg-white/[0.06] animate-pulse"
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-4 animate-pulse ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar sizePx={40} />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 w-1/3 rounded bg-white/10" />
          <div className="h-2.5 w-1/4 rounded bg-white/5" />
        </div>
      </div>
      <div className="h-10 rounded-[var(--radius-md)] bg-white/[0.04]" />
    </div>
  );
}

export function SkeletonGame() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex justify-between items-center">
        <div className="h-4 w-16 rounded bg-white/10" />
        <div className="h-4 w-20 rounded bg-white/5" />
      </div>
      <div className="flex justify-between items-center py-2 border-y border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-white/10" />
          <div className="h-3 w-20 rounded bg-white/10" />
        </div>
        <div className="text-xs text-white/30">VS</div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-20 rounded bg-white/10" />
          <div className="h-7 w-7 rounded bg-white/10" />
        </div>
      </div>
      <div className="h-8 rounded-[var(--radius-md)] bg-white/[0.05]" />
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
      aria-hidden="true"
    >
      <div className="h-10 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]" />
      <div className="divide-y divide-[var(--color-border-subtle)]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3.5 animate-pulse">
            <div className="h-3.5 w-1/4 rounded bg-white/10" />
            <div className="h-3.5 w-1/5 rounded bg-white/5" />
            <div className="h-3.5 w-1/6 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
