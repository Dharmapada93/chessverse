"use client";

import { useEffect, useRef, useState } from "react";
import { StockfishEngine, type EngineLine } from "@/lib/stockfish";

export function useStockfish() {
  const engine = useRef<StockfishEngine | null>(null);
  const [analysis, setAnalysis] = useState<EngineLine | null>(null);

  useEffect(() => {
    const instance = new StockfishEngine();
    engine.current = instance;

    instance.init();

    const unsubscribe = instance.onLine((line) => {
      setAnalysis(line);
    });

    return () => {
      unsubscribe();
      instance.destroy();
    };
  }, []);

  function analyze(fen: string, depth = 16) {
    engine.current?.analyze(fen, depth);
  }

  function stop() {
    engine.current?.stop();
  }

  return {
    analysis,
    analyze,
    stop,
  };
}
