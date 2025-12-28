/**
 * Indian number formatting utilities
 * Formats numbers in lakhs and crores as per Indian numbering system
 */

export function formatIndianNumber(num: number): string {
  if (num === 0) return "0";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (absNum >= 10000000) {
    // Crores (1 crore = 10 million)
    const crores = absNum / 10000000;
    return sign + crores.toFixed(2).replace(/\.?0+$/, "") + " Cr";
  } else if (absNum >= 100000) {
    // Lakhs (1 lakh = 100,000)
    const lakhs = absNum / 100000;
    return sign + lakhs.toFixed(2).replace(/\.?0+$/, "") + " L";
  } else if (absNum >= 1000) {
    // Thousands
    const thousands = absNum / 1000;
    return sign + thousands.toFixed(2).replace(/\.?0+$/, "") + " K";
  }

  return sign + absNum.toLocaleString("en-IN");
}

export function formatCurrency(num: number): string {
  return "₹" + formatIndianNumber(num);
}

export function formatPercentage(num: number, decimals: number = 1): string {
  return num.toFixed(decimals) + "%";
}

export function formatFullNumber(num: number): string {
  return num.toLocaleString("en-IN");
}

// Format large numbers with full Indian notation
export function formatIndianFull(num: number): string {
  if (num === 0) return "0";

  const absNum = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  // Split into crores, lakhs, thousands, hundreds
  const crores = Math.floor(absNum / 10000000);
  const lakhs = Math.floor((absNum % 10000000) / 100000);
  const thousands = Math.floor((absNum % 100000) / 1000);
  const remaining = absNum % 1000;

  let result = "";
  if (crores > 0) result += crores + ",";
  if (crores > 0 || lakhs > 0) result += (crores > 0 ? String(lakhs).padStart(2, "0") : lakhs) + ",";
  if (crores > 0 || lakhs > 0 || thousands > 0) {
    result += (crores > 0 || lakhs > 0 ? String(thousands).padStart(2, "0") : thousands) + ",";
  }
  result += (crores > 0 || lakhs > 0 || thousands > 0 ? String(remaining).padStart(3, "0") : remaining);

  return sign + result.replace(/^,+|,+$/g, "");
}

// Get color based on value in a range
export function getColorForValue(
  value: number,
  min: number,
  max: number,
  colors: string[] = ["#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c"]
): string {
  const normalized = (value - min) / (max - min);
  const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
  return colors[Math.max(0, index)];
}

// State name utilities
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function deslugify(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
