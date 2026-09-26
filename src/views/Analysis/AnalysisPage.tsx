"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { GameAnalysis } from "@/types/ai";
import { chessAnalysisService } from "@/services/ai/analysis";
import {
  AIAnalysisContainer,
  AnalysisLoadingState,
  AnalysisErrorState,
} from "@/components/ai/AIAnalysis";

interface AnalysisPageProps {
  gameId?: string;
  initialGame?: any;
}

export default function AnalysisPage({
  gameId = "demo-game",
  initialGame,
}: AnalysisPageProps) {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "opening" | "tactics" | "positions" | "summary" | "completed"
  >("opening");

  const loadAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await chessAnalysisService.analyzeGame(
        gameId,
        (progress) => {
          setCurrentStep(progress.status);
        },
      );
      setAnalysis(result);
    } catch (err: any) {
      setError(err?.message || "Failed to load game analysis.");
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <AnalysisLoadingState currentStep={currentStep} />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <AnalysisErrorState
          onRetry={loadAnalysis}
          message={error || undefined}
        />
      </div>
    );
  }

  return (
    <AIAnalysisContainer
      analysis={analysis}
      whitePlayerName={initialGame?.whitePlayerName || "White"}
      blackPlayerName={initialGame?.blackPlayerName || "Black"}
    />
  );
}
