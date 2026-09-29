"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Chess, Square } from "chess.js";
import { socket } from "@/lib/socket";
import { soundEngine } from "@/lib/soundEngine";
import { formatMovesList, getCapturedPiecesAndAdvantage } from "@/lib/chessHelpers";
import { GameState, Player, Move, ConnectionState, PlayerColor } from "./types";
import { PieceSetStyle } from "@/components/game/ChessBoard/PieceSets";

interface UseGameRoomOptions {
  isSpectatorOnly?: boolean;
}

export function useGameRoom(gameId: string, options: UseGameRoomOptions = {}) {
  const router = useRouter();

  // Authoritative & Resilient Game State
  const [gameState, setGameState] = useState<GameState>({
    id: gameId,
    status: "playing",
    white: { id: "user-player", name: "Dharmapada", rating: 1428 },
    black: { id: "opponent-player", name: "Grandmaster AI", rating: 1520 },
    turn: "white",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
    clocks: {
      white: 5 * 60 * 1000,
      black: 5 * 60 * 1000,
    },
    spectators: 12,
    lastMove: null,
  });

  const chessRef = useRef(new Chess(gameState.fen));

  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>("connected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Board Interactivity & Selection
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<PlayerColor>("white");
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Draw, Resign & Rematch Flows
  const [drawOfferedByOpponent, setDrawOfferedByOpponent] = useState(false);
  const [isDrawOfferedByMe, setIsDrawOfferedByMe] = useState(false);
  const [rematchStatus, setRematchStatus] = useState<string | null>(null);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [coordinates, setCoordinates] = useState(true);
  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [pieceSet, setPieceSet] = useState<PieceSetStyle>("classic");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Disconnect Grace Countdown
  const [disconnectGrace, setDisconnectGrace] = useState<{ color: string; secondsRemaining: number } | null>(null);

  // Spectator determination: Only true if explicitly requested
  const isSpectator = Boolean(options.isSpectatorOnly);
  const userColor: PlayerColor = orientation;

  // Active clock countdown interval
  useEffect(() => {
    if (gameState.status !== "playing") return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.status !== "playing") return prev;

        const turn = prev.turn;
        const currentWhite = prev.clocks.white;
        const currentBlack = prev.clocks.black;

        if (turn === "white") {
          const nextWhite = Math.max(0, currentWhite - 100);
          if (nextWhite === 0) {
            return {
              ...prev,
              status: "finished",
              result: "0-1",
              resultReason: "Black wins on time",
              clocks: { ...prev.clocks, white: 0 },
            };
          }
          return {
            ...prev,
            clocks: { ...prev.clocks, white: nextWhite },
          };
        } else {
          const nextBlack = Math.max(0, currentBlack - 100);
          if (nextBlack === 0) {
            return {
              ...prev,
              status: "finished",
              result: "1-0",
              resultReason: "White wins on time",
              clocks: { ...prev.clocks, black: 0 },
            };
          }
          return {
            ...prev,
            clocks: { ...prev.clocks, black: nextBlack },
          };
        }
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.status]);

  // Socket Connection and State Synchronization
  useEffect(() => {
    if (socket && !socket.connected) {
      try {
        socket.connect();
      } catch {}
    }

    function onConnect() {
      setConnectionStatus("connected");
      socket.emit("game:join", {
        gameId,
        role: isSpectator ? "spectator" : "player",
      });
    }

    function onGameState(state: any) {
      if (!state) return;
      setConnectionStatus("connected");
      const currentFen = state.fen || gameState.fen;
      try {
        chessRef.current = new Chess(currentFen);
      } catch {}

      setGameState((prev) => ({
        ...prev,
        fen: currentFen,
        turn: state.turn === "b" ? "black" : "white",
        status: state.status || prev.status,
        result: state.result || prev.result,
        resultReason: state.resultReason || prev.resultReason,
        clocks: {
          white: state.clocks?.white ?? prev.clocks.white,
          black: state.clocks?.black ?? prev.clocks.black,
        },
      }));
    }

    socket.on("connect", onConnect);
    socket.on("game:state", onGameState);

    return () => {
      socket.off("connect", onConnect);
      socket.off("game:state", onGameState);
    };
  }, [gameId, isSpectator, gameState.fen]);

  // Legal destinations calculation for active player
  const legalDestinations = useMemo(() => {
    if (!selectedSquare || isSpectator || gameState.status !== "playing") return [];
    try {
      const c = new Chess(gameState.fen);
      const moves = c.moves({ square: selectedSquare as Square, verbose: true });
      return moves.map((m) => m.to);
    } catch {
      return [];
    }
  }, [selectedSquare, gameState.fen, isSpectator, gameState.status]);

  // Execute a move locally and notify socket
  const executeMove = useCallback(
    (from: string, to: string, promotion = "q") => {
      try {
        const c = new Chess(gameState.fen);
        const moveRes = c.move({ from, to, promotion });

        if (!moveRes) return false;

        const nextFen = c.fen();
        const isCheck = c.inCheck();
        const isGameOver = c.isGameOver();
        const isCheckmate = c.isCheckmate();
        const isDraw = c.isDraw();

        // Sound triggers
        if (isCheckmate || isGameOver) {
          soundEngine.play("gameEnd");
        } else if (isCheck) {
          soundEngine.play("check");
        } else if (moveRes.captured) {
          soundEngine.play("capture");
        } else if (moveRes.flags.includes("k") || moveRes.flags.includes("q")) {
          soundEngine.play("castle");
        } else {
          soundEngine.play("move");
        }

        const nextTurn = c.turn() === "w" ? "white" : "black";
        let result: string | undefined = undefined;
        let resultReason: string | undefined = undefined;

        if (isCheckmate) {
          result = moveRes.color === "w" ? "1-0" : "0-1";
          resultReason = `${moveRes.color === "w" ? "White" : "Black"} wins by checkmate`;
          setIsGameOverModalOpen(true);
        } else if (isDraw) {
          result = "1/2-1/2";
          resultReason = "Game drawn";
          setIsGameOverModalOpen(true);
        }

        setGameState((prev) => ({
          ...prev,
          fen: nextFen,
          turn: nextTurn,
          status: isGameOver ? "finished" : "playing",
          result,
          resultReason,
          lastMove: {
            number: Math.floor(prev.moves.length / 2) + 1,
            from,
            to,
            san: moveRes.san,
            color: moveRes.color === "w" ? "white" : "black",
          },
          moves: [
            ...prev.moves,
            {
              number: Math.floor(prev.moves.length / 2) + 1,
              from,
              to,
              san: moveRes.san,
              color: moveRes.color === "w" ? "white" : "black",
              timestamp: Date.now(),
            },
          ],
        }));

        // Send to socket if connected
        if (socket.connected) {
          socket.emit("game:move", { gameId, from, to, promotion });
        }

        // Automatic engine/bot response if playing against bot or peer not connected
        if (!isGameOver && nextTurn === "black") {
          setTimeout(() => {
            try {
              const botChess = new Chess(nextFen);
              const botMoves = botChess.moves({ verbose: true });
              if (botMoves.length > 0) {
                // Pick a strong or capture move
                const captures = botMoves.filter((m) => m.captured);
                const chosen = captures.length > 0
                  ? captures[Math.floor(Math.random() * captures.length)]
                  : botMoves[Math.floor(Math.random() * botMoves.length)];

                const botMoveRes = botChess.move(chosen);
                if (botMoveRes) {
                  const botNextFen = botChess.fen();
                  const botCheck = botChess.inCheck();
                  const botGameOver = botChess.isGameOver();

                  if (botGameOver) {
                    soundEngine.play("gameEnd");
                    setIsGameOverModalOpen(true);
                  } else if (botCheck) {
                    soundEngine.play("check");
                  } else if (botMoveRes.captured) {
                    soundEngine.play("capture");
                  } else {
                    soundEngine.play("move");
                  }

                  setGameState((prev) => ({
                    ...prev,
                    fen: botNextFen,
                    turn: "white",
                    status: botGameOver ? "finished" : "playing",
                    result: botGameOver ? "0-1" : undefined,
                    resultReason: botGameOver ? "Black wins by checkmate" : undefined,
                    lastMove: {
                      number: Math.floor(prev.moves.length / 2) + 1,
                      from: chosen.from,
                      to: chosen.to,
                      san: botMoveRes.san,
                      color: "black",
                    },
                    moves: [
                      ...prev.moves,
                      {
                        number: Math.floor(prev.moves.length / 2) + 1,
                        from: chosen.from,
                        to: chosen.to,
                        san: botMoveRes.san,
                        color: "black",
                        timestamp: Date.now(),
                      },
                    ],
                  }));
                }
              }
            } catch {}
          }, 900);
        }

        return true;
      } catch {
        return false;
      }
    },
    [gameState.fen, gameId]
  );

  // Handle Square Selection & Move Dispatch
  const handleSquareClick = useCallback(
    (square: string) => {
      if (isSpectator || gameState.status !== "playing") return;

      const isMyTurn = (userColor === "white" && gameState.turn === "white") || (userColor === "black" && gameState.turn === "black");
      if (!isMyTurn) return;

      if (!selectedSquare) {
        try {
          const c = new Chess(gameState.fen);
          const piece = c.get(square as Square);
          if (piece && ((userColor === "white" && piece.color === "w") || (userColor === "black" && piece.color === "b"))) {
            setSelectedSquare(square);
          }
        } catch {}
        return;
      }

      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }

      // Check if clicked square is a legal destination
      if (legalDestinations.includes(square as Square)) {
        const from = selectedSquare;
        const to = square;
        setSelectedSquare(null);

        // Check for pawn promotion
        const toRank = square[1];
        try {
          const c = new Chess(gameState.fen);
          const piece = c.get(from as Square);
          if (piece && piece.type === "p" && ((piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1"))) {
            setPendingPromotion({ from, to });
            return;
          }
        } catch {}

        executeMove(from, to, "q");
      } else {
        // Selected another piece
        try {
          const c = new Chess(gameState.fen);
          const piece = c.get(square as Square);
          if (piece && ((userColor === "white" && piece.color === "w") || (userColor === "black" && piece.color === "b"))) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        } catch {
          setSelectedSquare(null);
        }
      }
    },
    [isSpectator, gameState.status, gameState.turn, gameState.fen, userColor, selectedSquare, legalDestinations, executeMove]
  );

  // Promotion choice confirmed
  const handleSelectPromotion = useCallback(
    (promoPiece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      executeMove(pendingPromotion.from, pendingPromotion.to, promoPiece);
      setPendingPromotion(null);
    },
    [pendingPromotion, executeMove]
  );

  // Resign Action
  const handleResign = useCallback(() => {
    soundEngine.play("gameEnd");
    setGameState((prev) => ({
      ...prev,
      status: "finished",
      result: userColor === "white" ? "0-1" : "1-0",
      resultReason: `${userColor === "white" ? "White" : "Black"} resigned`,
    }));
    setIsGameOverModalOpen(true);
    if (socket.connected) {
      socket.emit("game:resign", { gameId });
    }
  }, [userColor, gameId]);

  // Draw Actions
  const handleOfferDraw = useCallback(() => {
    setIsDrawOfferedByMe(true);
    setTimeout(() => {
      // Simulate opponent accepting or rejecting
      soundEngine.play("gameEnd");
      setGameState((prev) => ({
        ...prev,
        status: "finished",
        result: "1/2-1/2",
        resultReason: "Draw agreed by mutual agreement",
      }));
      setIsGameOverModalOpen(true);
    }, 1200);
  }, []);

  const handleAcceptDraw = useCallback(() => {
    setDrawOfferedByOpponent(false);
    setGameState((prev) => ({
      ...prev,
      status: "finished",
      result: "1/2-1/2",
      resultReason: "Draw agreed",
    }));
    setIsGameOverModalOpen(true);
  }, []);

  const handleDeclineDraw = useCallback(() => {
    setDrawOfferedByOpponent(false);
  }, []);

  // Rematch Action
  const handleRequestRematch = useCallback(() => {
    setRematchStatus("Rematch accepted! Starting new duel...");
    setTimeout(() => {
      const nextGameId = `game-${Date.now()}`;
      router.push(`/game/${nextGameId}`);
    }, 800);
  }, [router]);

  // Captured pieces and material advantage
  const capturedState = useMemo(() => {
    return getCapturedPiecesAndAdvantage(gameState.fen);
  }, [gameState.fen]);

  // Move table list
  const formattedMoves = useMemo(() => {
    return formatMovesList(gameState.moves.map((m) => m.san));
  }, [gameState.moves]);

  return {
    gameState,
    connectionStatus,
    errorMessage,
    selectedSquare,
    legalDestinations,
    orientation,
    isSpectator,
    userColor,
    pendingPromotion,
    drawOfferedByOpponent,
    isDrawOfferedByMe,
    rematchStatus,
    isGameOverModalOpen,
    capturedState,
    formattedMoves,
    disconnectGrace,
    // Settings
    soundEnabled,
    coordinates,
    showLegalMoves,
    animations,
    pieceSet,
    isSettingsOpen,
    // Action handlers
    handleSquareClick,
    handleSelectPromotion,
    setPendingPromotion,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    handleResign,
    handleRequestRematch,
    toggleOrientation: () => setOrientation((o) => (o === "white" ? "black" : "white")),
    setSoundEnabled: (v: boolean) => {
      setSoundEnabled(v);
      soundEngine.setEnabled(v);
    },
    setCoordinates: (v: boolean) => {
      setCoordinates(v);
      if (typeof window !== "undefined") localStorage.setItem("chessverse-coordinates", String(v));
    },
    setShowLegalMoves,
    setAnimations,
    setPieceSet: (s: PieceSetStyle) => {
      setPieceSet(s);
      if (typeof window !== "undefined") localStorage.setItem("chessverse-piece-set", s);
    },
    setIsSettingsOpen,
    setIsGameOverModalOpen,
  };
}
