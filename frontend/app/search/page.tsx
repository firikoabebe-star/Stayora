"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  Map as MapIcon,
  Grid3X3,
  List,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { useSearchStore } from "@/lib/store";
import { propertiesAPI } from "@/lib/api";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyCard from "@/components/search/PropertyCard";
import SearchMap from "@/components/search/SearchMap";
import toast from "react-hot-toast";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price", label: "Price: Low to High" },
  { value: "rating", label: "Highest Rated" },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { filters, setFilters, results, setResults, isLoading, setLoading } =
    useSearchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Initialize filters from URL params
  useEffect(() => {
    const location = searchParams.get("location");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const guests = searchParams.get("guests");

    if (location || checkIn || checkOut || guests) {
      setFilters({
        location: location || "",
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: guests ? parseInt(guests) : 1,
      });
    }
  }, [searchParams, setFilters]);

  // Search function
  const searchProperties = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const params: any = {
          page,
          limit: 20,
          sortBy,
        };

        if (filters.location) params.location = filters.location;
        if (filters.checkIn)
          params.checkIn = filters.checkIn.toISOString().split("T")[0];
        if (filters.checkOut)
          params.checkOut = filters.checkOut.toISOString().split("T")[0];
        if (filters.guests > 1) params.guests = filters.guests;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.propertyType) params.type = filters.propertyType;
        if (filters.amenities?.length)
          params.amenities = filters.amenities.join(",");

        const response = await propertiesAPI.getAll(params);
        const data = response.data;

        setResults(data.properties || []);
        setTotalResults(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 0);
        setCurrentPage(page);
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Failed to search properties");
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, sortBy, setLoading, setResults],
  );

  // Search when filters change
  useEffect(() => {
    searchProperties(1);
  }, [searchProperties]);

  const handleFilterApply = () => {
    setShowFilters(false);
    searchProperties(1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setShowSortMenu(false);
  };

  const handlePageChange = (page: number) => {
    searchProperties(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters = !!(
    filters.minPrice ||
    filters.maxPrice ||
    filters.propertyType ||
    filters.amenities?.length
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar variant="header" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Results Count */}
              <div className="text-sm text-gray-600">
                {isLoading
                  ? "Searching..."
                  : `${totalResults} ${totalResults === 1 ? "property" : "properties"} found`}
              </div>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(true)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors
                  ${
                    hasActiveFilters
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>
                    {sortOptions.find((opt) => opt.value === sortBy)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[200px] z-20"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`
                            w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors
                            ${sortBy === option.value ? "text-rose-600 bg-rose-50" : ""}
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid"
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Map Toggle */}
              <button
                onClick={() => setShowMap(!showMap)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors
                  ${
                    showMap
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <MapIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`flex gap-6 ${showMap ? "h-[calc(100vh-200px)]" : ""}`}>
          {/* Results */}
          <div className={`${showMap ? "flex-1 overflow-y-auto" : "w-full"}`}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-[4/3] rounded-2xl mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div
                  className={`
                  ${
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-6"
                  }
                `}
                >
                  {results.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      variant={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`
                            px-4 py-2 rounded-lg transition-colors
                            ${
                              currentPage === page
                                ? "bg-gray-900 text-white"
                                : "border border-gray-300 hover:border-gray-400"
                            }
                          `}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MapIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={() => setShowFilters(true)}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors"
                >
                  Adjust Filters
                </button>
              </div>
            )}
          </div>

          {/* Map */}
          {showMap && (
            <div className="w-1/2 rounded-2xl overflow-hidden shadow-lg">
              <SearchMap
                properties={results}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filters Modal */}
      <SearchFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
      />
    </div>
  );
}
