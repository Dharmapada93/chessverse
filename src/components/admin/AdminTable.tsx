import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export default function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "No records found.",
  className = "",
}: AdminTableProps<T>) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs ${className}`}
    >
      <table className="w-full text-left text-xs text-[var(--color-text)] border-collapse">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] uppercase tracking-wider text-[10px] text-[var(--color-text-muted)] font-semibold">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3.5 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-subtle)]">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-xs text-[var(--color-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="hover:bg-[var(--color-surface-hover)] transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 ${col.className || ""}`}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
