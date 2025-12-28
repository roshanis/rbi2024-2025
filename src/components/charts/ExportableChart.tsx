"use client";

import { useRef, ReactNode } from "react";
import ChartExportButton from "./ChartExportButton";

interface ExportableChartProps {
  children: ReactNode;
  title: string;
  filename?: string;
  className?: string;
}

export default function ExportableChart({
  children,
  title,
  filename,
  className = "",
}: ExportableChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate filename from title if not provided
  const exportFilename = filename || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className={`group relative ${className}`}>
      {/* Export button - appears on hover */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ChartExportButton
          chartRef={chartRef}
          filename={exportFilename}
        />
      </div>

      {/* Chart container with title for export */}
      <div
        ref={chartRef}
        className="surface-card p-4 md:p-6"
      >
        {/* Title included in export */}
        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          {title}
        </h3>

        {/* Chart content */}
        <div className="chart-content">
          {children}
        </div>
      </div>
    </div>
  );
}
