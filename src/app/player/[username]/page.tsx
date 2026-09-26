"use client";

import React, { use } from "react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import PlayerProfilePage from "@/views/PlayerProfile";

type PlayerRouteProps = {
  params: Promise<{
    username: string;
  }>;
};

export default function PlayerRoute({ params }: PlayerRouteProps) {
  const resolvedParams = use(params);
  const username = decodeURIComponent(resolvedParams.username);

  return (
    <div className="min-h-screen text-[var(--color-text)] flex flex-col">
      <AppHeader />
      <div className="flex-1 flex">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <PlayerProfilePage username={username} />
        </main>
      </div>
    </div>
  );
}
