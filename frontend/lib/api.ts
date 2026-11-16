import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        await api.post('/auth/refresh')
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        Cookies.remove('token')
        Cookies.remove('refreshToken')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    // Show error toast for non-401 errors
    if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else {
      toast.error('Something went wrong')
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
}

// Properties API
export const propertiesAPI = {
  getAll: (params?: any) => api.get('/properties', { params }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: any) => api.post('/properties', data),
  update: (id: string, data: any) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  getByHost: (hostId: string) => api.get(`/properties/host/${hostId}`),
  checkAvailability: (id: string, startDate: string, endDate: string) => 
    api.get(`/properties/${id}/availability`, { params: { startDate, endDate } }),
  uploadImages: (propertyId: string, formData: FormData) => 
    api.post(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateImage: (propertyId: string, imageId: string, data: any) => 
    api.put(`/properties/${propertyId}/images/${imageId}`, data),
  deleteImage: (propertyId: string, imageId: string) => 
    api.delete(`/properties/${propertyId}/images/${imageId}`),
  reorderImages: (propertyId: string, imageOrders: any[]) => 
    api.put(`/properties/${propertyId}/images/reorder`, { imageOrders }),
}

// Amenities API
export const amenitiesAPI = {
  getAll: (category?: string) => api.get('/amenities/all', { 
    params: category ? { category } : {} 
  }),
  create: (data: any) => api.post('/amenities', data),
  update: (id: string, data: any) => api.put(`/amenities/${id}`, data),
  delete: (id: string) => api.delete(`/amenities/${id}`),
}

// Bookings API
export const bookingsAPI = {
  getAll: (params?: any) => api.get('/bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (data: any) => api.post('/bookings', data),
  update: (id: string, data: any) => api.put(`/bookings/${id}`, data),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`),
  getStats: () => api.get('/bookings/stats'),
  getHostBookings: (params?: any) => api.get('/bookings/host/all', { params }),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (propertyId: string) => api.post(`/users/wishlist/${propertyId}`),
  removeFromWishlist: (propertyId: string) => api.delete(`/users/wishlist/${propertyId}`),
}