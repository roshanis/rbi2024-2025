"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import BarChart from "@/components/charts/BarChart";
import ExportableChart from "@/components/charts/ExportableChart";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import ExportButton from "@/components/ui/ExportButton";
import type { ExportColumn } from "@/components/ui/ExportButton";
import gdpData from "@/data/gdp.json";
import statesData from "@/data/states.json";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

type RegionFilter = "All" | "North" | "South" | "East" | "West" | "Central" | "Northeast";

export default function GDPPage() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  // Create a map of state to region
  const stateRegionMap = useMemo(() => {
    const map = new Map<string, string>();
    statesData.states.forEach((s) => map.set(s.name, s.region));
    return map;
  }, []);

  const missingStates = useMemo(() => {
    const present = new Set(gdpData.data.map((d) => d.state));
    return statesData.states
      .map((state) => state.name)
      .filter((name) => !present.has(name));
  }, []);

  // Filter data by region
  const filteredData = useMemo(() => {
    if (regionFilter === "All") return gdpData.data;
    return gdpData.data.filter((d) => stateRegionMap.get(d.state) === regionFilter);
  }, [regionFilter, stateRegionMap]);

  // Sort by GDP for chart
  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.gsdp - a.gsdp)
      .map((d) => ({
        name: d.state.length > 15 ? d.state.substring(0, 12) + "..." : d.state,
        value: d.gsdp ?? 0,
        fullName: d.state,
      }));
  }, [filteredData]);

  const highlights = useMemo(() => {
    const sortedByGDP = [...gdpData.data].sort((a, b) => (b.gsdp ?? 0) - (a.gsdp ?? 0));
    const sortedByGrowth = [...gdpData.data].sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0));
    const sortedByPerCapita = [...gdpData.data].sort((a, b) => (b.perCapita ?? 0) - (a.perCapita ?? 0));
    return {
      topGDP: sortedByGDP[0],
      lowGDP: sortedByGDP[sortedByGDP.length - 1],
      topGrowth: sortedByGrowth[0],
      topPerCapita: sortedByPerCapita[0],
    };
  }, []);

  const columns: Column<typeof gdpData.data[0]>[] = [
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
    { key: "gsdp", label: "GSDP (₹ Cr)", format: "currency" },
    { key: "growth", label: "Growth %", format: "percentage" },
    { key: "perCapita", label: "Per Capita (₹)", format: "currency" },
  ];

  // Export columns (without render function, for export purposes)
  const exportColumns: ExportColumn[] = [
    { key: "state", label: "State", format: "text" },
    { key: "gsdp", label: "GSDP (Rs Crore)", format: "currency" },
    { key: "growth", label: "Growth (%)", format: "percentage" },
    { key: "perCapita", label: "Per Capita Income (Rs)", format: "currency" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="surface-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-[#0b2d52]">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900">GDP</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {gdpData.title}
            </h1>
            <p className="text-slate-600 max-w-2xl">{gdpData.description}</p>
            <p className="text-sm text-slate-500 mt-2">
              Source: {gdpData.source} | Year: {gdpData.year}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {missingStates.length > 0
                ? `Missing states: ${missingStates.join(", ")}.`
                : "Missing states: None."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Largest GDP</p>
              <p className="font-semibold text-slate-900">{highlights.topGDP.state}</p>
              <p className="text-sm text-slate-500">{formatCurrency(highlights.topGDP.gsdp ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fastest growth</p>
              <p className="font-semibold text-slate-900">{highlights.topGrowth.state}</p>
              <p className="text-sm text-slate-500">{formatPercentage(highlights.topGrowth.growth ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="surface-card p-4 md:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
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

          {/* View Toggle */}
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
          <p className="text-sm text-slate-500">Total GDP</p>
          <p className="text-2xl font-bold text-[#0b2d52]">
            ₹{(gdpData.national.totalGDP / 100000).toFixed(1)} L Cr
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">States Shown</p>
          <p className="text-2xl font-bold text-[#0b2d52]">{filteredData.length}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Avg Growth</p>
          <p className="text-2xl font-bold text-[#0b2d52]">{formatPercentage(gdpData.national.avgGrowth)}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Avg Per Capita</p>
          <p className="text-2xl font-bold text-[#0b2d52]">
            ₹{(gdpData.national.avgPerCapita / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <div className="surface-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">GDP insight highlights</h3>
        <div className="grid gap-4 md:grid-cols-4 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Largest GDP</p>
            <p className="font-semibold text-slate-900">{highlights.topGDP.state}</p>
            <p>{formatCurrency(highlights.topGDP.gsdp ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Fastest growth</p>
            <p className="font-semibold text-slate-900">{highlights.topGrowth.state}</p>
            <p>{formatPercentage(highlights.topGrowth.growth ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top per capita</p>
            <p className="font-semibold text-slate-900">{highlights.topPerCapita.state}</p>
            <p>₹{(highlights.topPerCapita.perCapita ?? 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Lowest GDP</p>
            <p className="font-semibold text-slate-900">{highlights.lowGDP.state}</p>
            <p>{formatCurrency(highlights.lowGDP.gsdp ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Chart or Table */}
      <div className="surface-card p-6">
        {viewMode === "chart" ? (
          <ExportableChart
            title={`GSDP by State ${regionFilter !== "All" ? `(${regionFilter} Region)` : ""}`}
            filename={`gdp-chart-${regionFilter.toLowerCase()}`}
          >
            <BarChart
              data={chartData}
              format="currency"
              height={Math.max(400, chartData.length * 35)}
              horizontal
              gradientColors={["#0b2d52", "#1c4d7a"]}
            />
          </ExportableChart>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                State-wise GDP Data {regionFilter !== "All" && `(${regionFilter} Region)`}
              </h2>
              <ExportButton
                data={filteredData}
                columns={exportColumns}
                filename={`gdp-data-${regionFilter.toLowerCase()}-${gdpData.year}`}
                title="GDP Data"
                tone="blue"
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
