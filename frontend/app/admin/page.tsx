"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Home,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  AnimatedContainer,
  StaggerChildren,
  StaggerChild,
} from "@/components/ui/Animations";
import { LoadingSpinner } from "@/components/ui/LoadingStates";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    properties: number;
    bookings: number;
    revenue: number;
  };
  recentActivity: Array<{
    id: string;
    type:
      | "user_registered"
      | "property_listed"
      | "booking_made"
      | "review_posted";
    description: string;
    timestamp: string;
    user: string;
  }>;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  _count: {
    properties: number;
    bookings: number;
  };
}

interface Property {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  host: {
    firstName: string;
    lastName: string;
  };
  _count: {
    bookings: number;
    reviews: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "properties" | "bookings"
  >("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    loadAdminData();
  }, [isAuthenticated, user, router]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls

      // Mock data for demonstration
      setStats({
        totalUsers: 1247,
        totalProperties: 892,
        totalBookings: 3456,
        totalRevenue: 234567.89,
        monthlyGrowth: {
          users: 12.5,
          properties: 8.3,
          bookings: 15.7,
          revenue: 22.1,
        },
        recentActivity: [
          {
            id: "1",
            type: "user_registered",
            description: "New user registered",
            timestamp: "2024-01-15T10:30:00Z",
            user: "john.doe@example.com",
          },
          {
            id: "2",
            type: "property_listed",
            description: "New property listed in San Francisco",
            timestamp: "2024-01-15T09:15:00Z",
            user: "sarah.host@example.com",
          },
          {
            id: "3",
            type: "booking_made",
            description: "Booking confirmed for $450",
            timestamp: "2024-01-15T08:45:00Z",
            user: "guest@example.com",
          },
        ],
      });

      // Mock users data
      setUsers([
        {
          id: "1",
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          role: "GUEST",
          isVerified: true,
          createdAt: "2024-01-10T00:00:00Z",
          _count: { properties: 0, bookings: 3 },
        },
        {
          id: "2",
          email: "sarah.host@example.com",
          firstName: "Sarah",
          lastName: "Johnson",
          role: "HOST",
          isVerified: true,
          createdAt: "2024-01-08T00:00:00Z",
          _count: { properties: 5, bookings: 0 },
        },
      ]);

      // Mock properties data
      setProperties([
        {
          id: "1",
          title: "Luxury Downtown Apartment",
          city: "New York",
          state: "NY",
          price: 150,
          isActive: true,
          createdAt: "2024-01-12T00:00:00Z",
          host: { firstName: "Sarah", lastName: "Johnson" },
          _count: { bookings: 12, reviews: 8 },
        },
        {
          id: "2",
          title: "Cozy Beach House",
          city: "Malibu",
          state: "CA",
          price: 220,
          isActive: true,
          createdAt: "2024-01-10T00:00:00Z",
          host: { firstName: "Michael", lastName: "Chen" },
          _count: { bookings: 8, reviews: 6 },
        },
      ]);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const StatCard = ({
    title,
    value,
    growth,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    growth: number;
    icon: any;
    color: string;
  }) => (
    <AnimatedContainer
      variant="scaleIn"
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${growth >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {growth >= 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {Math.abs(growth)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
    </AnimatedContainer>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <AnimatedContainer variant="fadeInDown" className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your platform and monitor performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors">
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>
        </AnimatedContainer>

        {/* Navigation Tabs */}
        <AnimatedContainer variant="fadeInUp" className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm">
            <div className="flex space-x-1">
              {[
                { key: "overview", label: "Overview", icon: BarChart3 },
                { key: "users", label: "Users", icon: Users },
                { key: "properties", label: "Properties", icon: Home },
                { key: "bookings", label: "Bookings", icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
                    ${
                      activeTab === tab.key
                        ? "bg-rose-500 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </AnimatedContainer>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <StaggerChildren className="space-y-8">
            {/* Stats Grid */}
            <StaggerChild>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  growth={stats.monthlyGrowth.users}
                  icon={Users}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Total Properties"
                  value={stats.totalProperties}
                  growth={stats.monthlyGrowth.properties}
                  icon={Home}
                  color="bg-green-500"
                />
                <StatCard
                  title="Total Bookings"
                  value={stats.totalBookings}
                  growth={stats.monthlyGrowth.bookings}
                  icon={Calendar}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  growth={stats.monthlyGrowth.revenue}
                  icon={DollarSign}
                  color="bg-rose-500"
                />
              </div>
            </StaggerChild>

            {/* Charts and Activity */}
            <StaggerChild>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart Placeholder */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue Trend
                  </h3>
                  <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <PieChart className="w-12 h-12 mx-auto mb-2" />
                      <p>Chart Component</p>
                      <p className="text-sm">Integration Ready</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.user}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StaggerChild>
          </StaggerChildren>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <StaggerChildren className="space-y-6">
            {/* Search and Filters */}
            <StaggerChild>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </StaggerChild>

            {/* Users Table */}
            <StaggerChild>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Properties
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === "ADMIN"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                  : user.role === "HOST"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user._count.properties}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {user._count.bookings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isVerified ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <Ban className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </StaggerChild>
          </StaggerChildren>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <StaggerChildren className="space-y-6">
            {/* Properties Grid */}
            <StaggerChild>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
                  >
                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {property.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            property.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {property.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {property.city}, {property.state}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Host: {property.host.firstName} {property.host.lastName}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${property.price}/night
                        </span>
                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                          <span>{property._count.bookings} bookings</span>
                          <span>{property._count.reviews} reviews</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button className="flex-1 px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm">
                          View Details
                        </button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </StaggerChild>
          </StaggerChildren>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <StaggerChild>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bookings Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive booking management interface coming soon
              </p>
            </div>
          </StaggerChild>
        )}
      </div>
    </div>
  );
}
