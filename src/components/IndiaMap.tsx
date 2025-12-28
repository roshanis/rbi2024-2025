"use client";

import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { formatIndianNumber, formatCurrency } from "@/lib/formatters";

// India GeoJSON (local) to avoid remote fetch/CORS issues.
const INDIA_TOPO_URL = "/india-states.json";

interface StateData {
  state: string;
  value: number;
  [key: string]: unknown;
}

interface IndiaMapProps {
  data: StateData[];
  valueKey?: string;
  title?: string;
  format?: "number" | "currency" | "percentage";
  colorScale?: string[];
  onStateClick?: (stateName: string) => void;
}

// State name mapping (TopoJSON names to our data names)
const stateNameMapping: Record<string, string> = {
  "Andaman and Nicobar": "Andaman and Nicobar Islands",
  "Arunachal Pradesh": "Arunachal Pradesh",
  "Assam": "Assam",
  "Bihar": "Bihar",
  "Chandigarh": "Chandigarh",
  "Chhattisgarh": "Chhattisgarh",
  "Dadra and Nagar Haveli": "Dadra and Nagar Haveli and Daman and Diu",
  "Daman and Diu": "Dadra and Nagar Haveli and Daman and Diu",
  "NCT of Delhi": "Delhi",
  "Delhi": "Delhi",
  "Goa": "Goa",
  "Gujarat": "Gujarat",
  "Haryana": "Haryana",
  "Himachal Pradesh": "Himachal Pradesh",
  "Jammu and Kashmir": "Jammu and Kashmir",
  "Jharkhand": "Jharkhand",
  "Karnataka": "Karnataka",
  "Kerala": "Kerala",
  "Lakshadweep": "Lakshadweep",
  "Madhya Pradesh": "Madhya Pradesh",
  "Maharashtra": "Maharashtra",
  "Manipur": "Manipur",
  "Meghalaya": "Meghalaya",
  "Mizoram": "Mizoram",
  "Nagaland": "Nagaland",
  "Odisha": "Odisha",
  "Orissa": "Odisha",
  "Puducherry": "Puducherry",
  "Pondicherry": "Puducherry",
  "Punjab": "Punjab",
  "Rajasthan": "Rajasthan",
  "Sikkim": "Sikkim",
  "Tamil Nadu": "Tamil Nadu",
  "Telangana": "Telangana",
  "Tripura": "Tripura",
  "Uttar Pradesh": "Uttar Pradesh",
  "Uttarakhand": "Uttarakhand",
  "Uttaranchal": "Uttarakhand",
  "West Bengal": "West Bengal",
  "Andhra Pradesh": "Andhra Pradesh",
  "Ladakh": "Ladakh",
};

export default function IndiaMap({
  data,
  valueKey = "value",
  title,
  format = "number",
  colorScale = ["#e8f4f8", "#b3d9e8", "#7ebfd8", "#49a5c8", "#148bb8", "#003366"],
  onStateClick,
}: IndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{
    name: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((item) => {
      map.set(item.state, item[valueKey] as number);
    });
    return map;
  }, [data, valueKey]);

  // Calculate min and max for color scaling
  const { min, max } = useMemo(() => {
    const values = data.map((d) => d[valueKey] as number);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [data, valueKey]);

  const getColor = (value: number | undefined) => {
    if (value === undefined) return "#e5e7eb";
    const range = max - min;
    if (range <= 0) return colorScale[colorScale.length - 1];
    const ratio = (value - min) / range;
    const index = Math.min(
      Math.floor(ratio * (colorScale.length - 1)),
      colorScale.length - 1
    );
    return colorScale[index];
  };

  const formatValue = (value: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(value);
      case "percentage":
        return `${value.toFixed(1)}%`;
      default:
        return formatIndianNumber(value);
    }
  };

  const getStateName = (geoName: string): string => {
    return stateNameMapping[geoName] || geoName;
  };

  return (
    <div className="relative w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <div className="relative bg-gray-50 rounded-xl overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 1000,
            center: [82, 22],
          }}
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup zoom={1}>
            <Geographies geography={INDIA_TOPO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoName = geo.properties.NAME_1 || geo.properties.name;
                  const stateName = getStateName(geoName);
                  const value = dataMap.get(stateName);
                  const isHovered = hoveredState === stateName;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(value)}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 0.5}
                      style={{
                        default: {
                          outline: "none",
                          transition: "all 0.2s",
                        },
                        hover: {
                          fill: "#ff9933",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#ff9933",
                          outline: "none",
                        },
                      }}
                      onMouseEnter={(evt) => {
                        setHoveredState(stateName);
                        if (value !== undefined) {
                          setTooltipContent({
                            name: stateName,
                            value,
                            x: evt.clientX,
                            y: evt.clientY,
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredState(null);
                        setTooltipContent(null);
                      }}
                      onClick={() => {
                        if (onStateClick) {
                          onStateClick(stateName);
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Tooltip */}
        {tooltipContent && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipContent.x + 10,
              top: tooltipContent.y - 10,
            }}
          >
            <div className="surface-card px-4 py-3">
              <p className="font-medium text-slate-900">{tooltipContent.name}</p>
              <p className="text-[#0b2d52] font-semibold text-lg">
                {formatValue(tooltipContent.value)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{formatValue(min)}</span>
        <div className="flex-1">
          <div className="h-3 w-full rounded-full overflow-hidden flex border border-slate-200/80">
            {colorScale.map((color, i) => (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
