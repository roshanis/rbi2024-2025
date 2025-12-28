"use client";

import { useState, useMemo } from "react";
import { formatIndianNumber, formatCurrency, formatPercentage } from "@/lib/formatters";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  format?: "number" | "currency" | "percentage" | "text";
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKey?: keyof T;
  pageSize?: number;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchKey,
  pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search || !searchKey) return data;
    return data.filter((row) =>
      String(row[searchKey]).toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search, searchKey]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const isEmpty = paginatedData.length === 0;
  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const formatValue = (value: unknown, format?: string): string => {
    if (value === null || value === undefined) return "-";
    switch (format) {
      case "currency":
        return formatCurrency(Number(value));
      case "percentage":
        return formatPercentage(Number(value));
      case "number":
        return formatIndianNumber(Number(value));
      default:
        return String(value);
    }
  };

  return (
    <div className="surface-card overflow-hidden">
      {searchable && searchKey && (
        <div className="p-4 border-b border-slate-200/70 bg-white/60">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-xs px-4 py-2.5 rounded-full border border-slate-200 bg-white/80 text-sm text-slate-700 placeholder-slate-400 shadow-sm focus:ring-2 focus:ring-[#0b2d52]/30 focus:border-transparent outline-none"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    col.sortable !== false ? "cursor-pointer hover:bg-slate-100/70" : ""
                  }`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable !== false && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable !== false && sortKey === String(col.key) && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {isEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No results found for the current filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/70 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-6 py-4 text-sm text-slate-900 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(row[col.key as keyof T], row)
                        : formatValue(row[col.key as keyof T], col.format)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200/70 bg-white/60 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50/80"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50/80"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
