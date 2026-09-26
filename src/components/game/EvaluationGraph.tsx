"use client";

import React, { useMemo } from "react";

export type GraphMove = {
  moveNumber: number;
  playedMove: string;
  evaluationAfter: number;
  classification: string;
  color: "white" | "black";
};

export type EvaluationGraphProps = {
  moves: GraphMove[];
  currentMoveIndex: number;
  onSelectMove: (index: number) => void;
};

export default function EvaluationGraph({
  moves,
  currentMoveIndex,
  onSelectMove,
}: EvaluationGraphProps) {
  const width = 600;
  const height = 120;
  const padding = 20;

  // Max clamp evaluation for graph display: [-5, +5] pawns
  const clampEval = (ev: number) => Math.max(-5, Math.min(5, ev));

  const points = useMemo(() => {
    if (!moves || moves.length === 0) return [];

    const availableWidth = width - padding * 2;
    const stepX = moves.length > 1 ? availableWidth / (moves.length - 1) : 0;
    const midY = height / 2;

    return moves.map((m, idx) => {
      const x = padding + idx * stepX;
      // In SVG, smaller Y is higher (White advantage)
      const clamped = clampEval(m.evaluationAfter);
      // clamped: +5 -> y = padding; clamped: -5 -> y = height - padding
      const y = midY - (clamped / 5) * (midY - padding);
      return { x, y, move: m, index: idx };
    });
  }, [moves]);

  if (!moves || moves.length === 0) {
    return (
      <div className="flex h-[120px] items-center justify-center rounded-2xl border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] text-xs text-[#69736C] dark:text-[#B5BDB5]">
        No evaluation data available
      </div>
    );
  }

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const activePoint = points[currentMoveIndex] || points[points.length - 1];

  return (
    <div className="relative rounded-2xl border border-[rgba(24,34,30,0.08)] dark:border-white/10 bg-[#FBF9F3] dark:bg-[#21332B] p-4 select-none shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-[#69736C] dark:text-[#B5BDB5] font-mono">
          Evaluation Graph
        </span>
        <span className="text-[11px] font-mono font-semibold text-[#18221E] dark:text-[#F4EFE3]">
          Move {Math.ceil((activePoint?.move.moveNumber || 1) / 2)} •{" "}
          {(activePoint?.move.evaluationAfter ?? 0) > 0 ? "+" : ""}
          {(activePoint?.move.evaluationAfter ?? 0).toFixed(2)}
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-pointer"
        >
          {/* Background grid lines */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="currentColor"
            className="text-[rgba(24,34,30,0.15)] dark:text-[rgba(255,255,255,0.15)]"
            strokeDasharray="3 3"
          />
          <text
            x={padding - 4}
            y={padding + 4}
            fill="currentColor"
            className="text-[#69736C] dark:text-[#B5BDB5]"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            +5
          </text>
          <text
            x={padding - 4}
            y={height / 2 + 3}
            fill="currentColor"
            className="text-[#69736C] dark:text-[#B5BDB5]"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            0
          </text>
          <text
            x={padding - 4}
            y={height - padding + 4}
            fill="currentColor"
            className="text-[#69736C] dark:text-[#B5BDB5]"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            -5
          </text>

          {/* Area under curve */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height / 2} L ${points[0].x} ${height / 2} Z`}
            fill="rgba(181, 138, 58, 0.12)"
          />

          {/* Line connecting moves */}
          <path
            d={pathD}
            fill="none"
            stroke="#B58A3A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive points */}
          {points.map((pt) => {
            const isSelected = pt.index === currentMoveIndex;
            const isBlunder = pt.move.classification === "blunder";
            const isMistake = pt.move.classification === "mistake";
            const isBrilliant = pt.move.classification === "brilliant";

            let fillColor = "#B58A3A";
            if (isBlunder) fillColor = "#A94B45";
            else if (isMistake) fillColor = "#C97A1E";
            else if (isBrilliant) fillColor = "#27815D";

            return (
              <g
                key={pt.index}
                onClick={() => onSelectMove(pt.index)}
                className="transition-all hover:scale-125 cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5 : isBlunder || isMistake || isBrilliant ? 4 : 2}
                  fill={fillColor}
                  stroke={isSelected ? "#ffffff" : "none"}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* Active move vertical indicator */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padding}
              x2={activePoint.x}
              y2={height - padding}
              stroke="currentColor"
              className="text-[#B58A3A]"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-[#69736C] dark:text-[#B5BDB5] font-mono">
        <span>Move 1</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27815D]" /> Brilliant
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C97A1E]" /> Mistake
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A94B45]" /> Blunder
          </span>
        </div>
        <span>Move {Math.ceil(moves.length / 2)}</span>
      </div>
    </div>
  );
}
