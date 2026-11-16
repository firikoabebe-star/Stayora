"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { authAPI } from "@/lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data.user);
      } catch (error) {
        // User not authenticated, that's fine
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
