import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Auth Store
interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'GUEST' | 'HOST' | 'ADMIN'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

// Search Store
interface SearchFilters {
  location: string
  checkIn: Date | null
  checkOut: Date | null
  guests: number
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  amenities: string[]
}

interface SearchState {
  filters: SearchFilters
  results: any[]
  isLoading: boolean
  totalResults: number
  currentPage: number
  setFilters: (filters: Partial<SearchFilters>) => void
  setResults: (results: any[]) => void
  setLoading: (loading: boolean) => void
  setTotalResults: (total: number) => void
  setCurrentPage: (page: number) => void
  resetFilters: () => void
}

const initialFilters: SearchFilters = {
  location: '',
  checkIn: null,
  checkOut: null,
  guests: 1,
  amenities: [],
}

export const useSearchStore = create<SearchState>((set) => ({
  filters: initialFilters,
  results: [],
  isLoading: false,
  totalResults: 0,
  currentPage: 1,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setTotalResults: (totalResults) => set({ totalResults }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  resetFilters: () => set({ filters: initialFilters }),
}))

// UI Store
interface UIState {
  isMobileMenuOpen: boolean
  isSearchModalOpen: boolean
  isLoginModalOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  setSearchModalOpen: (open: boolean) => void
  setLoginModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchModalOpen: false,
  isLoginModalOpen: false,
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
  setLoginModalOpen: (isLoginModalOpen) => set({ isLoginModalOpen }),
}))