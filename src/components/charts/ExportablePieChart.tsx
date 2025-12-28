"use client";

import { useRef, useCallback } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatIndianNumber, formatPercentage } from "@/lib/formatters";
import { toPng } from "html-to-image";

interface ExportablePieChartProps {
  data: Array<{ name: string; value: number }>;
  title: string;
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  filename?: string;
}

const DEFAULT_COLORS = [
  "#003366",
  "#ff9933",
  "#138808",
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
];

export default function ExportablePieChart({
  data,
  title,
  colors = DEFAULT_COLORS,
  height = 300,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  filename,
}: ExportablePieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="surface-card px-4 py-3">
          <p className="font-medium text-slate-900">{item.name}</p>
          <p className="text-[#0b2d52] font-semibold">
            {formatIndianNumber(item.value)}
          </p>
          <p className="text-slate-500 text-sm">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius: ir,
    outerRadius: or,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = ir + (or - ir) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {formatPercentage(percent * 100, 0)}
      </text>
    );
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
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => (
                  <span className="text-sm text-slate-700">{value}</span>
                )}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
