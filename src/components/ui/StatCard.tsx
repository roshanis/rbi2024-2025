"use client";

import { formatIndianNumber, formatCurrency, formatPercentage } from "@/lib/formatters";

interface StatCardProps {
  title: string;
  value: number;
  format?: "number" | "currency" | "percentage";
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  variant?: "blue" | "orange" | "green" | "purple" | "default";
}

const variantClasses = {
  blue: "stat-card-gdp text-white",
  orange: "stat-card-exports text-white",
  green: "stat-card-banking text-white",
  purple: "stat-card-tourism text-white",
  default: "bg-white border border-gray-200 text-gray-900",
};

export default function StatCard({
  title,
  value,
  format = "number",
  subtitle,
  change,
  icon,
  variant = "default",
}: StatCardProps) {
  const formattedValue = (() => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return formatPercentage(value);
      default:
        return formatIndianNumber(value);
    }
  })();

  const isLight = variant === "default";

  return (
    <div
      className={`rounded-xl p-6 transition-all hover:shadow-lg ${variantClasses[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              isLight ? "text-gray-500" : "text-white/80"
            }`}
          >
            {title}
          </p>
          <p
            className={`mt-2 text-3xl font-bold ${
              isLight ? "text-gray-900" : "text-white"
            }`}
          >
            {formattedValue}
          </p>
          {subtitle && (
            <p
              className={`mt-1 text-sm ${
                isLight ? "text-gray-500" : "text-white/70"
              }`}
            >
              {subtitle}
            </p>
          )}
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  change >= 0
                    ? isLight
                      ? "text-green-600"
                      : "text-green-300"
                    : isLight
                    ? "text-red-600"
                    : "text-red-300"
                }`}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
              </span>
              <span
                className={`text-xs ${
                  isLight ? "text-gray-400" : "text-white/60"
                }`}
              >
                vs last year
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-lg ${
              isLight ? "bg-gray-100" : "bg-white/20"
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
