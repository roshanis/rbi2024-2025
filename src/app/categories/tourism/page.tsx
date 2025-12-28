"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import BarChart from "@/components/charts/BarChart";
import ExportableChart from "@/components/charts/ExportableChart";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import ExportButton from "@/components/ui/ExportButton";
import type { ExportColumn } from "@/components/ui/ExportButton";
import tourismData from "@/data/tourism.json";
import statesData from "@/data/states.json";
import { formatIndianNumber } from "@/lib/formatters";

type MetricType = "total" | "domestic" | "foreign";
type RegionFilter = "All" | "North" | "South" | "East" | "West" | "Central" | "Northeast";

const metricInfo: Record<MetricType, { label: string; color: string }> = {
  total: { label: "Total Tourists", color: "#6366f1" },
  domestic: { label: "Domestic Tourists", color: "#003366" },
  foreign: { label: "Foreign Tourists", color: "#ff9933" },
};

export default function TourismPage() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("total");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const stateRegionMap = useMemo(() => {
    const map = new Map<string, string>();
    statesData.states.forEach((s) => map.set(s.name, s.region));
    return map;
  }, []);

  const missingStates = useMemo(() => {
    const present = new Set(tourismData.data.map((d) => d.state));
    return statesData.states
      .map((state) => state.name)
      .filter((name) => !present.has(name));
  }, []);

  const filteredData = useMemo(() => {
    if (regionFilter === "All") return tourismData.data;
    return tourismData.data.filter((d) => stateRegionMap.get(d.state) === regionFilter);
  }, [regionFilter, stateRegionMap]);

  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => (b[selectedMetric] ?? 0) - (a[selectedMetric] ?? 0))
      .slice(0, 15)
      .map((d) => ({
        name: d.state.length > 15 ? d.state.substring(0, 12) + "..." : d.state,
        value: d[selectedMetric],
      }));
  }, [filteredData, selectedMetric]);

  const highlights = useMemo(() => {
    const byTotal = [...tourismData.data].sort((a, b) => (b.total ?? 0) - (a.total ?? 0))[0];
    const byDomestic = [...tourismData.data].sort((a, b) => (b.domestic ?? 0) - (a.domestic ?? 0))[0];
    const byForeign = [...tourismData.data].sort((a, b) => (b.foreign ?? 0) - (a.foreign ?? 0))[0];
    return { byTotal, byDomestic, byForeign };
  }, []);

  const columns: Column<typeof tourismData.data[0]>[] = [
    {
      key: "state",
      label: "State",
      render: (value) => (
        <Link
          href={`/states/${String(value).toLowerCase().replace(/\s+/g, "-")}`}
          className="text-[#003366] hover:underline font-medium"
        >
          {String(value)}
        </Link>
      ),
    },
    { key: "domestic", label: "Domestic", format: "number" },
    { key: "foreign", label: "Foreign", format: "number" },
    { key: "total", label: "Total", format: "number" },
  ];

  // Export columns (without render function, for export purposes)
  const exportColumns: ExportColumn[] = [
    { key: "state", label: "State", format: "text" },
    { key: "domestic", label: "Domestic Tourists", format: "number" },
    { key: "foreign", label: "Foreign Tourists", format: "number" },
    { key: "total", label: "Total Tourists", format: "number" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="surface-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-[#0b2d52]">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900">Tourism</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {tourismData.title}
            </h1>
            <p className="text-slate-600 max-w-2xl">{tourismData.description}</p>
            <p className="text-sm text-slate-500 mt-2">
              Source: {tourismData.source} | Year: {tourismData.year}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {missingStates.length > 0
                ? `Missing states: ${missingStates.join(", ")}.`
                : "Missing states: None."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top total</p>
              <p className="font-semibold text-slate-900">{highlights.byTotal.state}</p>
              <p className="text-sm text-slate-500">{formatIndianNumber(highlights.byTotal.total ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top foreign</p>
              <p className="font-semibold text-slate-900">{highlights.byForeign.state}</p>
              <p className="text-sm text-slate-500">{formatIndianNumber(highlights.byForeign.foreign ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card p-4 md:p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            {/* Metric Selector */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Tourist Type
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(metricInfo) as [MetricType, typeof metricInfo[MetricType]][]).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedMetric === key
                      ? "bg-[#6366f1] text-white"
                      : "bg-white/70 text-slate-700 hover:bg-white"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Filter by Region
              </label>
              <div className="flex flex-wrap gap-2">
                {(["All", ...statesData.regions] as RegionFilter[]).map((region) => (
                  <button
                    key={region}
                    onClick={() => setRegionFilter(region)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${regionFilter === region
                      ? "bg-[#0b2d52] text-white"
                      : "bg-white/70 text-slate-700 hover:bg-white"
                      }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              View Mode
            </label>
            <div className="flex gap-1 bg-white/70 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => setViewMode("chart")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === "chart"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Total Tourists</p>
          <p className="text-2xl font-bold text-[#6366f1]">
            {(tourismData.national.total / 10000000).toFixed(0)} Cr
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Domestic</p>
          <p className="text-2xl font-bold text-[#0b2d52]">
            {(tourismData.national.totalDomestic / 10000000).toFixed(0)} Cr
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Foreign</p>
          <p className="text-2xl font-bold text-[#b44b00]">
            {(tourismData.national.totalForeign / 1000000).toFixed(1)} M
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Top Destination</p>
          <p className="text-2xl font-bold text-[#6366f1]">{highlights.byTotal.state}</p>
        </div>
      </div>

      <div className="surface-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tourism insight highlights</h3>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Most visits</p>
            <p className="font-semibold text-slate-900">{highlights.byTotal.state}</p>
            <p>{formatIndianNumber(highlights.byTotal.total ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Domestic leader</p>
            <p className="font-semibold text-slate-900">{highlights.byDomestic.state}</p>
            <p>{formatIndianNumber(highlights.byDomestic.domestic ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Foreign leader</p>
            <p className="font-semibold text-slate-900">{highlights.byForeign.state}</p>
            <p>{formatIndianNumber(highlights.byForeign.foreign ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Chart or Table */}
      <div className="surface-card p-6">
        {viewMode === "chart" ? (
          <ExportableChart
            title={`${metricInfo[selectedMetric].label} by State${regionFilter !== "All" ? ` (${regionFilter} Region)` : ""}`}
            filename={`tourism-${selectedMetric}-${regionFilter.toLowerCase()}`}
          >
            <BarChart
              data={chartData}
              format="number"
              height={Math.max(400, chartData.length * 35)}
              horizontal
              gradientColors={["#0b4b5c", "#14b8a6"]}
            />
          </ExportableChart>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Tourism Data by State {regionFilter !== "All" && `(${regionFilter} Region)`}
              </h2>
              <ExportButton
                data={filteredData}
                columns={exportColumns}
                filename={`tourism-data-${regionFilter.toLowerCase()}-${tourismData.year}`}
                title="Tourism Data"
                tone="teal"
              />
            </div>
            <DataTable
              data={filteredData}
              columns={columns}
              searchable
              searchKey="state"
              pageSize={15}
            />
          </>
        )}
      </div>
    </div>
  );
}
