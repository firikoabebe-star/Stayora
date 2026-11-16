"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Calendar,
  Users,
  MapPin,
  Star,
  Download,
  MessageCircle,
  Phone,
  Mail,
  CreditCard,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { bookingsAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useThemeClasses } from "@/lib/theme";
import { platformNotify } from "@/lib/notifications";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    country: string;
    images: Array<{
      id: string;
      url: string;
      altText: string;
      isPrimary: boolean;
    }>;
    host: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      email: string;
    };
  };
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const themeClasses = useThemeClasses();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (params.id) {
      loadBooking(params.id as string);
    }
  }, [params.id, isAuthenticated, router]);

  const loadBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getById(bookingId);
      setBooking(response.data);

      // Show notification if booking is confirmed
      if (response.data.status === "CONFIRMED") {
        platformNotify.bookingConfirmed(
          response.data.id,
          response.data.property.title,
        );
      }
    } catch (error) {
      console.error("Failed to load booking:", error);
      toast.error("Failed to load booking details");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );
    if (!confirmed) return;

    try {
      await bookingsAPI.cancel(booking.id);
      toast.success("Booking cancelled successfully");
      platformNotify.bookingCancelled(booking.property.title);
      setBooking({ ...booking, status: "CANCELLED" });
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div
        className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}
      >
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-4`}>
            Booking not found
          </h1>
          <p className={themeClasses.textSecondary}>
            The booking you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const primaryImage =
    booking.property.images.find((img) => img.isPrimary) ||
    booking.property.images[0];
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      case "COMPLETED":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5" />;
      case "PENDING":
        return <Clock className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
            {booking.status === "CONFIRMED"
              ? "Booking Confirmed!"
              : "Booking Received!"}
          </h1>
          <p className={themeClasses.textSecondary}>
            {booking.status === "CONFIRMED"
              ? "Your reservation is confirmed. We've sent you a confirmation email."
              : "Your booking request has been received and is pending confirmation."}
          </p>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${themeClasses.card} rounded-2xl shadow-lg overflow-hidden mb-8`}
        >
          {/* Property Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-6">
              {/* Property Image */}
              <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                {primaryImage && (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.altText}
                    width={128}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Property Details */}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {booking.property.title}
                </h2>
                <div className="flex items-center gap-1 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {booking.property.city}, {booking.property.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}
                  >
                    {getStatusIcon(booking.status)}
                    <span className="ml-1">{booking.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Check-in */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Check-in</div>
                  <div className="font-medium">
                    {format(checkInDate, "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-gray-500">After 3:00 PM</div>
                </div>
              </div>

              {/* Check-out */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Check-out</div>
                  <div className="font-medium">
                    {format(checkOutDate, "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-gray-500">Before 11:00 AM</div>
                </div>
              </div>

              {/* Guests */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Guests</div>
                  <div className="font-medium">
                    {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                  </div>
                  <div className="text-sm text-gray-500">{nights} nights</div>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">
                Price breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    ${(booking.totalPrice / 1.22).toFixed(2)} × {nights} nights
                  </span>
                  <span>${(booking.totalPrice / 1.22).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>${(booking.totalPrice * 0.14).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>${(booking.totalPrice * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Booking ID */}
            <div className="text-sm text-gray-600">
              Booking ID: <span className="font-mono">{booking.id}</span>
            </div>
          </div>
        </motion.div>

        {/* Host Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Host
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {booking.property.host.avatar ? (
                <Image
                  src={booking.property.host.avatar}
                  alt={`${booking.property.host.firstName} ${booking.property.host.lastName}`}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <span className="font-medium text-gray-600">
                  {booking.property.host.firstName[0]}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {booking.property.host.firstName}{" "}
                {booking.property.host.lastName}
              </div>
              <div className="text-sm text-gray-600">Host</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors">
            <Download className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>

          <button
            onClick={() => router.push(`/property/${booking.property.id}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
          >
            <span>View Property</span>
          </button>

          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
            <button
              onClick={handleCancelBooking}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-xl hover:border-red-400 transition-colors"
            >
              <span>Cancel Booking</span>
            </button>
          )}
        </motion.div>

        {/* Important Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 rounded-2xl p-6"
        >
          <h3 className="font-medium text-blue-900 mb-3">
            Important Information
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>
              • Check-in is after 3:00 PM and check-out is before 11:00 AM
            </li>
            <li>• Please bring a valid ID for check-in</li>
            <li>• Contact your host if you need to modify your arrival time</li>
            <li>• Review the property rules and cancellation policy</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
