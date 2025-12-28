"use client";

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

interface BarChartProps {
  data: Array<{ name: string; value: number; [key: string]: unknown }>;
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  gradientColors?: [string, string];
  height?: number;
  format?: "number" | "currency";
  horizontal?: boolean;
  showGrid?: boolean;
  topN?: number;
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

export default function BarChart({
  data,
  dataKey = "value",
  xAxisKey = "name",
  color = "#003366",
  gradientColors,
  height = 400,
  format = "number",
  horizontal = false,
  showGrid = true,
  topN,
}: BarChartProps) {
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

  // Generate gradient colors based on value
  const getBarColor = (index: number) => {
    if (gradientColors) {
      const ratio = chartData.length <= 1 ? 0 : index / (chartData.length - 1);
      return interpolateColor(gradientColors[0], gradientColors[1], ratio);
    }
    return color;
  };

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
}
