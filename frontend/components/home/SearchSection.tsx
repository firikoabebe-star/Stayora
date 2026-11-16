"use client";

import { motion } from "framer-motion";
import { Search, Filter, Map, List } from "lucide-react";
import { useThemeClasses } from "@/lib/theme";

export function SearchSection() {
  const theme = useThemeClasses();

  return (
    <section className={`py-16 ${theme.backgroundSecondary}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl md:text-4xl font-bold ${theme.text} mb-4`}>
            Explore Amazing Places
          </h2>
          <p className={`text-lg ${theme.textSecondary} max-w-2xl mx-auto`}>
            Use our advanced search to find the perfect accommodation for your
            next adventure
          </p>
        </motion.div>

        {/* Search Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className={`${theme.card} rounded-2xl shadow-lg p-6 mb-8`}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            {/* Location */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Location
              </label>
              <input
                type="text"
                placeholder="Where are you going?"
                className={`w-full px-4 py-3 rounded-lg ${theme.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Check-in */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Check-in
              </label>
              <input
                type="date"
                className={`w-full px-4 py-3 rounded-lg ${theme.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Check-out */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Check-out
              </label>
              <input
                type="date"
                className={`w-full px-4 py-3 rounded-lg ${theme.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>

            {/* Guests */}
            <div>
              <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                Guests
              </label>
              <select
                className={`w-full px-4 py-3 rounded-lg ${theme.input} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              >
                <option>1 guest</option>
                <option>2 guests</option>
                <option>3 guests</option>
                <option>4+ guests</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="flex space-x-2">
              <button
                className={`flex-1 flex items-center justify-center space-x-2 ${theme.button} px-6 py-3 rounded-lg transition-colors font-medium`}
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button
                className={`p-3 ${theme.border} border rounded-lg ${theme.borderHover} transition-colors`}
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div className={`text-sm ${theme.textSecondary}`}>
            <span className="font-semibold">300+</span> properties found
          </div>

          <div className="flex items-center space-x-2">
            <span className={`text-sm ${theme.textSecondary}`}>View:</span>
            <div className={`flex ${theme.backgroundSecondary} rounded-lg p-1`}>
              <button
                className={`flex items-center space-x-1 px-3 py-1 ${theme.background} rounded-md shadow-sm text-sm font-medium`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
              <button
                className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium ${theme.textSecondary} hover:${theme.text}`}
              >
                <Map className="w-4 h-4" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3"
        >
          {[
            "Entire place",
            "Pet friendly",
            "Instant book",
            "Free cancellation",
            "WiFi",
            "Kitchen",
            "Pool",
            "Parking",
          ].map((filter, index) => (
            <button
              key={filter}
              className={`px-4 py-2 ${theme.border} border rounded-full text-sm font-medium ${theme.borderHover} transition-colors`}
            >
              {filter}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
