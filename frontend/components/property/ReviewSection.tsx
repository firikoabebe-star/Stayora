"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string;
  cleanliness: number;
  accuracy: number;
  checkIn: number;
  communication: number;
  location: number;
  value: number;
  createdAt: string;
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface ReviewSectionProps {
  reviews: Review[];
  avgRating: number;
  ratingBreakdown: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
  totalReviews: number;
}

export default function ReviewSection({
  reviews,
  avgRating,
  ratingBreakdown,
  totalReviews,
}: ReviewSectionProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const displayedReviews = reviews.slice(0, 6);
  const hasMoreReviews = reviews.length > 6;

  const ratingCategories = [
    { key: "cleanliness", label: "Cleanliness" },
    { key: "accuracy", label: "Accuracy" },
    { key: "checkIn", label: "Check-in" },
    { key: "communication", label: "Communication" },
    { key: "location", label: "Location" },
    { key: "value", label: "Value" },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-8">
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          <span className="text-2xl font-semibold">{avgRating.toFixed(1)}</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-600">{totalReviews} reviews</span>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {ratingCategories.map((category) => {
            const rating =
              ratingBreakdown[category.key as keyof typeof ratingBreakdown];
            return (
              <div
                key={category.key}
                className="flex items-center justify-between"
              >
                <span className="text-gray-900">{category.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full"
                      style={{ width: `${(rating / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8">
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reviews Grid */}
        {displayedReviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {displayedReviews.map((review) => (
              <div key={review.id} className="space-y-3">
                {/* Reviewer Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.guest.avatar ? (
                      <Image
                        src={review.guest.avatar}
                        alt={`${review.guest.firstName} ${review.guest.lastName}`}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {review.guest.firstName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {review.guest.firstName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), "MMMM yyyy")}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>

                {/* Comment */}
                <p className="text-gray-600 leading-relaxed line-clamp-4">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Show All Reviews Button */}
        {hasMoreReviews && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
          >
            <span>Show all {totalReviews} reviews</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* All Reviews Modal */}
      <AnimatePresence>
        {showAllReviews && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllReviews(false)}
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
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-semibold">
                    {avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-600">{totalReviews} reviews</span>
                </div>
                <button
                  onClick={() => setShowAllReviews(false)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-8 border-b border-gray-200 last:border-b-0"
                    >
                      {/* Reviewer Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.guest.avatar ? (
                            <Image
                              src={review.guest.avatar}
                              alt={`${review.guest.firstName} ${review.guest.lastName}`}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="font-medium text-gray-600">
                              {review.guest.firstName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {review.guest.firstName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(
                              new Date(review.createdAt),
                              "MMMM dd, yyyy",
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
                        {renderStars(review.rating)}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
