"use client";

import { useState } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  address,
  city,
  state,
  country,
}: PropertyMapProps) {
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom: 14,
  });

  return (
    <div className="space-y-4">
      {/* Location Info */}
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
        <div>
          <div className="font-medium text-gray-900">
            {city}, {state}
          </div>
          <div className="text-gray-600">{address}</div>
          <div className="text-gray-600">{country}</div>
        </div>
      </div>

      {/* Map */}
      <div className="h-96 rounded-2xl overflow-hidden border border-gray-200">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          attributionControl={false}
        >
          <NavigationControl position="top-right" />

          <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-white" />
            </div>
          </Marker>
        </Map>
      </div>

      {/* Location Description */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-gray-600 text-sm">
          The exact location will be provided after booking confirmation. This
          map shows the general area where the property is located.
        </p>
      </div>
    </div>
  );
}
