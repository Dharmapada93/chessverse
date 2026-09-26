"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Dialog from "@/components/ui/Dialog";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDangerous?: boolean;
  onConfirm: () => void | Promise<void>;
}

export interface ModalContextType {
  confirm: (options: ConfirmOptions) => void;
  closeConfirm: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [confirmConfig, setConfirmConfig] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmConfig(options);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmConfig(null);
    setIsLoading(false);
  }, []);

  async function handleConfirm() {
    if (!confirmConfig) return;
    try {
      setIsLoading(true);
      await confirmConfig.onConfirm();
      closeConfirm();
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <ModalContext.Provider value={{ confirm, closeConfirm }}>
      {children}
      {confirmConfig && (
        <Dialog
          isOpen={true}
          onClose={closeConfirm}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel || "Confirm"}
          cancelLabel={confirmConfig.cancelLabel || "Cancel"}
          onConfirm={handleConfirm}
          isDangerous={confirmConfig.isDangerous}
          isLoading={isLoading}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
