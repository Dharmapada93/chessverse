"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { socket } from "@/lib/socket";

type ChessGameProps = {
  roomId: string;
  role?: "player" | "spectator";
};

export default function ChessGame({
  roomId,
  role = "player",
}: ChessGameProps) {
  const [game, setGame] = useState(() => new Chess());
  const [status, setStatus] = useState("Waiting for players");
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [clock, setClock] = useState({
    white: 5 * 60 * 1000,
    black: 5 * 60 * 1000,
    activeColor: "white" as "white" | "black" | null,
  });

  useEffect(() => {
    async function restoreGame() {
      try {
        const token =
          localStorage.getItem(
            "chessverse-token",
          );

        const response =
          await fetch(
            `http://localhost:4000/api/games/room/${roomId}/current`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (data.success && data.game) {
          setGameId(data.game._id);
          setGame(
            new Chess(
              data.game.currentFen,
            ),
          );
          if (data.game.whiteTimeMs != null && data.game.blackTimeMs != null) {
            setClock({
              white: data.game.whiteTimeMs,
              black: data.game.blackTimeMs,
              activeColor: data.game.activeColor ?? null,
            });
          }
        }
      } catch {
        // Keep the local game state.
      }
    }

    restoreGame();
  }, [roomId]);

  useEffect(() => {
    function handleClock(nextClock: {
      white: number;
      black: number;
      activeColor: "white" | "black" | null;
    }) {
      setClock(nextClock);
    }

    socket.on("game:clock", handleClock);

    return () => {
      socket.off("game:clock", handleClock);
    };
  }, []);

  useEffect(() => {
    if (!clock.activeColor) return;

    const timer = setInterval(() => {
      setClock((prev) => {
        if (!prev.activeColor) return prev;
        return {
          ...prev,
          [prev.activeColor]: Math.max(0, prev[prev.activeColor] - 1000),
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clock.activeColor]);

  useEffect(() => {
    function handleGameJoined(data: {
      gameId?: string;
      fen: string;
      turn: "white" | "black";
      color: "white" | "black" | null;
    }) {
      if (data.gameId) {
        setGameId(data.gameId);
        socket.emit("game:clock", { gameId: data.gameId });
      }
      setGame(new Chess(data.fen));
      if (data.color) {
        setPlayerColor(data.color);
        setStatus(
          data.color === data.turn ? "Your turn" : "Opponent's turn",
        );
      } else {
        setStatus("Spectator mode");
      }
    }

    function handleGameState(data: {
      fen: string;
      turn: "white" | "black";
      isCheck: boolean;
      isCheckmate: boolean;
      isDraw: boolean;
    }) {
      const newGame = new Chess(data.fen);
      setGame(newGame);

      if (data.isCheckmate) {
        setStatus(
          data.turn === "white"
            ? "Black wins by checkmate"
            : "White wins by checkmate",
        );
      } else if (data.isDraw) {
        setStatus("Game drawn");
      } else if (data.isCheck) {
        setStatus(
          data.turn === "white"
            ? "White is in check"
            : "Black is in check",
        );
      } else {
        if (role === "spectator") {
          setStatus(
            data.turn === "white" ? "White to move" : "Black to move",
          );
        } else if (playerColor) {
          setStatus(
            playerColor === data.turn ? "Your turn" : "Opponent's turn",
          );
        } else {
          setStatus(
            data.turn === "white" ? "White to move" : "Black to move",
          );
        }
      }
    }

    function handleRejected(data: { error: string }) {
      setStatus(data.error);
    }

    socket.on("game:joined", handleGameJoined);
    socket.on("game:state", handleGameState);
    socket.on("game:moveRejected", handleRejected);

    return () => {
      socket.off("game:joined", handleGameJoined);
      socket.off("game:state", handleGameState);
      socket.off("game:moveRejected", handleRejected);
    };
  }, [playerColor, role]);

  function makeMove(sourceSquare: string, targetSquare: string) {
    if (role === "spectator") {
      return false;
    }

    socket.emit("game:move", {
      roomId,
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    return true;
  }

  function formatClock(milliseconds: number) {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Live Match</p>
          <p className="mt-1 text-xs text-white/35">
            {role === "spectator"
              ? "Spectator mode"
              : playerColor
                ? `Playing as ${playerColor}`
                : "Joining game..."}
          </p>
        </div>

        <p className="text-sm font-medium text-[#d7b875]">
          {status}
        </p>
      </div>

      {/* Clocks */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div
          className={`rounded-xl border px-4 py-3 transition-colors ${
            clock.activeColor === "white"
              ? "border-[#d7b875]/40 bg-[#171714]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">White</span>
            <span className="font-mono text-2xl font-semibold">
              {formatClock(clock.white)}
            </span>
          </div>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 transition-colors ${
            clock.activeColor === "black"
              ? "border-[#d7b875]/40 bg-[#171714]"
              : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Black</span>
            <span className="font-mono text-2xl font-semibold">
              {formatClock(clock.black)}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return makeMove(sourceSquare, targetSquare);
            },
            boardOrientation: playerColor === "black" ? "black" : "white",
            allowDragging: role === "player",
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

      <p className="mt-4 text-xs text-white/35">
        Moves are validated by the ChessVerse server.
      </p>
    </div>
  );
}
