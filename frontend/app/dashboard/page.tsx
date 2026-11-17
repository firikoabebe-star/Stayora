"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useAuthStore } from "@/lib/store";
import { bookingsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
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
    city: string;
    state: string;
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
    };
  };
}

interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  pastBookings: number;
  totalSpent: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router, filter, statusFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (filter === "upcoming") params.upcoming = "true";
      if (filter === "past") params.past = "true";
      if (statusFilter !== "all") params.status = statusFilter;

      const [bookingsRes, statsRes] = await Promise.all([
        bookingsAPI.getAll(params),
        bookingsAPI.getStats(),
      ]);

      setBookings(bookingsRes.data.bookings || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

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
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">Manage your bookings and travel plans</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalBookings}
                  </div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.upcomingBookings}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Trips</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.pastBookings}
                  </div>
                  <div className="text-sm text-gray-600">Past Trips</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${stats.totalSpent.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Bookings
              </h2>

              {/* Time Filter */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "upcoming", label: "Upcoming" },
                  { key: "past", label: "Past" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setFilter(option.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === option.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
                >
                  <div className="flex gap-6">
                    <div className="w-32 h-24 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((booking, index) => {
              const primaryImage =
                booking.property.images.find((img) => img.isPrimary) ||
                booking.property.images[0];
              const checkInDate = new Date(booking.checkIn);
              const checkOutDate = new Date(booking.checkOut);
              const nights = Math.ceil(
                (checkOutDate.getTime() - checkInDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Property Image */}
                    <Link
                      href={`/property/${booking.property.id}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-32 h-24 rounded-xl overflow-hidden">
                        {primaryImage && (
                          <Image
                            src={primaryImage.url}
                            alt={primaryImage.altText}
                            width={128}
                            height={96}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                    </Link>

                    {/* Booking Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link
                            href={`/property/${booking.property.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-rose-600 transition-colors"
                          >
                            {booking.property.title}
                          </Link>
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {booking.property.city}, {booking.property.state}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(checkInDate, "MMM dd")} -{" "}
                            {format(checkOutDate, "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>
                            {booking.guests} guests · {nights} nights
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">
                            ${booking.totalPrice.toFixed(2)}
                          </span>{" "}
                          total
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          href={`/booking/${booking.id}`}
                          className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/property/${booking.property.id}`}
                          className="px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors text-sm"
                        >
                          View Property
                        </Link>
                        {booking.status === "COMPLETED" && (
                          <button className="px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors text-sm">
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === "upcoming"
                  ? "You don't have any upcoming trips planned."
                  : filter === "past"
                    ? "You haven't completed any trips yet."
                    : "You haven't made any bookings yet."}
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Start Planning</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
