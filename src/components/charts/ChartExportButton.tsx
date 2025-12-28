"use client";

import { useCallback } from "react";
import { toPng } from "html-to-image";

interface ChartExportButtonProps {
  chartRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
  className?: string;
}

export default function ChartExportButton({
  chartRef,
  filename = "chart",
  className = "",
}: ChartExportButtonProps) {
  const handleExport = useCallback(async () => {
    if (!chartRef.current) {
      console.error("Chart reference not available");
      return;
    }

    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export chart:", error);
    }
  }, [chartRef, filename]);

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-700 hover:text-[#0b2d52] text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0b2d52]/40 ${className}`}
      title="Export chart as PNG"
      aria-label="Export chart as PNG image"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      <span className="hidden sm:inline">Export PNG</span>
    </button>
  );
}
