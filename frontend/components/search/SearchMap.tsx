"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl";
import { MapPin, X, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "mapbox-gl/dist/mapbox-gl.css";

interface Property {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  avgRating: number;
  images: Array<{
    url: string;
    altText: string;
    isPrimary: boolean;
  }>;
  _count: {
    reviews: number;
  };
}

interface SearchMapProps {
  properties: Property[];
  selectedProperty?: string | null;
  onPropertySelect?: (propertyId: string | null) => void;
  className?: string;
}

export default function SearchMap({
  properties,
  selectedProperty,
  onPropertySelect,
  className = "",
}: SearchMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 11,
  });
  const [popupInfo, setPopupInfo] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Calculate map bounds based on properties
  useEffect(() => {
    if (properties.length > 0) {
      const lats = properties.map((p) => p.latitude).filter(Boolean);
      const lngs = properties.map((p) => p.longitude).filter(Boolean);

      if (lats.length > 0 && lngs.length > 0) {
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Calculate zoom level based on bounds
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);

        let zoom = 11;
        if (maxDiff < 0.01) zoom = 14;
        else if (maxDiff < 0.05) zoom = 12;
        else if (maxDiff < 0.1) zoom = 11;
        else if (maxDiff < 0.5) zoom = 9;
        else zoom = 7;

        setViewState({
          longitude: centerLng,
          latitude: centerLat,
          zoom,
        });
      }
    }
  }, [properties]);

  const handleMarkerClick = useCallback(
    (property: Property) => {
      setPopupInfo(property);
      onPropertySelect?.(property.id);
    },
    [onPropertySelect],
  );

  const handleClosePopup = useCallback(() => {
    setPopupInfo(null);
    onPropertySelect?.(null);
  }, [onPropertySelect]);

  const primaryImage = (property: Property) =>
    property.images.find((img) => img.isPrimary) || property.images[0];

  return (
    <div className={`relative ${className}`}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={false}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {/* Property Markers */}
        {properties.map((property) => {
          if (!property.latitude || !property.longitude) return null;

          const isSelected = selectedProperty === property.id;
          const isHovered = hoveredProperty === property.id;

          return (
            <Marker
              key={property.id}
              longitude={property.longitude}
              latitude={property.latitude}
              anchor="bottom"
            >
              <motion.div
                className="relative cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setHoveredProperty(property.id)}
                onHoverEnd={() => setHoveredProperty(null)}
                onClick={() => handleMarkerClick(property)}
              >
                {/* Price Marker */}
                <motion.div
                  className={`
                    px-3 py-2 rounded-full font-semibold text-sm shadow-lg border-2 transition-all
                    ${
                      isSelected || isHovered
                        ? "bg-gray-900 text-white border-gray-900 scale-110"
                        : "bg-white text-gray-900 border-white hover:shadow-xl"
                    }
                  `}
                  animate={{
                    scale: isSelected ? 1.1 : isHovered ? 1.05 : 1,
                    y: isSelected || isHovered ? -2 : 0,
                  }}
                >
                  ${property.price}
                </motion.div>

                {/* Marker Pin */}
                <div
                  className={`
                    w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent mx-auto
                    ${isSelected || isHovered ? "border-t-gray-900" : "border-t-white"}
                  `}
                />
              </motion.div>
            </Marker>
          );
        })}

        {/* Property Popup */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={handleClosePopup}
            closeButton={false}
            offset={[0, -10]}
            className="property-popup"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-80 bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image */}
              <div className="relative aspect-[4/3]">
                {primaryImage(popupInfo) && (
                  <Image
                    src={primaryImage(popupInfo).url}
                    alt={primaryImage(popupInfo).altText}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
                    {popupInfo.title}
                  </h3>
                  {popupInfo.avgRating > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {popupInfo.avgRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-900">
                      ${popupInfo.price}
                    </span>
                    <span className="text-sm text-gray-600">/ night</span>
                  </div>

                  <Link
                    href={`/property/${popupInfo.id}`}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          </Popup>
        )}
      </Map>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
          <span>Properties ({properties.length})</span>
        </div>
      </div>

      {/* Loading Overlay */}
      {properties.length === 0 && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        </div>
      )}
    </div>
  );
}
