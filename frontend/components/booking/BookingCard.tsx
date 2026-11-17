"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, Star, ChevronDown } from "lucide-react";
import { format, differenceInDays, addDays, isBefore, isAfter } from "date-fns";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { bookingsAPI, propertiesAPI } from "@/lib/api";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";

interface BookingCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    avgRating: number;
    reviewCount: number;
    maxGuests: number;
  };
}

export default function BookingCard({ property }: BookingCardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<
    "checkin" | "checkout" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Calculate pricing
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * property.price;
  const serviceFee = subtotal * 0.14; // 14% service fee
  const taxes = subtotal * 0.08; // 8% taxes
  const total = subtotal + serviceFee + taxes;

  // Check availability when dates change
  useEffect(() => {
    if (checkIn && checkOut && nights > 0) {
      checkAvailability();
    }
  }, [checkIn, checkOut]);

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) return;

    try {
      setCheckingAvailability(true);
      const response = await propertiesAPI.checkAvailability(
        property.id,
        format(checkIn, "yyyy-MM-dd"),
        format(checkOut, "yyyy-MM-dd"),
      );
      setAvailability(response.data);
    } catch (error) {
      console.error("Failed to check availability:", error);
      setAvailability({ available: false });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to make a booking");
      router.push("/auth/login");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (guests > property.maxGuests) {
      toast.error(`Maximum ${property.maxGuests} guests allowed`);
      return;
    }

    if (!availability?.available) {
      toast.error("Property is not available for selected dates");
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        propertyId: property.id,
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
        guests,
        totalPrice: total,
      };

      const response = await bookingsAPI.create(bookingData);

      toast.success("Booking created successfully!");
      router.push(`/booking/${response.data.id}`);
    } catch (error: any) {
      console.error("Booking failed:", error);
      const message = error.response?.data?.error || "Failed to create booking";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const incrementGuests = () => {
    if (guests < property.maxGuests) {
      setGuests(guests + 1);
    }
  };

  const decrementGuests = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    return isBefore(date, new Date());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sticky top-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">
              ${property.price}
            </span>
            <span className="text-gray-600">/ night</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{property.avgRating.toFixed(1)}</span>
          <span className="text-gray-600">({property.reviewCount})</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="border border-gray-300 rounded-xl overflow-hidden mb-4">
        <div className="grid grid-cols-2">
          {/* Check-in */}
          <button
            onClick={() =>
              setShowDatePicker(showDatePicker === "checkin" ? null : "checkin")
            }
            className="p-4 text-left border-r border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-1">
              Check-in
            </div>
            <div className="text-sm text-gray-600">
              {checkIn ? format(checkIn, "MMM dd, yyyy") : "Add date"}
            </div>
          </button>

          {/* Check-out */}
          <button
            onClick={() =>
              setShowDatePicker(
                showDatePicker === "checkout" ? null : "checkout",
              )
            }
            className="p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-1">
              Check-out
            </div>
            <div className="text-sm text-gray-600">
              {checkOut ? format(checkOut, "MMM dd, yyyy") : "Add date"}
            </div>
          </button>
        </div>

        {/* Date Picker */}
        {showDatePicker && (
          <div className="border-t border-gray-300 p-4">
            <DatePicker
              selected={showDatePicker === "checkin" ? checkIn : checkOut}
              onChange={(date) => {
                if (showDatePicker === "checkin") {
                  setCheckIn(date);
                  if (date && checkOut && !isAfter(checkOut, date)) {
                    setCheckOut(addDays(date, 1));
                  }
                } else {
                  setCheckOut(date);
                }
                setShowDatePicker(null);
              }}
              selectsStart={showDatePicker === "checkin"}
              selectsEnd={showDatePicker === "checkout"}
              startDate={checkIn}
              endDate={checkOut}
              minDate={
                showDatePicker === "checkin"
                  ? new Date()
                  : checkIn || new Date()
              }
              filterDate={(date) => !isDateDisabled(date)}
              inline
              calendarClassName="booking-datepicker"
            />
          </div>
        )}
      </div>

      {/* Guests */}
      <div className="relative mb-6">
        <button
          onClick={() => setShowGuestPicker(!showGuestPicker)}
          className="w-full p-4 border border-gray-300 rounded-xl text-left hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-1">
                Guests
              </div>
              <div className="text-sm text-gray-600">
                {guests === 1 ? "1 guest" : `${guests} guests`}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showGuestPicker ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {showGuestPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-10"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Guests</div>
                <div className="text-sm text-gray-500">Ages 13 or above</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={decrementGuests}
                  disabled={guests <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{guests}</span>
                <button
                  onClick={incrementGuests}
                  disabled={guests >= property.maxGuests}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Availability Status */}
      {checkIn && checkOut && (
        <div className="mb-4">
          {checkingAvailability ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-500"></div>
              <span>Checking availability...</span>
            </div>
          ) : availability ? (
            <div
              className={`text-sm ${availability.available ? "text-green-600" : "text-red-600"}`}
            >
              {availability.available
                ? "✅ Available for selected dates"
                : "❌ Not available for selected dates"}
            </div>
          ) : null}
        </div>
      )}

      {/* Pricing Breakdown */}
      {nights > 0 && (
        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span>
              ${property.price} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Taxes</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Total */}
      {nights > 0 && (
        <div className="flex items-center justify-between font-semibold text-lg mb-6">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      )}

      {/* Book Button */}
      <motion.button
        onClick={handleBooking}
        disabled={loading || !checkIn || !checkOut || !availability?.available}
        className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : checkIn && checkOut ? (
          "Reserve"
        ) : (
          "Check availability"
        )}
      </motion.button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center mt-4">
        You won't be charged yet
      </p>
    </motion.div>
  );
}
