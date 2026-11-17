"use client";

import { motion } from "framer-motion";
import { Star, Heart, MapPin } from "lucide-react";
import Image from "next/image";
import { useThemeClasses } from "@/lib/theme";

// Mock data - will be replaced with real API data
const featuredProperties = [
  {
    id: "1",
    title: "Luxury Villa with Ocean View",
    location: "Malibu, California",
    price: 450,
    rating: 4.9,
    reviews: 127,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    ],
    type: "Villa",
    guests: 8,
    bedrooms: 4,
    bathrooms: 3,
  },
  {
    id: "2",
    title: "Modern Downtown Apartment",
    location: "New York, NY",
    price: 280,
    rating: 4.8,
    reviews: 89,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    ],
    type: "Apartment",
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
  },
  {
    id: "3",
    title: "Cozy Mountain Cabin",
    location: "Aspen, Colorado",
    price: 320,
    rating: 4.9,
    reviews: 156,
    images: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
    ],
    type: "Cabin",
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
  },
  {
    id: "4",
    title: "Beachfront Paradise",
    location: "Miami Beach, FL",
    price: 380,
    rating: 4.7,
    reviews: 203,
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    ],
    type: "House",
    guests: 10,
    bedrooms: 5,
    bathrooms: 4,
  },
];

export function FeaturedProperties() {
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
            Featured Properties
          </h2>
          <p className={`text-lg ${theme.textSecondary} max-w-2xl mx-auto`}>
            Handpicked properties that offer exceptional experiences and
            outstanding value
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${theme.card} rounded-lg shadow-lg overflow-hidden ${theme.cardHover} transition-shadow duration-300 group cursor-pointer`}
            >
              {/* Image */}
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={property.images[0]}
                  alt={property.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </button>
                <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold">
                  {property.type}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">
                      {property.rating}
                    </span>
                    <span className={`text-sm ${theme.textMuted}`}>
                      ({property.reviews})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${theme.text}`}>
                      ${property.price}
                    </div>
                    <div className={`text-sm ${theme.textMuted}`}>
                      per night
                    </div>
                  </div>
                </div>

                <h3 className={`font-semibold ${theme.text} mb-2 line-clamp-2`}>
                  {property.title}
                </h3>

                <div
                  className={`flex items-center text-sm ${theme.textMuted} mb-3`}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.location}
                </div>

                <div
                  className={`flex items-center justify-between text-sm ${theme.textMuted}`}
                >
                  <span>{property.guests} guests</span>
                  <span>{property.bedrooms} bedrooms</span>
                  <span>{property.bathrooms} bathrooms</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button
            className={`${theme.buttonSecondary} px-8 py-3 rounded-lg transition-colors font-medium text-lg`}
          >
            View All Properties
          </button>
        </motion.div>
      </div>
    </section>
  );
}
