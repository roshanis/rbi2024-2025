"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import StatCard from "@/components/ui/StatCard";
import BarChart from "@/components/charts/BarChart";
import IndiaMap from "@/components/IndiaMap";
import gdpData from "@/data/gdp.json";
import bankingData from "@/data/banking.json";
import exportsData from "@/data/exports.json";
import tourismData from "@/data/tourism.json";
import statesData from "@/data/states.json";
import {
  formatCurrency,
  formatIndianNumber,
  formatPercentage,
  slugify,
} from "@/lib/formatters";

type HighlightTone = "blue" | "orange" | "green" | "teal";

export default function Dashboard() {
  const router = useRouter();

  const gdpSorted = [...gdpData.data].sort((a, b) => b.gsdp - a.gsdp);
  const topGDPStates = gdpSorted
    .slice(0, 10)
    .map((d) => ({ name: d.state, value: d.gsdp }));
  const topGDPMini = gdpSorted.slice(0, 5);

  const topExportStates = [...exportsData.data]
    .sort((a, b) => b.exports - a.exports)
    .slice(0, 5)
    .map((d) => ({ name: d.state, value: d.exports }));

  const topGrowthState = [...gdpData.data].sort(
    (a, b) => b.growth - a.growth
  )[0];
  const topExportState = [...exportsData.data].sort(
    (a, b) => b.exports - a.exports
  )[0];
  const topTourismState = [...tourismData.data].sort(
    (a, b) => b.total - a.total
  )[0];
  const topGDPState = gdpSorted[0];
  const topGDPMax = topGDPState?.gsdp || 1;

  const highlights: Array<{
    title: string;
    state: string;
    value: string;
    note: string;
    tone: HighlightTone;
  }> = [
      {
        title: "Largest GSDP",
        state: topGDPState.state,
        value: formatCurrency(topGDPState.gsdp),
        note: "gross state domestic product",
        tone: "blue",
      },
      {
        title: "Fastest Growth",
        state: topGrowthState.state,
        value: formatPercentage(topGrowthState.growth),
        note: "annual GSDP growth",
        tone: "green",
      },
      {
        title: "Export Leader",
        state: topExportState.state,
        value: formatCurrency(topExportState.exports),
        note: `${topExportState.share}% of national exports`,
        tone: "orange",
      },
      {
        title: "Tourism Magnet",
        state: topTourismState.state,
        value: formatIndianNumber(topTourismState.total),
        note: "total tourist visits",
        tone: "teal",
      },
    ];

  const gdpMapData = gdpData.data.map((d) => ({
    state: d.state,
    value: d.gsdp,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <section className="hero-panel reveal p-8 lg:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs tracking-wider uppercase font-medium backdrop-blur-sm border border-white/10">
                RBI State Data Atlas
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-medium leading-tight tracking-tight">
                Handbook of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                  Statistics on Indian States
                </span>
              </h1>
              <p className="text-lg md:text-xl text-indigo-50/80 max-w-xl leading-relaxed">
                Explore the 10th edition RBI handbook with interactive maps, state
                profiles, and comprehensive data on GDP, banking, exports, and tourism.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/map"
                className="group relative inline-flex items-center gap-2 rounded-full bg-white text-indigo-950 px-8 py-3.5 text-sm font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)]"
              >
                Explore the map
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white px-8 py-3.5 text-sm font-bold transition-all hover:bg-white/10 hover:border-white/50"
              >
                Compare states
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-white/10">
              <HeroStat
                label="States & UTs"
                value={String(statesData.states.length)}
                detail="Covered regions"
              />
              <div className="w-px h-12 bg-white/10" />
              <HeroStat label="Categories" value="4" detail="Core sectors" />
              <div className="w-px h-12 bg-white/10" />
              <HeroStat label="Edition" value="2024-25" detail="10th release" />
            </div>
          </div>

          <div className="relative">
            {/* Abstract Decorative Element */}
            <div className="absolute -inset-4 bg-gradient-to-br from-white/5 to-transparent rounded-3xl blur-2xl opacity-50" />

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Top GDP States
                </h2>
                <Link
                  href="/categories/gdp"
                  className="text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                >
                  View Full List
                </Link>
              </div>

              <div className="space-y-6">
                {topGDPMini.map((state, i) => (
                  <div key={state.state} className="group">
                    <div className="flex items-center justify-between text-sm text-white/90 mb-2">
                      <span className="font-medium group-hover:text-amber-300 transition-colors">{state.state}</span>
                      <span className="font-mono text-white/70">
                        {formatCurrency(state.gsdp)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-black/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.max(10, (state.gsdp / topGDPMax) * 100)}%`,
                          transitionDelay: `${i * 100}ms`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Leader</p>
                  <p className="text-lg font-semibold text-white">{topGDPState.state}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wider text-white/50 mb-1">Fastest Growing</p>
                  <p className="text-lg font-semibold text-emerald-300">+{topGrowthState.growth}%</p>
                  <p className="text-xs text-white/40 mt-0.5">{topGrowthState.state}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal reveal-delay-1">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600/60 mb-2 block">
              National Overview
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900">
              Key Indicators at a Glance
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total GDP"
            value={gdpData.national.totalGDP}
            format="currency"
            subtitle="Gross Domestic Product"
            change={gdpData.national.avgGrowth}
            variant="blue"
          />
          <StatCard
            title="Total Exports"
            value={exportsData.national.totalExports}
            format="currency"
            subtitle="Annual exports"
            change={exportsData.national.growthRate}
            variant="orange"
          />
          <StatCard
            title="Bank Branches"
            value={bankingData.national.totalBranches}
            format="number"
            subtitle="Across all states"
            variant="green"
          />
          <StatCard
            title="Tourist Visits"
            value={tourismData.national.total}
            format="number"
            subtitle="Domestic and foreign"
            variant="purple"
          />
        </div>
      </section>

      <section className="reveal reveal-delay-2">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600/60 mb-2 block">
              State Highlights
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900">
              Leading Regions
            </h2>
          </div>
          <Link
            href="/compare"
            className="group flex items-center gap-2 text-sm font-bold text-indigo-900 hover:text-indigo-600 transition-colors"
          >
            Compare States
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item) => (
            <InsightCard
              key={item.title}
              title={item.title}
              state={item.state}
              value={item.value}
              note={item.note}
              tone={item.tone}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 reveal reveal-delay-2">
        <div className="surface-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              State GDP Distribution
            </h2>
            <Link
              href="/map"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
            >
              Expand Map
            </Link>
          </div>
          <IndiaMap
            data={gdpMapData}
            format="currency"
            onStateClick={(state) => {
              router.push(`/states/${slugify(state)}`);
            }}
          />
        </div>

        <div className="surface-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-slate-900">
              GDP Ranking
            </h2>
            <Link
              href="/categories/gdp"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
            >
              All States
            </Link>
          </div>
          <BarChart
            data={topGDPStates}
            format="currency"
            horizontal
            height={380}
            gradientColors={["#003366", "#2c5282"]}
          />
        </div>
      </section>

      <section className="reveal reveal-delay-3">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-600/60 mb-2 block">
              Deep Dive
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900">
              Explore by Sector
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryCard
            title="State GDP"
            description="Analysis of Gross State Domestic Product and year-over-year growth patterns."
            href="/categories/gdp"
            icon={Icons.chart}
            color="blue"
          />
          <CategoryCard
            title="Banking"
            description="Comprehensive data on bank branch distribution, deposits, and credit flow."
            href="/categories/banking"
            icon={Icons.bank}
            color="green"
          />
          <CategoryCard
            title="Exports"
            description="State-wise export performance and contribution to national trade."
            href="/categories/exports"
            icon={Icons.export}
            color="orange"
          />
          <CategoryCard
            title="Tourism"
            description="Visitor statistics for domestic and foreign tourist arrivals."
            href="/categories/tourism"
            icon={Icons.tourism}
            color="teal"
          />
        </div>
      </section>

      {/* New Section: Quick Stats Banners */}
      <section className="mt-8">
        <div className="surface-card p-10 bg-gradient-to-r from-indigo-900 to-slate-900 border-none text-white relative overflow-hidden">
          {/* Background decorative blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-white/10 pb-6">
              <div>
                <span className="text-amber-400 font-bold tracking-widest uppercase text-xs mb-2 block">National Benchmarks</span>
                <h2 className="text-3xl font-display font-bold text-white">India at a Glance</h2>
              </div>
              <div className="mt-4 md:mt-0 text-white/60 text-sm">
                Averages across all 36 States & UTs
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <QuickStat
                label="Avg GDP Growth"
                value={`${gdpData.national.avgGrowth}%`}
                detail="Year-on-Year"
                trend="positive"
              />
              <QuickStat
                label="Per Capita Income"
                value={`₹${(gdpData.national.avgPerCapita / 1000).toFixed(0)}K`}
                detail="National Avg"
              />
              <QuickStat
                label="Credit-Deposit Ratio"
                value={`${bankingData.national.avgCDRatio}%`}
                detail="Financial Depth"
                trend="neutral"
              />
              <QuickStat
                label="Foreign Arrivals"
                value={`${(tourismData.national.totalForeign / 1000000).toFixed(1)}M`}
                detail="Annual Visitors"
                trend="positive"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const Icons = {
  chart: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  bank: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  ),
  export: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.126-.504 1.126-1.125V14.25m-17.25 4.5h3.75m-3.75 0V14.25m17.25 4.5h-3.75m-3.75 0c1.536 0 3-.559 3.5-1.528 1-1.938 1-6.197 1-6.197.87-1.518 2.72-1.774 3.75-1.5 1.03.275 1.25 1.3 1.25 1.3h-4.25M12 12.75l-4.25-6.75H12M4.5 9.75v1.512c0 .94 1.124 1.488 1.908.93l.813-.58a.75.75 0 01.868 0l1.205.859c.675.481 1.594.022 1.638-.802l.092-1.74" />
    </svg>
  ),
  tourism: (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.875 1.875 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
};

function HeroStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className="text-xs text-white/40">{detail}</p>
    </div>
  );
}

function InsightCard({
  title,
  state,
  value,
  note,
  tone,
}: {
  title: string;
  state: string;
  value: string;
  note: string;
  tone: HighlightTone;
}) {
  const toneStyles: Record<HighlightTone, { badge: string; border: string }> = {
    blue: { badge: "bg-blue-100 text-blue-800", border: "hover:border-blue-200" },
    orange: { badge: "bg-orange-100 text-orange-800", border: "hover:border-orange-200" },
    green: { badge: "bg-emerald-100 text-emerald-800", border: "hover:border-emerald-200" },
    teal: { badge: "bg-teal-100 text-teal-800", border: "hover:border-teal-200" },
  };

  return (
    <Link
      href={`/states/${slugify(state)}`}
      className={`surface-card block p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group border-transparent ${toneStyles[tone].border}`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${toneStyles[tone].badge}`}>
          {title}
        </span>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>

      <div className="flex items-center gap-2 mb-4">
        <div className="h-1 w-8 rounded-full bg-current opacity-20" />
        <span className="text-sm font-medium text-slate-600">{state}</span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed font-medium">
        {note}
      </p>
    </Link>
  );
}

function CategoryCard({
  title,
  description,
  href,
  icon,
  color,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "teal";
}) {
  const styles = {
    blue: { bg: "bg-blue-500", text: "text-blue-600", group: "group-hover:text-blue-600" },
    green: { bg: "bg-emerald-500", text: "text-emerald-600", group: "group-hover:text-emerald-600" },
    orange: { bg: "bg-orange-500", text: "text-orange-600", group: "group-hover:text-orange-600" },
    teal: { bg: "bg-teal-500", text: "text-teal-600", group: "group-hover:text-teal-600" },
  };

  return (
    <Link href={href} className="group h-full">
      <div className="surface-card h-full relative overflow-hidden p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-transparent hover:border-slate-200">
        <div className={`absolute top-0 right-0 p-6 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:opacity-10 ${styles[color].text}`}>
          {/* Large background icon */}
          <div className="w-24 h-24">{icon}</div>
        </div>

        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 shadow-sm border border-slate-100 mb-6 ${styles[color].text}`}>
          {icon}
        </div>

        <h3 className={`text-xl font-bold text-slate-900 mb-3 ${styles[color].group} transition-colors`}>{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>

        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-slate-900 transition-colors mt-auto">
          Explore Data
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function QuickStat({
  label,
  value,
  detail,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="text-left">
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-semibold text-white/80 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {trend === "positive" && (
          <span className="text-emerald-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          </span>
        )}
        <p className="text-xs text-white/50">{detail}</p>
      </div>
    </div>
  );
}
