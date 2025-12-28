"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";

export interface ExportColumn {
  key: string;
  label: string;
  format?: "number" | "currency" | "percentage" | "text";
}

interface ExportButtonProps<T> {
  data: T[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
  tone?: "blue" | "green" | "orange" | "teal";
  className?: string;
}

export default function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title,
  tone = "blue",
  className = "",
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format value for export (raw value, not display-formatted)
  const formatValueForExport = (value: unknown, format?: string): string | number => {
    if (value === null || value === undefined) return "";

    switch (format) {
      case "currency":
        return Number(value);
      case "percentage":
        return Number(value);
      case "number":
        return Number(value);
      default:
        return String(value);
    }
  };

  // Prepare data rows for export
  const prepareExportData = (): (string | number)[][] => {
    // Header row
    const headers = columns.map((col) => col.label);

    // Data rows
    const rows = data.map((row) =>
      columns.map((col) => formatValueForExport(row[col.key], col.format))
    );

    return [headers, ...rows];
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = prepareExportData();

    // Convert to CSV string
    const csvContent = exportData
      .map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quotes
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes('"') || cellStr.includes("\n")) {
              return '"' + cellStr.replace(/"/g, '""') + '"';
            }
            return cellStr;
          })
          .join(",")
      )
      .join("\n");

    // Create blob and download
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsOpen(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = prepareExportData();

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Set column widths based on content
    const colWidths = columns.map((col) => {
      const maxLength = Math.max(
        col.label.length,
        ...data.map((row) => String(row[col.key] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLength + 2, 10), 40) };
    });
    ws["!cols"] = colWidths;

    // Style header row (bold)
    const headerRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = { font: { bold: true } };
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, title || "Data");

    // Generate Excel file and download
    XLSX.writeFile(wb, filename + ".xlsx");

    setIsOpen(false);
  };

  const toneClasses = {
    blue: "bg-[#0b2d52] hover:bg-[#0a2547]",
    green: "bg-[#0f3b2f] hover:bg-[#0b2f25]",
    orange: "bg-[#b44b00] hover:bg-[#9c3f00]",
    teal: "bg-[#0b4b5c] hover:bg-[#083b49]",
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white transition-colors text-sm font-semibold shadow-sm ${toneClasses[tone]} ${className}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
        <svg
          className={"w-4 h-4 transition-transform " + (isOpen ? "rotate-180" : "")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 surface-card z-50 overflow-hidden">
          <ul className="py-1" role="menu" aria-orientation="vertical">
            <li role="none">
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 transition-colors"
                role="menuitem"
              >
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="text-left">
                  <span className="block font-medium">CSV</span>
                  <span className="block text-xs text-gray-500">Comma-separated values</span>
                </div>
              </button>
            </li>
            <li role="none">
              <button
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50/80 transition-colors"
                role="menuitem"
              >
                <svg
                  className="w-5 h-5 text-green-700"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M14.17 5L19 9.83V19H5V5h9.17M15 4H4v16h16V9l-5-5zM7 15h2v2H7v-2zm0-4h2v2H7v-2zm0-4h2v2H7V7zm6 8h4v2h-4v-2zm0-4h4v2h-4v-2zm0-4h4v2h-4V7z" />
                </svg>
                <div className="text-left">
                  <span className="block font-medium">Excel</span>
                  <span className="block text-xs text-gray-500">Microsoft Excel format</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
