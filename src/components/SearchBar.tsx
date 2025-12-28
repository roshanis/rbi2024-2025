"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import statesData from "@/data/states.json";

interface State {
  code: string;
  name: string;
  region: string;
  capital: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter states based on query
  const filteredStates = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    return statesData.states.filter((state: State) => {
      return (
        state.name.toLowerCase().includes(searchTerm) ||
        state.capital.toLowerCase().includes(searchTerm) ||
        state.region.toLowerCase().includes(searchTerm) ||
        state.code.toLowerCase() === searchTerm
      );
    });
  }, [query]);

  // Generate slug for state URL
  const getStateSlug = (stateName: string): string => {
    return stateName.toLowerCase().replace(/\s+/g, "-");
  };

  // Navigate to state page
  const navigateToState = useCallback((state: State) => {
    const slug = getStateSlug(state.name);
    router.push(`/states/${slug}`);
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [router]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredStates.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredStates.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredStates.length) {
          navigateToState(filteredStates[selectedIndex]);
        } else if (filteredStates.length === 1) {
          navigateToState(filteredStates[0]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [isOpen, filteredStates, selectedIndex, navigateToState]);

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex + 1] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Get region color for badge
  const getRegionColor = (region: string): string => {
    const colors: Record<string, string> = {
      North: "bg-blue-100 text-blue-700",
      South: "bg-green-100 text-green-700",
      East: "bg-yellow-100 text-yellow-700",
      West: "bg-orange-100 text-orange-700",
      Central: "bg-purple-100 text-purple-700",
      Northeast: "bg-pink-100 text-pink-700",
      Islands: "bg-cyan-100 text-cyan-700",
    };
    return colors[region] || "bg-gray-100 text-gray-700";
  };

  // Highlight matching text
  const highlightMatch = (text: string, searchQuery: string): React.ReactNode => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search states..."
          aria-label="Search states"
          aria-expanded={isOpen && filteredStates.length > 0}
          aria-controls="search-results"
          aria-activedescendant={
            selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined
          }
          role="combobox"
          autoComplete="off"
          className="w-full sm:w-64 pl-10 pr-12 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
        />
        {/* Keyboard shortcut hint */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono text-blue-200 bg-white/10 rounded border border-white/20">
            <span className="text-[10px]">
              {typeof navigator !== "undefined" && navigator.platform?.includes("Mac")
                ? "Cmd"
                : "Ctrl"}
            </span>
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim() && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-80 overflow-y-auto sm:w-96 sm:left-auto sm:right-0"
        >
          {filteredStates.length > 0 ? (
            <>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                {filteredStates.length} state{filteredStates.length !== 1 ? "s" : ""} found
              </div>
              {filteredStates.map((state: State, index: number) => (
                <button
                  key={state.code}
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => navigateToState(state)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-start gap-3 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-[#003366] text-white"
                      : "hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  {/* State Code Badge */}
                  <span
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === selectedIndex
                        ? "bg-white/20 text-white"
                        : "bg-[#003366] text-white"
                    }`}
                  >
                    {state.code}
                  </span>

                  {/* State Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {highlightMatch(state.name, query)}
                    </div>
                    <div
                      className={`text-sm flex items-center gap-2 mt-0.5 ${
                        index === selectedIndex ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      <span>Capital: {highlightMatch(state.capital, query)}</span>
                      <span className="text-gray-300">|</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          index === selectedIndex
                            ? "bg-white/20 text-white"
                            : getRegionColor(state.region)
                        }`}
                      >
                        {state.region}
                      </span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <svg
                    className={`flex-shrink-0 w-5 h-5 ${
                      index === selectedIndex ? "text-white" : "text-gray-400"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ))}
              {/* Keyboard navigation hint */}
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">
                    Arrow
                  </kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">
                    Enter
                  </kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">
                    Esc
                  </kbd>
                  to close
                </span>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium text-gray-600">No states found</p>
              <p className="text-sm mt-1">Try searching by state name, capital, or region</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
