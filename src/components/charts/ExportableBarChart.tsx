"use client";

import { useRef, useCallback } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatIndianNumber, formatCurrency } from "@/lib/formatters";
import { toPng } from "html-to-image";

interface ExportableBarChartProps {
  data: Array<{ name: string; value: number; [key: string]: unknown }>;
  title: string;
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  gradientColors?: [string, string];
  height?: number;
  format?: "number" | "currency";
  horizontal?: boolean;
  showGrid?: boolean;
  topN?: number;
  filename?: string;
}

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
};

const interpolateColor = (start: string, end: string, ratio: number) => {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  if (!startRgb || !endRgb) return start;
  const clamped = Math.min(Math.max(ratio, 0), 1);
  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * clamped);
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * clamped);
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
};

export default function ExportableBarChart({
  data,
  title,
  dataKey = "value",
  xAxisKey = "name",
  color = "#003366",
  gradientColors,
  height = 400,
  format = "number",
  horizontal = false,
  showGrid = true,
  topN,
  filename,
}: ExportableBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartData = topN ? data.slice(0, topN) : data;

  const formatValue = (value: number) => {
    return format === "currency" ? formatCurrency(value) : formatIndianNumber(value);
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="surface-card px-4 py-3">
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-[#0b2d52] font-semibold">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (index: number) => {
    if (gradientColors) {
      const ratio = chartData.length <= 1 ? 0 : index / (chartData.length - 1);
      return interpolateColor(gradientColors[0], gradientColors[1], ratio);
    }
    return color;
  };

  const exportFilename = filename || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleExport = useCallback(async () => {
    if (!chartRef.current) return;

    try {
      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `${exportFilename}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export chart:", error);
    }
  }, [exportFilename]);

  const renderChart = () => {
    if (horizontal) {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis
              type="number"
              tickFormatter={(v) => formatIndianNumber(v)}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey={xAxisKey}
              tick={{ fill: "#374151", fontSize: 12 }}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fill: "#374151", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tickFormatter={(v) => formatIndianNumber(v)}
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="group relative">
      {/* Export button - appears on hover */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-slate-700 hover:text-[#0b2d52] text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0b2d52]/40"
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
      </div>

      {/* Chart container with title for export */}
      <div ref={chartRef} className="surface-card p-4 md:p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          {title}
        </h3>
        {renderChart()}
      </div>
    </div>
  );
}
