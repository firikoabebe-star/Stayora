import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  persistent?: boolean
  createdAt: Date
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  markAsRead: (id: string) => void
}

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector((set, get) => ({
    notifications: [],

    addNotification: (notification) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newNotification: Notification = {
        ...notification,
        id,
        createdAt: new Date(),
        duration: notification.duration ?? (notification.type === 'error' ? 0 : 5000)
      }

      set((state) => ({
        notifications: [newNotification, ...state.notifications]
      }))

      // Auto-remove after duration (if not persistent)
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id)
        }, newNotification.duration)
      }

      return id
    },

    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }))
    },

    clearAll: () => {
      set({ notifications: [] })
    },

    markAsRead: (id) => {
      // For future implementation of read/unread states
      console.log('Marked as read:', id)
    }
  }))
)

// Convenience functions
export const notify = {
  success: (title: string, message?: string, options?: Partial<Notification>) => 
    useNotificationStore.getState().addNotification({ 
      type: 'success', 
      title, 
      message, 
      ...options 
    }),

  error: (title: string, message?: string, options?: Partial<Notification>) => 
    useNotificationStore.getState().addNotification({ 
      type: 'error', 
      title, 
      message, 
      persistent: true,
      ...options 
    }),

  warning: (title: string, message?: string, options?: Partial<Notification>) => 
    useNotificationStore.getState().addNotification({ 
      type: 'warning', 
      title, 
      message, 
      ...options 
    }),

  info: (title: string, message?: string, options?: Partial<Notification>) => 
    useNotificationStore.getState().addNotification({ 
      type: 'info', 
      title, 
      message, 
      ...options 
    }),
}

// Browser notification API integration
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    })

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)

    return notification
  }
}

// Real-time notification types for the platform
export const NotificationTypes = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  REVIEW_RECEIVED: 'review_received',
  MESSAGE_RECEIVED: 'message_received',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const

export type PlatformNotificationType = typeof NotificationTypes[keyof typeof NotificationTypes]

// Platform-specific notification handlers
export const platformNotify = {
  bookingConfirmed: (bookingId: string, propertyTitle: string) => {
    notify.success(
      'Booking Confirmed!',
      `Your reservation for "${propertyTitle}" has been confirmed.`,
      {
        action: {
          label: 'View Booking',
          onClick: () => window.location.href = `/booking/${bookingId}`
        }
      }
    )

    sendBrowserNotification('Booking Confirmed!', {
      body: `Your reservation for "${propertyTitle}" has been confirmed.`,
      tag: 'booking-confirmed'
    })
  },

  bookingCancelled: (propertyTitle: string) => {
    notify.warning(
      'Booking Cancelled',
      `Your reservation for "${propertyTitle}" has been cancelled.`
    )
  },

  paymentSuccess: (amount: number) => {
    notify.success(
      'Payment Successful',
      `Your payment of $${amount.toFixed(2)} has been processed.`
    )
  },

  paymentFailed: (reason?: string) => {
    notify.error(
      'Payment Failed',
      reason || 'There was an issue processing your payment. Please try again.',
      {
        action: {
          label: 'Retry Payment',
          onClick: () => window.location.reload()
        }
      }
    )
  },

  reviewReceived: (guestName: string, rating: number) => {
    notify.info(
      'New Review Received',
      `${guestName} left you a ${rating}-star review.`,
      {
        action: {
          label: 'View Review',
          onClick: () => window.location.href = '/dashboard/reviews'
        }
      }
    )
  },

  messageReceived: (senderName: string, preview: string) => {
    notify.info(
      `Message from ${senderName}`,
      preview,
      {
        action: {
          label: 'Reply',
          onClick: () => window.location.href = '/messages'
        }
      }
    )

    sendBrowserNotification(`Message from ${senderName}`, {
      body: preview,
      tag: 'message-received'
    })
  },

  systemMaintenance: (scheduledTime: string) => {
    notify.warning(
      'Scheduled Maintenance',
      `System maintenance is scheduled for ${scheduledTime}. Some features may be temporarily unavailable.`,
      {
        persistent: true,
        action: {
          label: 'Learn More',
          onClick: () => window.location.href = '/maintenance'
        }
      }
    )
  }
}