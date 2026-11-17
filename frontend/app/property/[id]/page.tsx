"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Heart,
  Share,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Shield,
  Award,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { propertiesAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import BookingCard from "@/components/booking/BookingCard";
import ReviewSection from "@/components/property/ReviewSection";
import AmenityGrid from "@/components/property/AmenityGrid";
import HostProfile from "@/components/property/HostProfile";
import PropertyMap from "@/components/property/PropertyMap";
import ImageGallery from "@/components/property/ImageGallery";
import toast from "react-hot-toast";

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  avgRating: number;
  ratingBreakdown: {
    cleanliness: number;
    accuracy: number;
    checkIn: number;
    communication: number;
    location: number;
    value: number;
  };
  images: Array<{
    id: string;
    url: string;
    altText: string;
    isPrimary: boolean;
    order: number;
  }>;
  amenities: Array<{
    amenity: {
      id: string;
      name: string;
      icon: string;
      category: string;
    };
  }>;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: string;
  };
  reviews: Array<{
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
  }>;
  _count: {
    reviews: number;
    bookings: number;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadProperty(params.id as string);
    }
  }, [params.id]);

  const loadProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      const response = await propertiesAPI.getById(propertyId);
      setProperty(response.data);
    } catch (error) {
      console.error("Failed to load property:", error);
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save properties");
      return;
    }

    try {
      // TODO: Implement wishlist API calls
      setIsWishlisted(!isWishlisted);
      toast.success(
        isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      );
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Check out this amazing property: ${property?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Property not found
          </h1>
          <p className="text-gray-600">
            The property you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const primaryImage =
    property.images.find((img) => img.isPrimary) || property.images[0];
  const sortedImages = [...property.images].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <ImageGallery
        images={sortedImages}
        propertyTitle={property.title}
        showAllPhotos={showAllPhotos}
        onShowAllPhotos={setShowAllPhotos}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {property.avgRating.toFixed(1)}
                      </span>
                      <span>({property._count.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {property.city}, {property.state}, {property.country}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    <Share className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`}
                    />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-5 h-5" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-5 h-5" />
                  <span>
                    {property.bedrooms} bedroom
                    {property.bedrooms !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-5 h-5" />
                  <span>
                    {property.bathrooms} bathroom
                    {property.bathrooms !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Host Profile */}
            <HostProfile host={property.host} />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About this place
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <AmenityGrid amenities={property.amenities.map((a) => a.amenity)} />

            {/* Calendar */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Availability
              </h2>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Calendar className="w-5 h-5" />
                  <span>Select dates to see availability and pricing</span>
                </div>
                {/* TODO: Add calendar component */}
                <div className="text-center py-8 text-gray-500">
                  Calendar component coming soon
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <BookingCard
              property={{
                id: property.id,
                title: property.title,
                price: property.price,
                avgRating: property.avgRating,
                reviewCount: property._count.reviews,
                maxGuests: property.maxGuests,
              }}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewSection
            reviews={property.reviews}
            avgRating={property.avgRating}
            ratingBreakdown={property.ratingBreakdown}
            totalReviews={property._count.reviews}
          />
        </div>

        {/* Location */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Where you'll be
          </h2>
          <PropertyMap
            latitude={property.latitude}
            longitude={property.longitude}
            address={property.address}
            city={property.city}
            state={property.state}
            country={property.country}
          />
        </div>

        {/* Host Information */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              {property.host.avatar ? (
                <Image
                  src={property.host.avatar}
                  alt={`${property.host.firstName} ${property.host.lastName}`}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {property.host.firstName[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hosted by {property.host.firstName}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <span>
                  Joined {new Date(property.host.createdAt).getFullYear()}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{property.avgRating.toFixed(1)} rating</span>
                </div>
                <span>{property._count.reviews} reviews</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Identity verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="w-4 h-4" />
                  <span>Superhost</span>
                </div>
              </div>
            </div>
            <button className="px-6 py-3 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
