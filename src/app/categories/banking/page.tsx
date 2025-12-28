"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import BarChart from "@/components/charts/BarChart";
import ExportableChart from "@/components/charts/ExportableChart";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import ExportButton from "@/components/ui/ExportButton";
import type { ExportColumn } from "@/components/ui/ExportButton";
import bankingData from "@/data/banking.json";
import statesData from "@/data/states.json";
import { formatCurrency, formatPercentage, formatIndianNumber } from "@/lib/formatters";

type MetricType = "branches" | "deposits" | "credit" | "cdRatio";
type RegionFilter = "All" | "North" | "South" | "East" | "West" | "Central" | "Northeast";

const metricInfo: Record<MetricType, { label: string; format: "number" | "currency" | "percentage" }> = {
  branches: { label: "Bank Branches", format: "number" },
  deposits: { label: "Deposits (₹ Cr)", format: "currency" },
  credit: { label: "Credit (₹ Cr)", format: "currency" },
  cdRatio: { label: "CD Ratio (%)", format: "percentage" },
};

export default function BankingPage() {
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("All");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("deposits");
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const stateRegionMap = useMemo(() => {
    const map = new Map<string, string>();
    statesData.states.forEach((s) => map.set(s.name, s.region));
    return map;
  }, []);

  const missingStates = useMemo(() => {
    const present = new Set(bankingData.data.map((d) => d.state));
    return statesData.states
      .map((state) => state.name)
      .filter((name) => !present.has(name));
  }, []);

  const filteredData = useMemo(() => {
    if (regionFilter === "All") return bankingData.data;
    return bankingData.data.filter((d) => stateRegionMap.get(d.state) === regionFilter);
  }, [regionFilter, stateRegionMap]);

  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => (b[selectedMetric] ?? 0) - (a[selectedMetric] ?? 0))
      .slice(0, 20)
      .map((d) => ({
        name: d.state.length > 15 ? d.state.substring(0, 12) + "..." : d.state,
        value: d[selectedMetric] ?? 0,
        fullName: d.state,
      }));
  }, [filteredData, selectedMetric]);

  const highlights = useMemo(() => {
    const byDeposits = [...bankingData.data].sort((a, b) => (b.deposits ?? 0) - (a.deposits ?? 0))[0];
    const byBranches = [...bankingData.data].sort((a, b) => (b.branches ?? 0) - (a.branches ?? 0))[0];
    const byCredit = [...bankingData.data].sort((a, b) => (b.credit ?? 0) - (a.credit ?? 0))[0];
    const byCdRatio = [...bankingData.data].sort((a, b) => (b.cdRatio ?? 0) - (a.cdRatio ?? 0))[0];
    return { byDeposits, byBranches, byCredit, byCdRatio };
  }, []);

  const columns: Column<typeof bankingData.data[0]>[] = [
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
    { key: "branches", label: "Branches", format: "number" },
    { key: "deposits", label: "Deposits (₹ Cr)", format: "currency" },
    { key: "credit", label: "Credit (₹ Cr)", format: "currency" },
    { key: "cdRatio", label: "CD Ratio %", format: "percentage" },
  ];

  // Export columns (without render function, for export purposes)
  const exportColumns: ExportColumn[] = [
    { key: "state", label: "State", format: "text" },
    { key: "branches", label: "Bank Branches", format: "number" },
    { key: "deposits", label: "Deposits (Rs Crore)", format: "currency" },
    { key: "credit", label: "Credit (Rs Crore)", format: "currency" },
    { key: "cdRatio", label: "CD Ratio (%)", format: "percentage" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="surface-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-[#0b2d52]">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900">Banking</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {bankingData.title}
            </h1>
            <p className="text-slate-600 max-w-2xl">{bankingData.description}</p>
            <p className="text-sm text-slate-500 mt-2">
              Source: {bankingData.source} | Year: {bankingData.year}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {missingStates.length > 0
                ? `Missing states: ${missingStates.join(", ")}.`
                : "Missing states: None."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top deposits</p>
              <p className="font-semibold text-slate-900">{highlights.byDeposits.state}</p>
              <p className="text-sm text-slate-500">{formatCurrency(highlights.byDeposits.deposits ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top branches</p>
              <p className="font-semibold text-slate-900">{highlights.byBranches.state}</p>
              <p className="text-sm text-slate-500">{formatIndianNumber(highlights.byBranches.branches ?? 0)}</p>
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
                Select Metric
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(metricInfo) as [MetricType, typeof metricInfo[MetricType]][]).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedMetric === key
                      ? "bg-[#138808] text-white"
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
          <p className="text-sm text-slate-500">Total Branches</p>
          <p className="text-2xl font-bold text-[#138808]">
            {bankingData.national.totalBranches.toLocaleString()}
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Total Deposits</p>
          <p className="text-2xl font-bold text-[#138808]">
            ₹{(bankingData.national.totalDeposits / 100000).toFixed(1)} L Cr
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Total Credit</p>
          <p className="text-2xl font-bold text-[#138808]">
            ₹{(bankingData.national.totalCredit / 100000).toFixed(1)} L Cr
          </p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Avg CD Ratio</p>
          <p className="text-2xl font-bold text-[#138808]">
            {formatPercentage(bankingData.national.avgCDRatio)}
          </p>
        </div>
      </div>

      <div className="surface-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Banking insight highlights</h3>
        <div className="grid gap-4 md:grid-cols-4 text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Highest deposits</p>
            <p className="font-semibold text-slate-900">{highlights.byDeposits.state}</p>
            <p>{formatCurrency(highlights.byDeposits.deposits ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Most branches</p>
            <p className="font-semibold text-slate-900">{highlights.byBranches.state}</p>
            <p>{formatIndianNumber(highlights.byBranches.branches ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Highest credit</p>
            <p className="font-semibold text-slate-900">{highlights.byCredit.state}</p>
            <p>{formatCurrency(highlights.byCredit.credit ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best CD ratio</p>
            <p className="font-semibold text-slate-900">{highlights.byCdRatio.state}</p>
            <p>{formatPercentage(highlights.byCdRatio.cdRatio ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Chart or Table */}
      <div className="surface-card p-6">
        {viewMode === "chart" ? (
          <ExportableChart
            title={`${metricInfo[selectedMetric].label} by State${regionFilter !== "All" ? ` (${regionFilter} Region)` : ""}`}
            filename={`banking-${selectedMetric}-${regionFilter.toLowerCase()}`}
          >
            <BarChart
              data={chartData}
              format={metricInfo[selectedMetric].format === "percentage" ? "number" : metricInfo[selectedMetric].format}
              height={Math.max(400, chartData.length * 35)}
              horizontal
              gradientColors={["#0f3b2f", "#1a8f5c"]}
            />
          </ExportableChart>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Banking Data by State {regionFilter !== "All" && `(${regionFilter} Region)`}
              </h2>
              <ExportButton
                data={filteredData}
                columns={exportColumns}
                filename={`banking-data-${regionFilter.toLowerCase()}-${bankingData.year}`}
                title="Banking Data"
                tone="green"
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
