"use client";

import React from "react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import NotificationsPage from "@/views/Notifications";

export default function NotificationsRoute() {
  return (
    <div className="min-h-screen text-[var(--color-text)] flex flex-col">
      <AppHeader />
      <div className="flex-1 flex">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <NotificationsPage />
        </main>
      </div>
    </div>
  );
}
