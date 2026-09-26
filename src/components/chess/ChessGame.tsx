"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { socket } from "@/lib/socket";
import { apiFetch } from "@/lib/api";
import GameResult from "./GameResult";
import GameOverPanel from "@/components/game/GameOverPanel";
import LiveReactions from "@/components/room/LiveReactions";
import ReactionOverlay from "@/components/room/ReactionOverlay";
import AuthoritativeClock from "./AuthoritativeClock";
import { soundEngine } from "@/lib/soundEngine";
import { useTheme } from "@/context/ThemeContext";
import { boardThemes } from "@/config/boards";

type ChessGameProps = {
  roomId: string;
  role?: "player" | "spectator";
};

export default function ChessGame({
  roomId,
  role = "player",
}: ChessGameProps) {
  const { boardTheme } = useTheme();
  const [game, setGame] = useState(() => new Chess());
  const [status, setStatus] = useState("Waiting for players");
  const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [hasDrawOffer, setHasDrawOffer] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameResult, setGameResult] = useState<{
    result: "white" | "black" | "draw";
    reason: "checkmate" | "timeout" | "resignation" | "draw";
  } | null>(null);
  const [clock, setClock] = useState({
    white: 5 * 60 * 1000,
    black: 5 * 60 * 1000,
    activeColor: "white" as "white" | "black" | null,
  });

  const activeTheme = useMemo(() => {
    return boardThemes.find((b) => b.id === boardTheme) || boardThemes[0];
  }, [boardTheme]);

  // Subtle check highlight on King's square (R9.16)
  const checkSquare = useMemo(() => {
    if (!game.inCheck()) return null;
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === "k" && p.color === turn) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          return `${file}${rank}`;
        }
      }
    }
    return null;
  }, [game]);

  const authoritativeFenRef = useRef<string>(game.fen());

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
        const response = await apiFetch(`/api/games/room/${roomId}/current`);

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (data.success && data.game) {
          setGameId(data.game._id);
          authoritativeFenRef.current = data.game.currentFen;
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
      authoritativeFenRef.current = data.fen;
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
      if (authoritativeFenRef.current) {
        setGame(new Chess(authoritativeFenRef.current));
      }
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

    try {
      // Optimistic move execution (R8.18 & R8.19)
      const nextGame = new Chess(game.fen());
      const move = nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (!move) return false;

      // Update board immediately for sub-50ms visual responsiveness
      setGame(nextGame);
      setLastMove({ from: sourceSquare, to: targetSquare });
      soundEngine.play(move.captured ? "capture" : "move");

      // Send to server with unique eventId (R8.22 & R8.29)
      socket.emit("game:move", {
        roomId,
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
        eventId: `${roomId}:${sourceSquare}:${targetSquare}:${Date.now()}`,
      });

      return true;
    } catch {
      return false;
    }
  }

  // Custom square styles for last move and in-check King (R9.14 & R9.16)
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (lastMove) {
      styles[lastMove.from] = { backgroundColor: "rgba(215, 184, 117, 0.22)" };
      styles[lastMove.to] = { backgroundColor: "rgba(215, 184, 117, 0.32)" };
    }
    if (checkSquare) {
      styles[checkSquare] = {
        backgroundColor: "rgba(239, 68, 68, 0.45)",
        boxShadow: "inset 0 0 0 2px rgba(239, 68, 68, 0.8)",
      };
    }
    return styles;
  }, [lastMove, checkSquare]);

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

      {/* Isolated Authoritative Clock (R8.14 - R8.17) */}
      <AuthoritativeClock
        whiteTimeMs={clock.white}
        blackTimeMs={clock.black}
        activeColor={clock.activeColor}
        className="mb-3"
      />

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

      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl touch-none aspect-square">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: ({ sourceSquare, targetSquare }) => {
              if (!targetSquare) return false;
              return makeMove(sourceSquare, targetSquare);
            },
            boardOrientation: playerColor === "black" ? "black" : "white",
            allowDragging: role === "player" && !gameResult,
            showNotation: true,
            squareStyles: customSquareStyles,
            boardStyle: {
              borderRadius: "0px",
            },
            darkSquareStyle: {
              backgroundColor: activeTheme.dark,
            },
            lightSquareStyle: {
              backgroundColor: activeTheme.light,
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
            onClick={() => setShowResignModal(true)}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white active:scale-95 inline-flex items-center justify-center cursor-pointer"
          >
            Resign
          </button>

          <button
            onClick={() => {
              socket.emit("game:drawOffer", {
                roomId,
              });
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white active:scale-95 inline-flex items-center justify-center cursor-pointer"
          >
            Offer draw
          </button>
        </div>
      )}

      {/* 2-Step Resign Confirmation Modal (R9.24) */}
      {showResignModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161614] p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Resign game?</h3>
            <p className="mt-1.5 text-xs text-white/60">
              Your opponent will win this game.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowResignModal(false)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/[0.05] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResignModal(false);
                  if (gameId) {
                    socket.emit("game:resign", { gameId });
                  }
                }}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition cursor-pointer"
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {gameResult && (
        <div className="mt-6">
          <GameOverPanel
            result={
              gameResult.result === "draw"
                ? "Match Drawn"
                : `${gameResult.result.toUpperCase()} Won`
            }
            reason={gameResult.reason}
            gameId={gameId || undefined}
            roomCode={roomId}
            onRematchSuccess={(newGameId) => {
              setGameResult(null);
              setGameId(newGameId);
              setGame(new Chess());
              setStatus("Rematch starting...");
            }}
          />
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
