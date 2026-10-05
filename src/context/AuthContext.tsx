"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ensureAuthToken } from "@/lib/api";
import { socket } from "@/lib/socket";

export interface AuthUser {
  id?: string;
  _id?: string;
  username: string;
  email?: string;
  rating?: number;
  ratings?: {
    bullet: number;
    blitz: number;
    rapid: number;
    classical: number;
  };
  role?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openLogin: () => void;
  openRegister: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const refreshUser = useCallback(async () => {
    try {
      let token =
        typeof window !== "undefined"
          ? localStorage.getItem("chessverse-token")
          : null;

      if (!token) {
        token = await ensureAuthToken();
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        // Fallback default user if token exists
        if (typeof window !== "undefined") {
          localStorage.removeItem("chessverse-token");
        }
        setUser(null);
      }
    } catch {
        setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener("chessverse:auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("chessverse:auth-change", handleAuthChange);
    };
  }, [refreshUser]);

  const openLogin = useCallback(() => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("chessverse-token", data.token);
            window.dispatchEvent(new Event("chessverse:auth-change"));
          }
          if (data.user) {
            setUser(data.user);
          }
          closeAuthModal();
          return { success: true };
        } else {
          return { success: false, message: data.message || "Invalid email or password" };
        }
      } catch {
        return { success: false, message: "Unable to reach the authentication service" };
      }
    },
    [closeAuthModal]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      try {
        const res = await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success && data.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("chessverse-token", data.token);
            window.dispatchEvent(new Event("chessverse:auth-change"));
          }
          if (data.user) {
            setUser(data.user);
          }
          closeAuthModal();
          return { success: true };
        } else {
          return { success: false, message: data.message || "Registration failed" };
        }
      } catch {
        return { success: false, message: "Unable to reach the authentication service" };
      }
    },
    [closeAuthModal]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("chessverse-token");
      window.dispatchEvent(new Event("chessverse:auth-change"));
    }

    if (socket.connected) {
      socket.disconnect();
    }

    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        openLogin,
        openRegister,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
