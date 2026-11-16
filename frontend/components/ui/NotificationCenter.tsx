"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
} from "lucide-react";
import {
  useNotificationStore,
  type Notification,
  type NotificationType,
} from "@/lib/notifications";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const notificationStyles: Record<NotificationType, string> = {
  success:
    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  warning:
    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const { removeNotification } = useNotificationStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`
        relative p-4 rounded-xl border shadow-lg backdrop-blur-sm
        ${notificationStyles[notification.type]}
        max-w-sm w-full
      `}
    >
      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: notification.duration / 1000,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-xl"
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {notificationIcons[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {notification.title}
          </h4>
          {notification.message && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {notification.message}
            </p>
          )}

          {/* Action button */}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

export const NotificationCenter = () => {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Notification bell icon with count
export const NotificationBell = ({
  className = "",
}: {
  className?: string;
}) => {
  const { notifications } = useNotificationStore();
  const unreadCount = notifications.length;

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </motion.div>
      )}
    </div>
  );
};

// Notification permission prompt
export const NotificationPermissionPrompt = () => {
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Check if we should show permission prompt
    if ("Notification" in window && Notification.permission === "default") {
      const hasShownPrompt = localStorage.getItem("notification-prompt-shown");

      if (!hasShownPrompt) {
        setTimeout(() => {
          addNotification({
            type: "info",
            title: "Enable Notifications",
            message:
              "Get notified about booking confirmations, messages, and important updates.",
            persistent: true,
            action: {
              label: "Enable",
              onClick: async () => {
                const granted = await Notification.requestPermission();
                if (granted === "granted") {
                  addNotification({
                    type: "success",
                    title: "Notifications Enabled",
                    message: "You'll now receive important updates.",
                  });
                }
                localStorage.setItem("notification-prompt-shown", "true");
              },
            },
          });
        }, 3000); // Show after 3 seconds
      }
    }
  }, [addNotification]);

  return null;
};

export default NotificationCenter;
