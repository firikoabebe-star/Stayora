"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, Users, Bed, Bath, Wifi, Car } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usersAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useThemeClasses } from "@/lib/theme";
import toast from "react-hot-toast";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    description: string;
    type: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    city: string;
    state: string;
    country: string;
    avgRating: number;
    images: Array<{
      id: string;
      url: string;
      altText: string;
      isPrimary: boolean;
    }>;
    amenities: Array<{
      amenity: {
        id: string;
        name: string;
        icon: string;
      };
    }>;
    host: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    };
    _count: {
      reviews: number;
    };
  };
  variant?: "grid" | "list";
  showWishlist?: boolean;
}

export default function PropertyCard({
  property,
  variant = "grid",
  showWishlist = true,
}: PropertyCardProps) {
  const { isAuthenticated } = useAuthStore();
  const themeClasses = useThemeClasses();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];
  const isGrid = variant === "grid";

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to save properties");
      return;
    }

    try {
      if (isWishlisted) {
        await usersAPI.removeFromWishlist(property.id);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await usersAPI.addToWishlist(property.id);
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1,
    );
  };

  const topAmenities = property.amenities.slice(0, 4).map((a) => a.amenity);

  return (
    <Link href={`/property/${property.id}`}>
      <motion.div
        className={`
          group cursor-pointer ${themeClasses.card} rounded-2xl overflow-hidden transition-all duration-300
          ${
            isGrid
              ? `${themeClasses.cardHover} hover:-translate-y-1`
              : `flex gap-6 hover:shadow-lg p-4`
          }
        `}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: isGrid ? 1.02 : 1.01 }}
      >
        {/* Image Section */}
        <div
          className={`relative ${isGrid ? "aspect-[4/3]" : "w-80 aspect-[4/3] flex-shrink-0"}`}
        >
          {primaryImage && (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={isGrid ? "(max-width: 768px) 100vw, 50vw" : "320px"}
            />
          )}

          {/* Image Navigation */}
          {property.images.length > 1 && isHovered && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
              >
                ←
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
              >
                →
              </button>
            </>
          )}

          {/* Image Dots */}
          {property.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-600"
                }`}
              />
            </button>
          )}

          {/* Property Type Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-lg text-xs font-medium text-gray-700">
            {property.type.replace("_", " ")}
          </div>
        </div>

        {/* Content Section */}
        <div className={`${isGrid ? "p-4" : "flex-1 py-2"}`}>
          {/* Location & Rating */}
          <div className="flex items-start justify-between mb-2">
            <div
              className={`flex items-center gap-1 text-sm ${themeClasses.textSecondary}`}
            >
              <MapPin className="w-4 h-4" />
              <span>
                {property.city}, {property.state}
              </span>
            </div>
            {property.avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {property.avgRating.toFixed(1)}
                </span>
                <span className={`text-sm ${themeClasses.textMuted}`}>
                  ({property._count.reviews})
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-semibold ${themeClasses.text} mb-2 line-clamp-2 ${
              isGrid ? "text-lg" : "text-xl"
            }`}
          >
            {property.title}
          </h3>

          {/* Property Details */}
          <div
            className={`flex items-center gap-4 text-sm ${themeClasses.textSecondary} mb-3`}
          >
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{property.maxGuests} guests</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>
                {property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>
                {property.bathrooms} bath{property.bathrooms !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-2 mb-4">
            {topAmenities.map((amenity) => (
              <div
                key={amenity.id}
                className={`flex items-center gap-1 px-2 py-1 ${themeClasses.backgroundSecondary} rounded-lg text-xs ${themeClasses.textSecondary}`}
                title={amenity.name}
              >
                <span>{amenity.icon}</span>
                <span className="hidden sm:inline">{amenity.name}</span>
              </div>
            ))}
            {property.amenities.length > 4 && (
              <div className={`text-xs ${themeClasses.textMuted}`}>
                +{property.amenities.length - 4} more
              </div>
            )}
          </div>

          {/* Host Info */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`w-6 h-6 ${themeClasses.backgroundSecondary} rounded-full flex items-center justify-center`}
            >
              {property.host.avatar ? (
                <Image
                  src={property.host.avatar}
                  alt={`${property.host.firstName} ${property.host.lastName}`}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span
                  className={`text-xs font-medium ${themeClasses.textSecondary}`}
                >
                  {property.host.firstName[0]}
                </span>
              )}
            </div>
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              Hosted by {property.host.firstName}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold ${themeClasses.text}`}>
              ${property.price}
            </span>
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              / night
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
