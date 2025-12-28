"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IndiaMap from "@/components/IndiaMap";
import gdpData from "@/data/gdp.json";
import bankingData from "@/data/banking.json";
import exportsData from "@/data/exports.json";
import tourismData from "@/data/tourism.json";
import { formatCurrency, formatIndianNumber } from "@/lib/formatters";

type MetricType = "gdp" | "exports" | "banking" | "tourism";

const metrics: Record<
  MetricType,
  {
    label: string;
    format: "currency" | "number";
    colorScale: string[];
    accent: string;
    unit: string;
    route: string;
  }
> = {
  gdp: {
    label: "GDP (₹ Crore)",
    format: "currency",
    colorScale: ["#e8f4f8", "#b3d9e8", "#7ebfd8", "#49a5c8", "#148bb8", "#003366"],
    accent: "#0b2d52",
    unit: "₹ Crore",
    route: "/categories/gdp",
  },
  exports: {
    label: "Exports (₹ Crore)",
    format: "currency",
    colorScale: ["#fff3e6", "#ffe0b3", "#ffcc80", "#ffb74d", "#ffa726", "#ff9933"],
    accent: "#b44b00",
    unit: "₹ Crore",
    route: "/categories/exports",
  },
  banking: {
    label: "Bank Branches",
    format: "number",
    colorScale: ["#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#4caf50", "#138808"],
    accent: "#138808",
    unit: "branches",
    route: "/categories/banking",
  },
  tourism: {
    label: "Total Tourists",
    format: "number",
    colorScale: ["#ede7f6", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#6366f1"],
    accent: "#6366f1",
    unit: "visits",
    route: "/categories/tourism",
  },
};

export default function MapPage() {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("gdp");

  const dataSources = {
    gdp: gdpData,
    exports: exportsData,
    banking: bankingData,
    tourism: tourismData,
  } as const;

  const mapData = useMemo(() => {
    switch (selectedMetric) {
      case "gdp":
        return gdpData.data.map((d) => ({ state: d.state, value: d.gsdp }));
      case "exports":
        return exportsData.data.map((d) => ({ state: d.state, value: d.exports }));
      case "banking":
        return bankingData.data.map((d) => ({ state: d.state, value: d.branches }));
      case "tourism":
        return tourismData.data.map((d) => ({ state: d.state, value: d.total }));
      default:
        return [];
    }
  }, [selectedMetric]);

  const summary = useMemo(() => {
    if (mapData.length === 0) {
      return {
        top: null,
        bottom: null,
        average: 0,
        median: 0,
        count: 0,
      };
    }
    const sorted = [...mapData].sort((a, b) => b.value - a.value);
    const values = sorted.map((d) => d.value);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
    return {
      top: sorted[0],
      bottom: sorted[sorted.length - 1],
      average,
      median,
      count: values.length,
    };
  }, [mapData]);

  const formatValue = (value: number) => {
    return metrics[selectedMetric].format === "currency"
      ? formatCurrency(value)
      : formatIndianNumber(value);
  };

  const handleStateClick = (stateName: string) => {
    const slug = stateName.toLowerCase().replace(/\s+/g, "-");
    router.push(`/states/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="surface-card p-6 md:p-8 mb-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Interactive Map
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
              Explore state-level performance at a glance
            </h1>
            <p className="text-slate-600 mt-3 max-w-2xl">
              Switch between GDP, exports, banking reach, and tourism activity. Tap any
              state to jump into its profile.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-4">
              <span className="px-3 py-1 rounded-full bg-white/70 border border-slate-200/70">
                Source: {dataSources[selectedMetric].source}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/70 border border-slate-200/70">
                Year: {dataSources[selectedMetric].year}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/70 border border-slate-200/70">
                Unit: {metrics[selectedMetric].unit}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Select metric</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(metrics) as [MetricType, typeof metrics[MetricType]][]).map(
                ([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMetric(key)}
                    className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                      selectedMetric === key
                        ? "text-white"
                        : "bg-white/70 text-slate-700 hover:bg-white"
                    }`}
                    style={selectedMetric === key ? { backgroundColor: metrics[key].accent } : {}}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
            <Link
              href={metrics[selectedMetric].route}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              View full dataset
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="surface-card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {metrics[selectedMetric].label} by state
              </h2>
              <p className="text-sm text-slate-500">
                Hover for values. Click to open state profile.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Range shows {metrics[selectedMetric].unit}
            </span>
          </div>
          <div className="max-w-4xl mx-auto">
            <IndiaMap
              data={mapData}
              format={metrics[selectedMetric].format}
              colorScale={metrics[selectedMetric].colorScale}
              onStateClick={handleStateClick}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Metric snapshot
            </h3>
            <div className="grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Top state
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {summary.top?.state || "N/A"}
                </p>
                <p className="text-sm text-slate-600">
                  {summary.top ? formatValue(summary.top.value) : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Bottom state
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {summary.bottom?.state || "N/A"}
                </p>
                <p className="text-sm text-slate-600">
                  {summary.bottom ? formatValue(summary.bottom.value) : "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Average
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatValue(summary.average)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Median
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatValue(summary.median)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {summary.count} states and union territories shown.
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              How to use this map
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Hover over a state to preview the latest value.</li>
              <li>Click to open the state profile with full metrics.</li>
              <li>Swap metrics to compare performance across themes.</li>
              <li>Darker shades indicate higher values.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
