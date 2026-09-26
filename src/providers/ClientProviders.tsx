"use client";

import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ModalProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </ModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

