"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import ExportableChart from "@/components/charts/ExportableChart";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import ExportButton from "@/components/ui/ExportButton";
import type { ExportColumn } from "@/components/ui/ExportButton";
import exportsData from "@/data/exports.json";
import statesData from "@/data/states.json";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

type RegionFilter = "All" | "North" | "South" | "East" | "West" | "Central" | "Northeast";

export default function ExportsPage() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const [viewMode, setViewMode] = useState<"chart" | "pie" | "table">("chart");

  const stateRegionMap = useMemo(() => {
    const map = new Map<string, string>();
    statesData.states.forEach((s) => map.set(s.name, s.region));
    return map;
  }, []);

  const missingStates = useMemo(() => {
    const present = new Set(exportsData.data.map((d) => d.state));
    return statesData.states
      .map((state) => state.name)
      .filter((name) => !present.has(name));
  }, []);

  const filteredData = useMemo(() => {
    if (regionFilter === "All") return exportsData.data;
    return exportsData.data.filter((d) => stateRegionMap.get(d.state) === regionFilter);
  }, [regionFilter, stateRegionMap]);

  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.exports - a.exports)
      .slice(0, 15)
      .map((d) => ({
        name: d.state.length > 15 ? d.state.substring(0, 12) + "..." : d.state,
        value: d.exports,
      }));
  }, [filteredData]);

  const pieData = useMemo(() => {
    const sorted = [...exportsData.data].sort((a, b) => b.exports - a.exports);
    const top5 = sorted.slice(0, 5);
    const othersTotal = sorted.slice(5).reduce((sum, d) => sum + d.exports, 0);

    return [
      ...top5.map((d) => ({ name: d.state, value: d.exports })),
      { name: "Others", value: othersTotal },
    ];
  }, []);

  const highlights = useMemo(() => {
    const sorted = [...exportsData.data].sort((a, b) => b.exports - a.exports);
    const topState = sorted[0];
    const lowState = sorted[sorted.length - 1];
    const regionTotals = new Map<string, number>();
    exportsData.data.forEach((entry) => {
      const region = stateRegionMap.get(entry.state) || "Unknown";
      regionTotals.set(region, (regionTotals.get(region) || 0) + entry.exports);
    });
    const topRegion = [...regionTotals.entries()].sort((a, b) => b[1] - a[1])[0];
    return { topState, lowState, topRegion };
  }, [stateRegionMap]);

  const columns: Column<typeof exportsData.data[0]>[] = [
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
    { key: "exports", label: "Exports (₹ Cr)", format: "currency" },
    { key: "share", label: "Share %", format: "percentage" },
  ];

  // Export columns (without render function, for export purposes)
  const exportColumns: ExportColumn[] = [
    { key: "state", label: "State", format: "text" },
    { key: "exports", label: "Exports (Rs Crore)", format: "currency" },
    { key: "share", label: "Share (%)", format: "percentage" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="surface-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-[#0b2d52]">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900">Exports</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {exportsData.title}
            </h1>
            <p className="text-slate-600 max-w-2xl">{exportsData.description}</p>
            <p className="text-sm text-slate-500 mt-2">
              Source: {exportsData.source} | Year: {exportsData.year}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {missingStates.length > 0
                ? `Missing states: ${missingStates.join(", ")}.`
                : "Missing states: None."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top exporter</p>
              <p className="font-semibold text-slate-900">{highlights.topState.state}</p>
              <p className="text-sm text-slate-500">{formatCurrency(highlights.topState.exports)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top region</p>
              <p className="font-semibold text-slate-900">{highlights.topRegion?.[0] ?? "N/A"}</p>
              <p className="text-sm text-slate-500">
                {highlights.topRegion ? formatCurrency(highlights.topRegion[1]) : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card p-4 md:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Filter by Region
            </label>
            <div className="flex flex-wrap gap-2">
              {(["All", ...statesData.regions] as RegionFilter[]).map((region) => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    regionFilter === region
                      ? "bg-[#b44b00] text-white"
                      : "bg-white/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              View Mode
            </label>
            <div className="flex gap-1 bg-white/70 rounded-full p-1 border border-slate-200">
              <button
                onClick={() => setViewMode("chart")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  viewMode === "chart"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setViewMode("pie")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  viewMode === "pie"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pie
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  viewMode === "table"
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Total Exports</p>
          <p className="text-2xl font-bold text-[#b44b00]">
            ₹{(exportsData.national.totalExports / 100000).toFixed(1)} L Cr
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Growth Rate</p>
          <p className="text-2xl font-bold text-[#b44b00]">
            {formatPercentage(exportsData.national.growthRate)}
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Top Exporter</p>
          <p className="text-2xl font-bold text-[#b44b00]">
            {highlights.topState.state}
          </p>
        </div>
      </div>

      <div className="surface-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Export insight highlights</h3>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top exporter</p>
            <p className="font-semibold text-slate-900">{highlights.topState.state}</p>
            <p>{formatCurrency(highlights.topState.exports)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Lowest exporter</p>
            <p className="font-semibold text-slate-900">{highlights.lowState.state}</p>
            <p>{formatCurrency(highlights.lowState.exports)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top region</p>
            <p className="font-semibold text-slate-900">{highlights.topRegion?.[0] ?? "N/A"}</p>
            <p>{highlights.topRegion ? formatCurrency(highlights.topRegion[1]) : "-"}</p>
          </div>
        </div>
      </div>

      {/* Chart, Pie, or Table */}
      <div className="surface-card p-6">
        {viewMode === "chart" && (
          <ExportableChart
            title={`Exports by State ${regionFilter !== "All" ? `(${regionFilter} Region)` : ""}`}
            filename={`exports-chart-${regionFilter.toLowerCase()}`}
          >
            <BarChart
              data={chartData}
              format="currency"
              height={Math.max(400, chartData.length * 35)}
              horizontal
              gradientColors={["#b44b00", "#f59f3a"]}
            />
          </ExportableChart>
        )}
        {viewMode === "pie" && (
          <ExportableChart title="Export Share Distribution (Top 5 + Others)" filename="exports-share">
            <div className="max-w-md mx-auto">
              <PieChart
                data={pieData}
                height={400}
                innerRadius={60}
                outerRadius={140}
              />
            </div>
          </ExportableChart>
        )}
        {viewMode === "table" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Export Data by State {regionFilter !== "All" && `(${regionFilter} Region)`}
              </h2>
              <ExportButton
                data={filteredData}
                columns={exportColumns}
                filename={`exports-data-${regionFilter.toLowerCase()}-${exportsData.year}`}
                title="Exports Data"
                tone="orange"
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
