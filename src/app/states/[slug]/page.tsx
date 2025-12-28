"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StatCard from "@/components/ui/StatCard";
import BarChart from "@/components/charts/BarChart";
import statesData from "@/data/states.json";
import gdpData from "@/data/gdp.json";
import bankingData from "@/data/banking.json";
import exportsData from "@/data/exports.json";
import tourismData from "@/data/tourism.json";
import { formatCurrency, formatIndianNumber, formatPercentage } from "@/lib/formatters";

export default function StatePage() {
  const params = useParams();
  const slug = params.slug as string;

  // Convert slug back to state name
  const stateName = useMemo(() => {
    const found = statesData.states.find(
      (s) => s.name.toLowerCase().replace(/\s+/g, "-") === slug
    );
    return found?.name || "";
  }, [slug]);

  // Get state metadata
  const stateInfo = useMemo(() => {
    return statesData.states.find((s) => s.name === stateName);
  }, [stateName]);

  // Get all data for this state
  const stateGDP = useMemo(() => {
    return gdpData.data.find((d) => d.state === stateName);
  }, [stateName]);

  const stateBanking = useMemo(() => {
    return bankingData.data.find((d) => d.state === stateName);
  }, [stateName]);

  const stateExports = useMemo(() => {
    return exportsData.data.find((d) => d.state === stateName);
  }, [stateName]);

  const stateTourism = useMemo(() => {
    return tourismData.data.find((d) => d.state === stateName);
  }, [stateName]);

  // Calculate rankings
  const rankings = useMemo(() => {
    const gdpRank = [...gdpData.data]
      .sort((a, b) => b.gsdp - a.gsdp)
      .findIndex((d) => d.state === stateName) + 1;
    const exportRank = [...exportsData.data]
      .sort((a, b) => b.exports - a.exports)
      .findIndex((d) => d.state === stateName) + 1;
    const tourismRank = [...tourismData.data]
      .sort((a, b) => b.total - a.total)
      .findIndex((d) => d.state === stateName) + 1;
    const bankingRank = [...bankingData.data]
      .sort((a, b) => b.deposits - a.deposits)
      .findIndex((d) => d.state === stateName) + 1;

    return { gdp: gdpRank, exports: exportRank, tourism: tourismRank, banking: bankingRank };
  }, [stateName]);

  // Comparison data
  const comparisonData = useMemo(() => {
    if (!stateGDP) return [];
    return [
      { name: stateName, value: stateGDP.gsdp },
      { name: "National Avg", value: gdpData.national.totalGDP / gdpData.data.length },
    ];
  }, [stateName, stateGDP]);

  const gdpShare = useMemo(() => {
    if (!stateGDP) return 0;
    return (stateGDP.gsdp / gdpData.national.totalGDP) * 100;
  }, [stateGDP]);

  const regionalStats = useMemo(() => {
    if (!stateInfo) return null;
    const regionStates = statesData.states
      .filter((s) => s.region === stateInfo.region)
      .map((s) => s.name);
    const regionGDP = gdpData.data.filter((d) => regionStates.includes(d.state));
    const regionExports = exportsData.data.filter((d) => regionStates.includes(d.state));
    const regionTourism = tourismData.data.filter((d) => regionStates.includes(d.state));
    const regionBanking = bankingData.data.filter((d) => regionStates.includes(d.state));

    const avgGDP = regionGDP.reduce((sum, d) => sum + d.gsdp, 0) / Math.max(regionGDP.length, 1);
    const avgExports = regionExports.reduce((sum, d) => sum + d.exports, 0) / Math.max(regionExports.length, 1);
    const avgTourism = regionTourism.reduce((sum, d) => sum + d.total, 0) / Math.max(regionTourism.length, 1);
    const avgBranches = regionBanking.reduce((sum, d) => sum + d.branches, 0) / Math.max(regionBanking.length, 1);

    return {
      count: regionStates.length,
      avgGDP,
      avgExports,
      avgTourism,
      avgBranches,
    };
  }, [stateInfo]);

  const peerStates = useMemo(() => {
    if (!stateGDP) return [];
    return [...gdpData.data]
      .filter((d) => d.state !== stateName)
      .map((d) => ({
        state: d.state,
        gsdp: d.gsdp,
        gap: Math.abs(d.gsdp - stateGDP.gsdp),
      }))
      .sort((a, b) => a.gap - b.gap)
      .slice(0, 3);
  }, [stateGDP, stateName]);

  if (!stateName || !stateInfo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">State Not Found</h1>
          <p className="text-slate-600 mb-8">The requested state could not be found.</p>
          <Link
            href="/"
            className="text-[#003366] hover:underline font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <section className="surface-card p-6 md:p-8 mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-[#0b2d52]">Dashboard</Link>
          <span>/</span>
          <Link href="/map" className="hover:text-[#0b2d52]">Map</Link>
          <span>/</span>
          <span className="text-slate-900">{stateName}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{stateName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-600">
              <span className="bg-[#0b2d52] text-white px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em]">
                {stateInfo.region}
              </span>
              <span>Capital: {stateInfo.capital}</span>
              {stateGDP && <span>GDP share: {formatPercentage(gdpShare)}</span>}
            </div>
          </div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0b2d52] text-white hover:bg-[#0a2547] transition-colors"
          >
            Compare with other states -&gt;
          </Link>
        </div>
      </section>

      {/* Rankings */}
      <div className="hero-panel p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">National Rankings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold">#{rankings.gdp}</p>
            <p className="text-white/70 text-sm">GDP</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">#{rankings.exports}</p>
            <p className="text-white/70 text-sm">Exports</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">#{rankings.banking}</p>
            <p className="text-white/70 text-sm">Bank Deposits</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold">#{rankings.tourism}</p>
            <p className="text-white/70 text-sm">Tourism</p>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stateGDP && (
          <StatCard
            title="GDP (GSDP)"
            value={stateGDP.gsdp}
            format="currency"
            subtitle={`Growth: ${stateGDP.growth}%`}
            variant="blue"
          />
        )}
        {stateExports && (
          <StatCard
            title="Exports"
            value={stateExports.exports}
            format="currency"
            subtitle={`${stateExports.share}% of national`}
            variant="orange"
          />
        )}
        {stateBanking && (
          <StatCard
            title="Bank Deposits"
            value={stateBanking.deposits}
            format="currency"
            subtitle={`CD Ratio: ${stateBanking.cdRatio}%`}
            variant="green"
          />
        )}
        {stateTourism && (
          <StatCard
            title="Total Tourists"
            value={stateTourism.total}
            format="number"
            subtitle={`Foreign: ${(stateTourism.foreign / 1000000).toFixed(2)}M`}
            variant="purple"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="surface-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Regional snapshot
          </h3>
          {regionalStats ? (
            <>
              <p className="text-sm text-slate-500 mb-4">
                {stateInfo.region} region average across {regionalStats.count} states.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg GDP</p>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(regionalStats.avgGDP)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg exports</p>
                  <p className="font-semibold text-slate-900">
                    {formatCurrency(regionalStats.avgExports)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg tourism</p>
                  <p className="font-semibold text-slate-900">
                    {formatIndianNumber(regionalStats.avgTourism)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Avg branches</p>
                  <p className="font-semibold text-slate-900">
                    {formatIndianNumber(regionalStats.avgBranches)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Regional averages are unavailable.</p>
          )}
        </div>

        <div className="surface-card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Peer states
          </h3>
          {peerStates.length > 0 ? (
            <ul className="space-y-3 text-sm text-slate-600">
              {peerStates.map((peer) => (
                <li key={peer.state} className="flex items-center justify-between gap-4">
                  <Link
                    href={`/states/${peer.state.toLowerCase().replace(/\\s+/g, "-")}`}
                    className="font-semibold text-slate-900 hover:text-[#0b2d52]"
                  >
                    {peer.state}
                  </Link>
                  <span className="text-xs text-slate-500">
                    Gap {formatCurrency(peer.gap)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Peer comparisons are unavailable.</p>
          )}
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GDP Details */}
        <div className="surface-card p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Economic Indicators
          </h3>
          {stateGDP && (
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Gross State Domestic Product</span>
                <span className="font-semibold">₹{(stateGDP.gsdp / 100000).toFixed(2)} L Cr</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">GDP Growth Rate</span>
                <span className="font-semibold text-green-600">{formatPercentage(stateGDP.growth)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Per Capita Income</span>
                <span className="font-semibold">₹{stateGDP.perCapita.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-600">National Avg Per Capita</span>
                <span className="text-slate-500">₹{gdpData.national.avgPerCapita.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Banking Details */}
        <div className="surface-card p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Banking & Finance
          </h3>
          {stateBanking && (
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Bank Branches</span>
                <span className="font-semibold">{stateBanking.branches.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Total Deposits</span>
                <span className="font-semibold">₹{(stateBanking.deposits / 1000).toFixed(1)}K Cr</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Total Credit</span>
                <span className="font-semibold">₹{(stateBanking.credit / 1000).toFixed(1)}K Cr</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-600">Credit-Deposit Ratio</span>
                <span className={`font-semibold ${stateBanking.cdRatio > 75 ? "text-green-600" : "text-orange-600"}`}>
                  {formatPercentage(stateBanking.cdRatio)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tourism Details */}
        <div className="surface-card p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            Tourism Statistics
          </h3>
          {stateTourism && (
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Domestic Tourists</span>
                <span className="font-semibold">{(stateTourism.domestic / 10000000).toFixed(2)} Cr</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Foreign Tourists</span>
                <span className="font-semibold">{(stateTourism.foreign / 1000000).toFixed(2)}M</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-200/70">
                <span className="text-slate-600">Total Tourists</span>
                <span className="font-semibold">{(stateTourism.total / 10000000).toFixed(2)} Cr</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-600">Foreign Tourist Share</span>
                <span className="font-semibold">
                  {((stateTourism.foreign / stateTourism.total) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Comparison Chart */}
        <div className="surface-card p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">
            GDP vs National Average
          </h3>
          <BarChart
            data={comparisonData}
            format="currency"
            height={250}
            gradientColors={["#0b2d52", "#1c4d7a"]}
          />
        </div>
      </div>
    </div>
  );
}
