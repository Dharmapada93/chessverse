"use client";

import React from "react";
import Header from "@/components/navigation/Header";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import PageContainer from "@/components/ui/PageContainer";

export interface AppLayoutProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  useContainer?: boolean;
}

export default function AppLayout({
  children,
  maxWidth = "lg",
  useContainer = true,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />

      <main className="flex-1 pb-16 md:pb-0">
        {useContainer ? (
          <PageContainer maxWidth={maxWidth}>{children}</PageContainer>
        ) : (
          children
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
