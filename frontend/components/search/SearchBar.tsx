"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { useSearchStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useThemeClasses } from "@/lib/theme";
import "react-datepicker/dist/react-datepicker.css";

interface SearchBarProps {
  variant?: "hero" | "header";
  onSearch?: () => void;
}

export default function SearchBar({
  variant = "hero",
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const { filters, setFilters } = useSearchStore();
  const themeClasses = useThemeClasses();
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const isHero = variant === "hero";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setActiveField(null);
        setShowGuestPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const searchParams = new URLSearchParams();

    if (filters.location) searchParams.set("location", filters.location);
    if (filters.checkIn)
      searchParams.set("checkIn", format(filters.checkIn, "yyyy-MM-dd"));
    if (filters.checkOut)
      searchParams.set("checkOut", format(filters.checkOut, "yyyy-MM-dd"));
    if (filters.guests > 1)
      searchParams.set("guests", filters.guests.toString());

    router.push(`/search?${searchParams.toString()}`);
    onSearch?.();
  };

  const incrementGuests = () => {
    if (filters.guests < 16) {
      setFilters({ guests: filters.guests + 1 });
    }
  };

  const decrementGuests = () => {
    if (filters.guests > 1) {
      setFilters({ guests: filters.guests - 1 });
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <motion.div
        className={`
          ${themeClasses.card} rounded-full shadow-lg overflow-hidden
          ${isHero ? "p-2" : "p-1"}
        `}
        initial={false}
        animate={{
          scale: activeField ? 1.02 : 1,
          boxShadow: activeField
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className={`flex items-center ${isHero ? "gap-0" : "gap-1"}`}>
          {/* Location */}
          <div className="flex-1 relative">
            <button
              onClick={() =>
                setActiveField(activeField === "location" ? null : "location")
              }
              className={`
                w-full text-left px-6 py-4 rounded-full transition-colors
                ${activeField === "location" ? themeClasses.backgroundSecondary : `hover:${themeClasses.backgroundSecondary}`}
                ${isHero ? "py-4" : "py-3"}
              `}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div
                    className={`text-xs font-medium ${themeClasses.text} uppercase tracking-wide`}
                  >
                    Where
                  </div>
                  <div
                    className={`text-sm ${themeClasses.textSecondary} truncate`}
                  >
                    {filters.location || "Search destinations"}
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {activeField === "location" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full left-0 right-0 mt-2 ${themeClasses.card} rounded-2xl shadow-xl p-4 z-50`}
                >
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={filters.location}
                    onChange={(e) => setFilters({ location: e.target.value })}
                    className={`w-full px-4 py-3 ${themeClasses.input} rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent`}
                    autoFocus
                  />
                  <div className="mt-4 space-y-2">
                    {[
                      "New York",
                      "Los Angeles",
                      "Miami",
                      "San Francisco",
                      "Chicago",
                    ].map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setFilters({ location: city });
                          setActiveField(null);
                        }}
                        className={`w-full text-left px-4 py-2 hover:${themeClasses.backgroundSecondary} rounded-lg flex items-center gap-3`}
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{city}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className={`w-px h-8 ${themeClasses.border}`} />

          {/* Check-in */}
          <div className="flex-1 relative">
            <button
              onClick={() =>
                setActiveField(activeField === "checkin" ? null : "checkin")
              }
              className={`
                w-full text-left px-6 py-4 rounded-full transition-colors
                ${activeField === "checkin" ? themeClasses.backgroundSecondary : `hover:${themeClasses.backgroundSecondary}`}
                ${isHero ? "py-4" : "py-3"}
              `}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div
                    className={`text-xs font-medium ${themeClasses.text} uppercase tracking-wide`}
                  >
                    Check in
                  </div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>
                    {filters.checkIn
                      ? format(filters.checkIn, "MMM dd")
                      : "Add dates"}
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {activeField === "checkin" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full left-0 mt-2 ${themeClasses.card} rounded-2xl shadow-xl p-4 z-50`}
                >
                  <DatePicker
                    selected={filters.checkIn}
                    onChange={(date) => setFilters({ checkIn: date })}
                    selectsStart
                    startDate={filters.checkIn}
                    endDate={filters.checkOut}
                    minDate={new Date()}
                    inline
                    calendarClassName="custom-datepicker"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className={`w-px h-8 ${themeClasses.border}`} />

          {/* Check-out */}
          <div className="flex-1 relative">
            <button
              onClick={() =>
                setActiveField(activeField === "checkout" ? null : "checkout")
              }
              className={`
                w-full text-left px-6 py-4 rounded-full transition-colors
                ${activeField === "checkout" ? themeClasses.backgroundSecondary : `hover:${themeClasses.backgroundSecondary}`}
                ${isHero ? "py-4" : "py-3"}
              `}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div
                    className={`text-xs font-medium ${themeClasses.text} uppercase tracking-wide`}
                  >
                    Check out
                  </div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>
                    {filters.checkOut
                      ? format(filters.checkOut, "MMM dd")
                      : "Add dates"}
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {activeField === "checkout" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full left-0 mt-2 ${themeClasses.card} rounded-2xl shadow-xl p-4 z-50`}
                >
                  <DatePicker
                    selected={filters.checkOut}
                    onChange={(date) => setFilters({ checkOut: date })}
                    selectsEnd
                    startDate={filters.checkIn}
                    endDate={filters.checkOut}
                    minDate={filters.checkIn || new Date()}
                    inline
                    calendarClassName="custom-datepicker"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className={`w-px h-8 ${themeClasses.border}`} />

          {/* Guests */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowGuestPicker(!showGuestPicker)}
              className={`
                w-full text-left px-6 py-4 rounded-full transition-colors
                ${showGuestPicker ? themeClasses.backgroundSecondary : `hover:${themeClasses.backgroundSecondary}`}
                ${isHero ? "py-4" : "py-3"}
              `}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div
                    className={`text-xs font-medium ${themeClasses.text} uppercase tracking-wide`}
                  >
                    Who
                  </div>
                  <div className={`text-sm ${themeClasses.textSecondary}`}>
                    {filters.guests === 1
                      ? "1 guest"
                      : `${filters.guests} guests`}
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {showGuestPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full right-0 mt-2 ${themeClasses.card} rounded-2xl shadow-xl p-6 z-50 min-w-[280px]`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`font-medium ${themeClasses.text}`}>
                        Guests
                      </div>
                      <div className={`text-sm ${themeClasses.textMuted}`}>
                        Ages 13 or above
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={decrementGuests}
                        disabled={filters.guests <= 1}
                        className={`w-8 h-8 rounded-full ${themeClasses.border} flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.borderHover} transition-colors`}
                      >
                        -
                      </button>
                      <span
                        className={`w-8 text-center font-medium ${themeClasses.text}`}
                      >
                        {filters.guests}
                      </span>
                      <button
                        onClick={incrementGuests}
                        disabled={filters.guests >= 16}
                        className={`w-8 h-8 rounded-full ${themeClasses.border} flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${themeClasses.borderHover} transition-colors`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <motion.button
            onClick={handleSearch}
            className={`
              bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center transition-colors
              ${isHero ? "w-12 h-12 ml-2" : "w-10 h-10 ml-1"}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search className={isHero ? "w-5 h-5" : "w-4 h-4"} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
