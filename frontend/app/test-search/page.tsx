"use client";

import { useState, useEffect } from "react";
import { propertiesAPI, amenitiesAPI } from "@/lib/api";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyCard from "@/components/search/PropertyCard";

export default function TestSearchPage() {
  const [properties, setProperties] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, amenitiesRes] = await Promise.all([
        propertiesAPI.getAll({ limit: 6 }),
        amenitiesAPI.getAll(),
      ]);

      setProperties(propertiesRes.data.properties || []);
      setAmenities(amenitiesRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Search Components Test
          </h1>
          <p className="text-gray-600">
            Testing the search bar, filters, and property cards
          </p>
        </div>

        {/* Search Bar Test */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Search Bar</h2>
          <SearchBar variant="hero" />
        </div>

        {/* Filters Test */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <button
            onClick={() => setShowFilters(true)}
            className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            Open Filters Modal
          </button>
          <div className="mt-4 text-sm text-gray-600">
            Loaded {amenities.length} amenities
          </div>
        </div>

        {/* Property Cards Test */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-6">Property Cards</h2>

          {loading ? (
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
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant="grid"
                  />
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">List View</h3>
                <div className="space-y-4">
                  {properties.slice(0, 2).map((property) => (
                    <PropertyCard
                      key={`list-${property.id}`}
                      property={property}
                      variant="list"
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No properties found. Make sure the backend is running and seeded.
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Properties:</span>{" "}
              {properties.length}
            </div>
            <div>
              <span className="font-medium">Amenities:</span> {amenities.length}
            </div>
            <div>
              <span className="font-medium">Backend URL:</span>{" "}
              {process.env.NEXT_PUBLIC_API_URL}
            </div>
            <div>
              <span className="font-medium">Mapbox Token:</span>{" "}
              {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? "✅ Set" : "❌ Missing"}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      <SearchFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={() => {
          setShowFilters(false);
          console.log("Filters applied!");
        }}
      />
    </div>
  );
}
