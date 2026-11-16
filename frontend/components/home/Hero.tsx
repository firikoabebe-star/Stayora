"use client";

import { motion } from "framer-motion";
import SearchBar from "@/components/search/SearchBar";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient"></div>
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Stay
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover unique properties and unforgettable experiences around the
            world
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <SearchBar variant="hero" />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              10K+
            </div>
            <div className="text-white/80 mt-1">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              50K+
            </div>
            <div className="text-white/80 mt-1">Happy Guests</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white">
              100+
            </div>
            <div className="text-white/80 mt-1">Countries</div>
          </div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm hidden lg:block"
      />

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full backdrop-blur-sm hidden lg:block"
      />
    </section>
  );
}
