"use client";

import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  // Mobile card view renderer fallback (R6.54)
  renderMobileCard?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No records found.",
  currentPage = 1,
  totalPages = 1,
  totalItems,
  onPageChange,
  renderMobileCard,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-12 text-center text-sm text-[var(--color-text-secondary)]">
        <span className="inline-block animate-spin mr-2">◌</span>
        Loading administrative data...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-12 text-center text-sm text-[var(--color-text-secondary)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] overflow-hidden shadow-xs">
      {/* Desktop & Tablet Table (R6.53) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs md:text-sm divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-bg)] text-[var(--color-text-secondary)] uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-text)]">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.className || ""}`}>
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards (R6.54) */}
      <div className="md:hidden divide-y divide-[var(--color-border)]">
        {data.map((item) => (
          <div key={keyExtractor(item)} className="p-4 space-y-2 text-xs">
            {renderMobileCard ? (
              renderMobileCard(item)
            ) : (
              <div className="space-y-1.5">
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between items-center py-0.5">
                    <span className="text-[var(--color-text-secondary)] font-medium text-[11px]">
                      {col.header}
                    </span>
                    <span className="text-[var(--color-text)]">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination Controls (R6.57) */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <div>
            Showing page <span className="font-semibold text-[var(--color-text)]">{currentPage}</span> of{" "}
            <span className="font-semibold text-[var(--color-text)]">{totalPages}</span>
            {totalItems !== undefined && (
              <span className="ml-1">({totalItems} total)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
            >
              Prev
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
