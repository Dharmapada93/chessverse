"use client";

import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [status, setStatus] = useState("White to move");

  function makeMove(sourceSquare: string, targetSquare: string) {
    try {
      const newGame = new Chess(game.fen());

      const moveResult = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // auto-promote to queen for simplicity
      });

      if (!moveResult) return false;

      setGame(newGame);

      if (newGame.isCheckmate()) {
        setStatus(
          newGame.turn() === "w"
            ? "Black wins by checkmate"
            : "White wins by checkmate",
        );
      } else if (newGame.isDraw()) {
        setStatus("Game drawn");
      } else if (newGame.inCheck()) {
        setStatus(
          newGame.turn() === "w"
            ? "White is in check"
            : "Black is in check",
        );
      } else {
        setStatus(
          newGame.turn() === "w"
            ? "White to move"
            : "Black to move",
        );
      }

      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-white/50">Live Match</p>

        <p className="text-sm font-medium text-[#d7b875]">
          {status}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return makeMove(sourceSquare, targetSquare);
            },
            boardOrientation: "white",
            boardStyle: {
              borderRadius: "0px",
            },
            darkSquareStyle: {
              backgroundColor: "#8f7651",
            },
            lightSquareStyle: {
              backgroundColor: "#e7d8b8",
            },
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/35">
        <span>Moves are validated locally</span>

        <button
          onClick={() => {
            setGame(new Chess());
            setStatus("White to move");
          }}
          className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/5 hover:text-white"
        >
          New game
        </button>
      </div>
    </div>
  );
}
