"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Toast, { ToastMessage, ToastType } from "@/components/ui/Toast";

export interface ToastContextType {
  notify: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      id,
      type,
      message,
      title,
      durationMs: 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const notify = {
    success: (msg: string, title?: string) => addToast("success", msg, title),
    error: (msg: string, title?: string) => addToast("error", msg, title),
    warning: (msg: string, title?: string) => addToast("warning", msg, title),
    info: (msg: string, title?: string) => addToast("info", msg, title),
  };

  return (
    <ToastContext.Provider value={{ notify, removeToast }}>
      {children}
      {/* Toast Render Layer positioned in bottom-right corner to never obstruct the board */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
