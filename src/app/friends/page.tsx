"use client";

import React from "react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import FriendsPage from "@/views/Friends";

export default function FriendsRoute() {
  return (
    <div className="flex min-h-screen bg-transparent text-[#171A18] animate-pageEnter">
      <AppSidebar />
      <div className="min-w-0 flex-1 flex flex-col pb-16 md:pb-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto">
          <FriendsPage />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
