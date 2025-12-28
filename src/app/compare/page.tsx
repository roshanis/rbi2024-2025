"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import statesData from "@/data/states.json";
import gdpData from "@/data/gdp.json";
import bankingData from "@/data/banking.json";
import exportsData from "@/data/exports.json";
import tourismData from "@/data/tourism.json";
import ExportButton from "@/components/ui/ExportButton";
import { formatCurrency, formatIndianNumber, formatPercentage } from "@/lib/formatters";

interface StateMetrics {
  [key: string]: string | number;
  name: string;
  gdp: number;
  gdpGrowth: number;
  perCapita: number;
  exports: number;
  exportShare: number;
  branches: number;
  deposits: number;
  credit: number;
  cdRatio: number;
  tourists: number;
  foreignTourists: number;
}

export default function ComparePage() {
  const [selectedStates, setSelectedStates] = useState<string[]>([
    "Maharashtra",
    "Tamil Nadu",
  ]);

  // Combine all data for each state
  const allStatesData = useMemo(() => {
    const dataMap = new Map<string, StateMetrics>();

    statesData.states.forEach((state) => {
      const gdp = gdpData.data.find((d) => d.state === state.name);
      const exports = exportsData.data.find((d) => d.state === state.name);
      const banking = bankingData.data.find((d) => d.state === state.name);
      const tourism = tourismData.data.find((d) => d.state === state.name);

      if (gdp && exports && banking && tourism) {
        dataMap.set(state.name, {
          name: state.name,
          gdp: gdp.gsdp,
          gdpGrowth: gdp.growth,
          perCapita: gdp.perCapita,
          exports: exports.exports,
          exportShare: exports.share ?? 0,
          branches: banking.branches ?? 0,
          deposits: banking.deposits ?? 0,
          credit: banking.credit ?? 0,
          cdRatio: banking.cdRatio ?? 0,
          tourists: tourism.total ?? 0,
          foreignTourists: tourism.foreign ?? 0,
        });
      }
    });

    return dataMap;
  }, []);

  const availableStates = useMemo(() => {
    return statesData.states.filter((state) => allStatesData.has(state.name));
  }, [allStatesData]);

  const missingStates = useMemo(() => {
    return statesData.states
      .filter((state) => !allStatesData.has(state.name))
      .map((state) => state.name);
  }, [allStatesData]);

  const selectedData = useMemo(() => {
    return selectedStates
      .map((name) => allStatesData.get(name))
      .filter((d): d is StateMetrics => d !== undefined);
  }, [selectedStates, allStatesData]);

  const handleStateToggle = (stateName: string) => {
    if (selectedStates.includes(stateName)) {
      if (selectedStates.length > 1) {
        setSelectedStates(selectedStates.filter((s) => s !== stateName));
      }
    } else if (selectedStates.length < 4) {
      setSelectedStates([...selectedStates, stateName]);
    }
  };

  const getBarWidth = (value: number, max: number) => {
    return `${(value / max) * 100}%`;
  };

  const maxValues = useMemo(() => {
    if (selectedData.length === 0) return {};
    return {
      gdp: Math.max(...selectedData.map((d) => d.gdp)),
      exports: Math.max(...selectedData.map((d) => d.exports)),
      deposits: Math.max(...selectedData.map((d) => d.deposits)),
      tourists: Math.max(...selectedData.map((d) => d.tourists)),
      perCapita: Math.max(...selectedData.map((d) => d.perCapita)),
      branches: Math.max(...selectedData.map((d) => d.branches)),
    };
  }, [selectedData]);

  const stateColors = ["#003366", "#ff9933", "#138808", "#6366f1"];

  const leaders = useMemo(() => {
    if (selectedData.length === 0) return null;
    const byGDP = [...selectedData].sort((a, b) => b.gdp - a.gdp)[0];
    const byExports = [...selectedData].sort((a, b) => b.exports - a.exports)[0];
    const byDeposits = [...selectedData].sort((a, b) => b.deposits - a.deposits)[0];
    const byTourism = [...selectedData].sort((a, b) => b.tourists - a.tourists)[0];
    return { byGDP, byExports, byDeposits, byTourism };
  }, [selectedData]);

  const exportColumns = [
    { key: "name", label: "State", format: "text" as const },
    { key: "gdp", label: "GDP (Rs Crore)", format: "currency" as const },
    { key: "gdpGrowth", label: "GDP Growth (%)", format: "percentage" as const },
    { key: "perCapita", label: "Per Capita (Rs)", format: "currency" as const },
    { key: "exports", label: "Exports (Rs Crore)", format: "currency" as const },
    { key: "exportShare", label: "Export Share (%)", format: "percentage" as const },
    { key: "branches", label: "Branches", format: "number" as const },
    { key: "deposits", label: "Deposits (Rs Crore)", format: "currency" as const },
    { key: "credit", label: "Credit (Rs Crore)", format: "currency" as const },
    { key: "cdRatio", label: "CD Ratio (%)", format: "percentage" as const },
    { key: "tourists", label: "Total Tourists", format: "number" as const },
    { key: "foreignTourists", label: "Foreign Tourists", format: "number" as const },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="surface-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/" className="hover:text-[#0b2d52]">Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900">Compare States</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Compare States
            </h1>
            <p className="text-slate-600">
              Select up to 4 states to compare their key statistics side by side.
            </p>
          </div>
          {leaders && (
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top GDP</p>
                <p className="font-semibold text-slate-900">{leaders.byGDP.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top exports</p>
                <p className="font-semibold text-slate-900">{leaders.byExports.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top deposits</p>
                <p className="font-semibold text-slate-900">{leaders.byDeposits.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Top tourism</p>
                <p className="font-semibold text-slate-900">{leaders.byTourism.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* State Selector */}
      <div className="surface-card p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Select States to Compare ({selectedStates.length}/4)
          </h2>
          <span className="text-sm text-slate-500">
            {availableStates.length} states available. Tap to add or remove. Max 4.
          </span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto">
          {availableStates.map((state) => {
            const isSelected = selectedStates.includes(state.name);
            const colorIndex = selectedStates.indexOf(state.name);

            return (
              <button
                key={state.code}
                onClick={() => handleStateToggle(state.name)}
                disabled={!isSelected && selectedStates.length >= 4}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isSelected
                  ? "text-white"
                  : "bg-white/70 text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                style={isSelected ? { backgroundColor: stateColors[colorIndex] } : {}}
              >
                {state.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="surface-card p-4 mb-8 text-sm text-slate-600">
        <p>
          Data years: GDP {gdpData.year}, Banking {bankingData.year}, Exports {exportsData.year},{" "}
          Tourism {tourismData.year}.
        </p>
        {missingStates.length > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            Missing from full comparison: {missingStates.join(", ")}.
          </p>
        )}
      </div>

      {/* Selected States Legend */}
      <div className="flex flex-wrap gap-4 mb-8">
        {selectedData.map((state, index) => (
          <div key={state.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: stateColors[index] }}
            />
            <span className="font-medium">{state.name}</span>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {selectedData.length > 0 && (
        <div className="surface-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200/70 bg-white/60">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Side-by-side comparison</h2>
              <p className="text-sm text-slate-500">All values shown for selected states.</p>
            </div>
            <ExportButton
              data={selectedData}
              columns={exportColumns}
              filename={`state-comparison-${selectedStates.length}-states`}
              title="State Comparison"
              tone="blue"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-48">
                    Metric
                  </th>
                  {selectedData.map((state, index) => (
                    <th
                      key={state.name}
                      className="px-6 py-4 text-left text-sm font-semibold text-white min-w-[200px]"
                      style={{ backgroundColor: stateColors[index] }}
                    >
                      {state.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {/* GDP */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    GDP (₹ Crore)
                  </td>
                  {selectedData.map((state, index) => (
                    <td key={state.name} className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{formatCurrency(state.gdp)}</p>
                        <div className="w-full bg-slate-200/80 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: getBarWidth(state.gdp, maxValues.gdp || 1),
                              backgroundColor: stateColors[index],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* GDP Growth */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    GDP Growth (%)
                  </td>
                  {selectedData.map((state) => (
                    <td key={state.name} className="px-6 py-4">
                      <span className={`text-sm font-semibold ${state.gdpGrowth >= 7 ? "text-green-600" : "text-orange-600"}`}>
                        {formatPercentage(state.gdpGrowth)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Per Capita */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Per Capita Income (₹)
                  </td>
                  {selectedData.map((state, index) => (
                    <td key={state.name} className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">₹{state.perCapita.toLocaleString()}</p>
                        <div className="w-full bg-slate-200/80 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: getBarWidth(state.perCapita, maxValues.perCapita || 1),
                              backgroundColor: stateColors[index],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Exports */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Exports (₹ Crore)
                  </td>
                  {selectedData.map((state, index) => (
                    <td key={state.name} className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{formatCurrency(state.exports)}</p>
                        <div className="w-full bg-slate-200/80 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: getBarWidth(state.exports, maxValues.exports || 1),
                              backgroundColor: stateColors[index],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Export Share */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Export Share (%)
                  </td>
                  {selectedData.map((state) => (
                    <td key={state.name} className="px-6 py-4">
                      <span className="text-sm font-semibold">{formatPercentage(state.exportShare)}</span>
                    </td>
                  ))}
                </tr>

                {/* Bank Branches */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Bank Branches
                  </td>
                  {selectedData.map((state, index) => (
                    <td key={state.name} className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{formatIndianNumber(state.branches)}</p>
                        <div className="w-full bg-slate-200/80 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: getBarWidth(state.branches, maxValues.branches || 1),
                              backgroundColor: stateColors[index],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Bank Deposits */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Bank Deposits (₹ Crore)
                  </td>
                  {selectedData.map((state, index) => (
                    <td key={state.name} className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{formatCurrency(state.deposits)}</p>
                        <div className="w-full bg-slate-200/80 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: getBarWidth(state.deposits, maxValues.deposits || 1),
                              backgroundColor: stateColors[index],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* CD Ratio */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Credit-Deposit Ratio (%)
                  </td>
                  {selectedData.map((state) => (
                    <td key={state.name} className="px-6 py-4">
                      <span className={`text-sm font-semibold ${state.cdRatio >= 75 ? "text-green-600" : "text-orange-600"}`}>
                        {formatPercentage(state.cdRatio)}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Total Tourists */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Total Tourists
                  </td>
                  {selectedData.map((state, index) => (
                    <td key={state.name} className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{formatIndianNumber(state.tourists)}</p>
                        <div className="w-full bg-slate-200/80 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: getBarWidth(state.tourists, maxValues.tourists || 1),
                              backgroundColor: stateColors[index],
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Foreign Tourists */}
                <tr className="hover:bg-white/70">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    Foreign Tourists
                  </td>
                  {selectedData.map((state) => (
                    <td key={state.name} className="px-6 py-4">
                      <span className="text-sm font-semibold">
                        {(state.foreignTourists / 1000000).toFixed(2)}M
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 surface-card p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          How to use this comparison
        </h3>
        <ul className="text-slate-600 space-y-2 text-sm">
          <li>Click on state names above to add or remove them.</li>
          <li>You can compare up to 4 states at the same time.</li>
          <li>Bar lengths show relative values within the selected states.</li>
          <li>Color hints highlight stronger or weaker ratios.</li>
        </ul>
      </div>
    </div>
  );
}
