"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  SlidersHorizontal,
  Home,
  Building,
  Castle,
  Sparkles,
} from "lucide-react";
import { useSearchStore } from "@/lib/store";
import { amenitiesAPI } from "@/lib/api";

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

const propertyTypes = [
  { value: "APARTMENT", label: "Apartment", icon: Building },
  { value: "HOUSE", label: "House", icon: Home },
  { value: "VILLA", label: "Villa", icon: Castle },
  { value: "UNIQUE_STAY", label: "Unique Stay", icon: Sparkles },
];

export default function SearchFilters({
  isOpen,
  onClose,
  onApply,
}: SearchFiltersProps) {
  const { filters, setFilters } = useSearchStore();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || 0,
    max: filters.maxPrice || 1000,
  });

  // Load amenities
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        setLoading(true);
        const response = await amenitiesAPI.getAll();
        setAmenities(response.data);
      } catch (error) {
        console.error("Failed to load amenities:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadAmenities();
    }
  }, [isOpen]);

  const handlePriceChange = (type: "min" | "max", value: number) => {
    setPriceRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    const currentAmenities = filters.amenities || [];
    const isSelected = currentAmenities.includes(amenityId);

    if (isSelected) {
      setFilters({
        amenities: currentAmenities.filter((id) => id !== amenityId),
      });
    } else {
      setFilters({
        amenities: [...currentAmenities, amenityId],
      });
    }
  };

  const handleApply = () => {
    setFilters({
      minPrice: priceRange.min > 0 ? priceRange.min : undefined,
      maxPrice: priceRange.max < 1000 ? priceRange.max : undefined,
    });
    onApply();
  };

  const handleClear = () => {
    setFilters({
      minPrice: undefined,
      maxPrice: undefined,
      propertyType: undefined,
      amenities: [],
    });
    setPriceRange({ min: 0, max: 1000 });
  };

  const groupedAmenities = amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    },
    {} as Record<string, Amenity[]>,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:transform md:-translate-x-1/2 md:w-full md:max-w-4xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) =>
                            handlePriceChange(
                              "min",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) =>
                            handlePriceChange(
                              "max",
                              parseInt(e.target.value) || 1000,
                            )
                          }
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          placeholder="1000+"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.min}
                      onChange={(e) =>
                        handlePriceChange("min", parseInt(e.target.value))
                      }
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) =>
                        handlePriceChange("max", parseInt(e.target.value))
                      }
                      className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Property Type
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {propertyTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = filters.propertyType === type.value;

                    return (
                      <button
                        key={type.value}
                        onClick={() =>
                          setFilters({
                            propertyType: isSelected ? undefined : type.value,
                          })
                        }
                        className={`
                          p-4 rounded-xl border-2 transition-all text-center
                          ${
                            isSelected
                              ? "border-rose-500 bg-rose-50 text-rose-700"
                              : "border-gray-200 hover:border-gray-300"
                          }
                        `}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Amenities
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedAmenities).map(
                      ([category, categoryAmenities]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {categoryAmenities.map((amenity) => {
                              const isSelected =
                                filters.amenities?.includes(amenity.id) ||
                                false;

                              return (
                                <button
                                  key={amenity.id}
                                  onClick={() =>
                                    handleAmenityToggle(amenity.id)
                                  }
                                  className={`
                                  p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3
                                  ${
                                    isSelected
                                      ? "border-rose-500 bg-rose-50 text-rose-700"
                                      : "border-gray-200 hover:border-gray-300"
                                  }
                                `}
                                >
                                  <span className="text-lg">
                                    {amenity.icon}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {amenity.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClear}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Clear all
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleApply}
                  className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Show results
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
