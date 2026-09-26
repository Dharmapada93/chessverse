"use client";

import React, { use } from "react";
import AppHeader from "@/components/navigation/AppHeader";
import AppSidebar from "@/components/navigation/AppSidebar";
import AnalysisPage from "@/views/Analysis";

interface AnalysisRouteProps {
  params: Promise<{ gameId: string }>;
}

export default function AnalysisGameRoute({ params }: AnalysisRouteProps) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;

  return (
    <div className="min-h-screen bg-transparent text-[#171A18] flex flex-col animate-pageEnter">
      <AppHeader />
      <div className="flex-1 flex">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <AnalysisPage gameId={gameId} />
        </main>
      </div>
    </div>
  );
}
