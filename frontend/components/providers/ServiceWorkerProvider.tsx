"use client";

import { useEffect } from "react";
import { notify } from "@/lib/notifications";

export default function ServiceWorkerProvider() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      console.log("Service Worker registered successfully:", registration);

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available
              notify.info(
                "App Update Available",
                "A new version of Stayora is available. Refresh to update.",
                {
                  persistent: true,
                  action: {
                    label: "Refresh",
                    onClick: () => window.location.reload(),
                  },
                },
              );
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Message from service worker:", event.data);

        if (event.data.type === "CACHE_UPDATED") {
          notify.success(
            "App Updated",
            "Stayora has been updated with the latest features.",
          );
        }
      });

      // Request notification permission
      if ("Notification" in window && Notification.permission === "default") {
        setTimeout(() => {
          requestNotificationPermission();
        }, 5000); // Wait 5 seconds before asking
      }

      // Register for push notifications if supported
      if ("PushManager" in window) {
        registerPushNotifications(registration);
      }
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        notify.success(
          "Notifications Enabled",
          "You'll receive updates about your bookings and messages.",
        );
      } else if (permission === "denied") {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const registerPushNotifications = async (
    registration: ServiceWorkerRegistration,
  ) => {
    try {
      // Check if push messaging is supported
      if (!("PushManager" in window)) {
        console.log("Push messaging is not supported");
        return;
      }

      // Get existing subscription
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log("Push subscription already exists");
        return;
      }

      // For demo purposes - in production, you'd get this from your server
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.log("VAPID public key not configured");
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("Push subscription created:", subscription);

      // Send subscription to server
      await sendSubscriptionToServer(subscription);
    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      // In a real app, you'd send this to your backend
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        console.log("Push subscription sent to server");
      }
    } catch (error) {
      console.error("Error sending subscription to server:", error);
    }
  };

  // Utility function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Handle app installation
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      deferredPrompt = e;

      // Show install prompt after user interaction
      setTimeout(() => {
        showInstallPrompt(deferredPrompt);
      }, 10000); // Show after 10 seconds
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      notify.success(
        "App Installed",
        "Stayora has been installed on your device!",
      );
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const showInstallPrompt = (deferredPrompt: any) => {
    if (!deferredPrompt) return;

    notify.info(
      "Install Stayora",
      "Add Stayora to your home screen for quick access and offline features.",
      {
        persistent: true,
        action: {
          label: "Install",
          onClick: async () => {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
          },
        },
      },
    );
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      notify.success("Back Online", "Your connection has been restored.");

      // Trigger background sync if available
      if (
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register("background-sync-bookings");
        });
      }
    };

    const handleOffline = () => {
      notify.warning(
        "You're Offline",
        "Some features may be limited. Your actions will sync when you're back online.",
        { persistent: true },
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null; // This component doesn't render anything
}
