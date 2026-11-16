"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";

interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface AmenityGridProps {
  amenities: Amenity[];
}

export default function AmenityGrid({ amenities }: AmenityGridProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Group amenities by category
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

  // Show first 10 amenities in grid view
  const displayedAmenities = amenities.slice(0, 10);
  const hasMoreAmenities = amenities.length > 10;

  return (
    <>
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          What this place offers
        </h2>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {displayedAmenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center gap-4 py-3">
              <span className="text-2xl">{amenity.icon}</span>
              <span className="text-gray-900">{amenity.name}</span>
            </div>
          ))}
        </div>

        {/* Show All Button */}
        {hasMoreAmenities && (
          <button
            onClick={() => setShowAllAmenities(true)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
          >
            <span>Show all {amenities.length} amenities</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* All Amenities Modal */}
      <AnimatePresence>
        {showAllAmenities && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllAmenities(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:transform md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  What this place offers
                </h2>
                <button
                  onClick={() => setShowAllAmenities(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {Object.entries(groupedAmenities).map(
                  ([category, categoryAmenities]) => (
                    <div key={category} className="mb-8 last:mb-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="space-y-4">
                        {categoryAmenities.map((amenity) => (
                          <div
                            key={amenity.id}
                            className="flex items-center gap-4 py-2"
                          >
                            <span className="text-2xl">{amenity.icon}</span>
                            <span className="text-gray-900">
                              {amenity.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
