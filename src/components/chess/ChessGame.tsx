"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { socket } from "@/lib/socket";
import GameResult from "./GameResult";
import LiveReactions from "@/components/room/LiveReactions";
import ReactionOverlay from "@/components/room/ReactionOverlay";

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
  const [hasDrawOffer, setHasDrawOffer] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [gameResult, setGameResult] = useState<{
    result: "white" | "black" | "draw";
    reason: "checkmate" | "timeout" | "resignation" | "draw";
  } | null>(null);
  const [clock, setClock] = useState({
    white: 5 * 60 * 1000,
    black: 5 * 60 * 1000,
    activeColor: "white" as "white" | "black" | null,
  });

  useEffect(() => {
    function handleMembers(data: {
      members: {
        socketId: string;
        role: "player" | "spectator";
      }[];
    }) {
      setSpectatorCount(
        data.members.filter((member) => member.role === "spectator").length,
      );
    }

    socket.on("room:members", handleMembers);

    return () => {
      socket.off("room:members", handleMembers);
    };
  }, []);

  useEffect(() => {
    function handleDrawOffer() {
      if (role === "player") {
        setHasDrawOffer(true);
      }
    }

    socket.on("game:drawOffer", handleDrawOffer);

    return () => {
      socket.off("game:drawOffer", handleDrawOffer);
    };
  }, [role]);

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

  useEffect(() => {
    function handleGameFinished(data: {
      result: "white" | "black" | "draw";
      reason: "checkmate" | "timeout" | "resignation" | "draw";
    }) {
      setGameResult(data);
    }

    function handleRematchCreated(data: {
      gameId: string;
      fen: string;
    }) {
      setGameId(data.gameId);
      setGame(new Chess(data.fen));
      setGameResult(null);
      setHasDrawOffer(false);
      setPlayerColor((prev) =>
        prev === "white" ? "black" : prev === "black" ? "white" : null,
      );
      socket.emit("game:clock", { gameId: data.gameId });
    }

    socket.on("game:finished", handleGameFinished);
    socket.on("game:rematchCreated", handleRematchCreated);

    return () => {
      socket.off("game:finished", handleGameFinished);
      socket.off("game:rematchCreated", handleRematchCreated);
    };
  }, []);

  function makeMove(sourceSquare: string, targetSquare: string) {
    if (role === "spectator" || gameResult) {
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

      {hasDrawOffer && role === "player" && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-[#d7b875]/40 bg-[#171714] p-3.5 text-sm shadow-lg">
          <span className="text-[#d7b875] font-medium">Opponent offered a draw</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (gameId) {
                  socket.emit("game:drawAccept", { gameId });
                }
                setHasDrawOffer(false);
              }}
              className="rounded-lg bg-[#d7b875] px-3 py-1.5 text-xs font-semibold text-black transition hover:brightness-110"
            >
              Accept
            </button>
            <button
              onClick={() => setHasDrawOffer(false)}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Decline
            </button>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return makeMove(sourceSquare, targetSquare);
            },
            boardOrientation: playerColor === "black" ? "black" : "white",
            allowDragging: role === "player" && !gameResult,
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

        <ReactionOverlay />

        {gameResult && (
          <GameResult
            result={gameResult.result}
            reason={gameResult.reason}
            playerColor={playerColor}
            onRematch={() => {
              socket.emit("game:rematch", {
                roomId,
              });
              setGameResult(null);
            }}
          />
        )}
      </div>

      {role === "player" && (
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => {
              if (gameId) {
                socket.emit("game:resign", {
                  gameId,
                });
              }
            }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Resign
          </button>

          <button
            onClick={() => {
              socket.emit("game:drawOffer", {
                roomId,
              });
            }}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Offer draw
          </button>
        </div>
      )}

      {/* Room Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <div className="flex items-center gap-4 text-sm text-white/40">
          <span>
            {spectatorCount} watching
          </span>

          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          <LiveReactions roomId={roomId} />
        </div>
      </div>

      <p className="mt-4 text-xs text-white/35">
        Moves are validated by the ChessVerse server.
      </p>
    </div>
  );
}
