"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Grid3X3 } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    altText: string;
    isPrimary: boolean;
    order: number;
  }>;
  propertyTitle: string;
  showAllPhotos: boolean;
  onShowAllPhotos: (show: boolean) => void;
}

export default function ImageGallery({
  images,
  propertyTitle,
  showAllPhotos,
  onShowAllPhotos,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const primaryImage = images.find((img) => img.isPrimary) || images[0];
  const otherImages = images.filter((img) => !img.isPrimary).slice(0, 4);

  return (
    <>
      {/* Main Gallery Grid */}
      <div className="relative h-96 md:h-[500px] mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-full">
          {/* Primary Image */}
          <div className="md:col-span-2 relative rounded-l-2xl overflow-hidden">
            {primaryImage && (
              <Image
                src={primaryImage.url}
                alt={primaryImage.altText}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => onShowAllPhotos(true)}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            )}
          </div>

          {/* Secondary Images */}
          <div className="hidden md:grid grid-cols-1 gap-2">
            {otherImages.slice(0, 2).map((image, index) => (
              <div key={image.id} className="relative overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.altText}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => onShowAllPhotos(true)}
                  sizes="25vw"
                />
              </div>
            ))}
          </div>

          <div className="hidden md:grid grid-cols-1 gap-2">
            {otherImages.slice(2, 4).map((image, index) => (
              <div
                key={image.id}
                className={`relative overflow-hidden ${
                  index === 1 ? "rounded-r-2xl" : ""
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => onShowAllPhotos(true)}
                  sizes="25vw"
                />
                {/* Show All Photos Button */}
                {index === 1 && images.length > 5 && (
                  <button
                    onClick={() => onShowAllPhotos(true)}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium hover:bg-black/60 transition-colors"
                  >
                    <Grid3X3 className="w-5 h-5 mr-2" />
                    Show all {images.length} photos
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Show All Photos Button */}
        <button
          onClick={() => onShowAllPhotos(true)}
          className="md:hidden absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
        >
          <Grid3X3 className="w-4 h-4" />
          Show all photos
        </button>
      </div>

      {/* Full Screen Gallery Modal */}
      <AnimatePresence>
        {showAllPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-black text-white">
              <h2 className="text-lg font-medium">{propertyTitle}</h2>
              <button
                onClick={() => onShowAllPhotos(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Viewer */}
            <div className="flex-1 relative flex items-center justify-center">
              <div className="relative w-full h-full max-w-4xl max-h-full">
                <Image
                  src={images[currentIndex].url}
                  alt={images[currentIndex].altText}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="p-6 bg-black">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentIndex
                        ? "border-white"
                        : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
