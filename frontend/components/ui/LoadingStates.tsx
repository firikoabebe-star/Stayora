"use client";

import { motion } from "framer-motion";

// Skeleton base component
const Skeleton = ({
  className = "",
  ...props
}: {
  className?: string;
  [key: string]: any;
}) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    {...props}
  />
);

// Property Card Skeleton
export const PropertyCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
    <Skeleton className="aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-18" />
      </div>
      <div className="flex items-center gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-6 w-16" />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
);

// Property Grid Skeleton
export const PropertyGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(count)].map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
);

// Property Detail Skeleton
export const PropertyDetailSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900">
    {/* Image Gallery Skeleton */}
    <Skeleton className="h-96 md:h-[500px] w-full" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-4" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            <div className="flex gap-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Host Profile */}
          <div className="flex items-center gap-4 pb-8 border-b border-gray-200 dark:border-gray-700">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-56" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:sticky lg:top-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-16 w-full mb-6" />
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Search Results Skeleton
export const SearchResultsSkeleton = () => (
  <div className="space-y-6">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex gap-6"
      >
        <Skeleton className="w-80 aspect-[4/3] rounded-xl" />
        <div className="flex-1 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            {[...Array(3)].map((_, j) => (
              <Skeleton key={j} className="h-6 w-16" />
            ))}
          </div>
          <div className="flex justify-between items-end">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Bookings List */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-6">
            <Skeleton className="w-32 h-24 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-1/3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Loading Spinner
export const LoadingSpinner = ({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} border-2 border-gray-300 border-t-rose-500 rounded-full ${className}`}
    />
  );
};

// Page Loading
export const PageLoading = ({
  message = "Loading...",
}: {
  message?: string;
}) => (
  <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// Button Loading
export const ButtonLoading = ({
  children,
  loading,
  ...props
}: {
  children: React.ReactNode;
  loading: boolean;
  [key: string]: any;
}) => (
  <button disabled={loading} {...props}>
    <div className="flex items-center justify-center gap-2">
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  </button>
);
