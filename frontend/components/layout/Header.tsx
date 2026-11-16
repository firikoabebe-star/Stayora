"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore, useUIStore } from "@/lib/store";
import { Menu, X, User, Heart, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Stayora</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/properties"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/host"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Become a Host
            </Link>
            <Link
              href="/experiences"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Experiences
            </Link>
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/wishlist"
                  className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 border border-gray-300 rounded-full hover:shadow-md transition-all"
                  >
                    <Menu className="w-4 h-4" />
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                      >
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/bookings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Bookings
                        </Link>
                        <Link
                          href="/host/properties"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          My Properties
                        </Link>
                        <hr className="my-2" />
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              <Link
                href="/properties"
                className="block text-gray-700 hover:text-gray-900 font-medium"
              >
                Explore
              </Link>
              <Link
                href="/host"
                className="block text-gray-700 hover:text-gray-900 font-medium"
              >
                Become a Host
              </Link>
              <Link
                href="/experiences"
                className="block text-gray-700 hover:text-gray-900 font-medium"
              >
                Experiences
              </Link>

              {isAuthenticated ? (
                <>
                  <hr className="my-4" />
                  <Link
                    href="/profile"
                    className="block text-gray-700 hover:text-gray-900"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/bookings"
                    className="block text-gray-700 hover:text-gray-900"
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block text-gray-700 hover:text-gray-900"
                  >
                    Wishlist
                  </Link>
                  <button className="block w-full text-left text-gray-700 hover:text-gray-900">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-4" />
                  <Link
                    href="/auth/login"
                    className="block text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 transition-colors w-full text-center"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
