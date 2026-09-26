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

  // Central Authoritative Game State
  const [gameState, setGameState] = useState<GameState>({
    id: gameId,
    status: "waiting",
    white: { name: "White", rating: 1500 },
    black: { name: "Black", rating: 1500 },
    turn: "white",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    moves: [],
    clocks: {
      white: 10 * 60 * 1000,
      black: 10 * 60 * 1000,
    },
    spectators: 0,
    lastMove: null,
  });

  // Connection State Machine (R3.35, R3.36)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>("reconnecting");
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

  // Current logged in user ID
  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("chessverse-token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.userId || payload?.id || null;
    } catch {
      return null;
    }
  }, []);

  // Determine user role (Player vs Spectator)
  const isSpectator = useMemo(() => {
    if (options.isSpectatorOnly) return true;
    if (!currentUserId) return true;
    const isWhite = gameState.white.id === currentUserId;
    const isBlack = gameState.black.id === currentUserId;
    return !isWhite && !isBlack;
  }, [options.isSpectatorOnly, currentUserId, gameState.white.id, gameState.black.id]);

  const userColor: PlayerColor | null = useMemo(() => {
    if (isSpectator || !currentUserId) return null;
    if (gameState.white.id === currentUserId) return "white";
    if (gameState.black.id === currentUserId) return "black";
    return null;
  }, [isSpectator, currentUserId, gameState.white.id, gameState.black.id]);

  // Update default orientation based on user color
  useEffect(() => {
    if (userColor === "black") {
      setOrientation("black");
    } else {
      setOrientation("white");
    }
  }, [userColor]);

  // Initialize client settings from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedSound = localStorage.getItem("chessverse-sound");
    if (savedSound !== null) setSoundEnabled(savedSound === "true");

    const savedCoords = localStorage.getItem("chessverse-coordinates");
    if (savedCoords !== null) setCoordinates(savedCoords === "true");

    const savedPiece = localStorage.getItem("chessverse-piece-set") as PieceSetStyle;
    if (savedPiece) setPieceSet(savedPiece);
  }, []);

  // Socket Connection and Authoritative State Reconciliation
  useEffect(() => {
    if (!socket.connected) {
      const token = typeof window !== "undefined" ? localStorage.getItem("chessverse-token") : null;
      if (token) {
        socket.auth = { token };
      }
      setConnectionStatus("reconnecting");
      socket.connect();
    } else {
      setConnectionStatus("connected");
    }

    function onConnect() {
      setConnectionStatus("synchronizing");
      socket.emit("game:join", {
        gameId,
        role: options.isSpectatorOnly ? "spectator" : "player",
      });
      socket.emit("game:rejoin", { gameId });
    }

    function onDisconnect() {
      setConnectionStatus("disconnected");
    }

    function onGameState(state: any) {
      setConnectionStatus("connected");

      let currentFen = state.fen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
      let isCheck = false;
      let isCheckmate = false;
      let checkSquare: string | null = null;

      try {
        const c = new Chess(currentFen);
        isCheck = c.inCheck();
        isCheckmate = c.isCheckmate();
        if (isCheck) {
          const turn = c.turn();
          const board = c.board();
          for (let r = 0; r < 8; r++) {
            for (let col = 0; col < 8; col++) {
              const piece = board[r][col];
              if (piece && piece.type === "k" && piece.color === turn) {
                checkSquare = `${String.fromCharCode(97 + col)}${8 - r}`;
                break;
              }
            }
          }
        }
      } catch {}

      // Sound triggers on state changes
      if (state.lastMove) {
        if (isCheck) {
          soundEngine.play("check");
        } else if (state.moves && state.moves.length > 0 && String(state.moves[state.moves.length - 1].san).includes("x")) {
          soundEngine.play("capture");
        } else {
          soundEngine.play("move");
        }
      }

      const whiteRemaining = state.clock?.whiteRemaining ?? state.clocks?.whiteTime ?? 600000;
      const blackRemaining = state.clock?.blackRemaining ?? state.clocks?.blackTime ?? 600000;

      setGameState({
        id: state.gameId || gameId,
        status: state.status || "playing",
        white: {
          id: state.whitePlayer?.id,
          name: state.whitePlayer?.name || "White",
          rating: state.whitePlayer?.rating || 1500,
        },
        black: {
          id: state.blackPlayer?.id,
          name: state.blackPlayer?.name || "Black",
          rating: state.blackPlayer?.rating || 1500,
        },
        turn: state.turn === "b" ? "black" : "white",
        fen: currentFen,
        moves: (state.moves || []).map((m: any, idx: number) => ({
          number: Math.floor(idx / 2) + 1,
          from: m.from,
          to: m.to,
          san: m.san,
          color: m.color === "b" || m.color === "black" ? "black" : "white",
          timestamp: m.timestamp,
        })),
        clocks: {
          white: whiteRemaining,
          black: blackRemaining,
          turnStartedAt: state.clock?.turnStartedAt,
          serverTime: state.clock?.serverTime || Date.now(),
          initialTime: state.clock?.initialTime,
          increment: state.clock?.increment,
        },
        spectators: state.spectators ?? 0,
        lastMove: state.lastMove,
        result: state.result,
        resultReason: state.resultReason || state.reason,
        checkSquare,
        isCheck,
        isCheckmate,
      });

      if (state.status === "finished" && state.result) {
        setIsGameOverModalOpen(true);
        soundEngine.play("gameEnd");
      }
    }

    function onClock(clock: any) {
      setGameState((prev) => ({
        ...prev,
        clocks: {
          ...prev.clocks,
          white: clock.whiteRemaining ?? clock.whiteTime ?? prev.clocks.white,
          black: clock.blackRemaining ?? clock.blackTime ?? prev.clocks.black,
          turnStartedAt: clock.turnStartedAt ?? prev.clocks.turnStartedAt,
          serverTime: clock.serverTime ?? Date.now(),
        },
      }));
    }

    function onDrawOffered(data: any) {
      if (data?.userId && data.userId !== currentUserId) {
        setDrawOfferedByOpponent(true);
      }
    }

    function onDrawDeclined() {
      setIsDrawOfferedByMe(false);
      setErrorMessage("Opponent declined draw offer.");
      setTimeout(() => setErrorMessage(null), 3500);
    }

    function onFinished(data: any) {
      setGameState((prev) => ({
        ...prev,
        status: "finished",
        result: data.result,
        resultReason: data.reason,
      }));
      setIsGameOverModalOpen(true);
      soundEngine.play("gameEnd");
    }

    function onViewers(data: { count: number }) {
      setGameState((prev) => ({ ...prev, spectators: data.count }));
    }

    function onError(err: { message?: string }) {
      if (err?.message) {
        setErrorMessage(err.message);
        setTimeout(() => setErrorMessage(null), 3500);
      }
      socket.emit("game:sync", { gameId });
    }

    function onPlayerDisconnected(data: any) {
      setDisconnectGrace({
        color: data.color || "opponent",
        secondsRemaining: data.gracePeriodSeconds || 30,
      });
    }

    function onPlayerReconnected() {
      setDisconnectGrace(null);
    }

    function onRematchOffered(data: any) {
      if (data.userId !== currentUserId) {
        setRematchStatus("Opponent requested a rematch! Click Rematch to accept.");
      } else {
        setRematchStatus("Rematch requested. Waiting for opponent...");
      }
    }

    function onRematchAccepted(data: { newGameId: string }) {
      setRematchStatus("Rematch accepted! Loading new match...");
      setTimeout(() => {
        router.push(`/game/${data.newGameId}`);
      }, 600);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("game:state", onGameState);
    socket.on("game:clock", onClock);
    socket.on("game:draw-offered", onDrawOffered);
    socket.on("game:drawOffer", onDrawOffered);
    socket.on("game:draw-declined", onDrawDeclined);
    socket.on("game:finished", onFinished);
    socket.on("game:ended", onFinished);
    socket.on("game:viewers", onViewers);
    socket.on("game:error", onError);
    socket.on("player:disconnected", onPlayerDisconnected);
    socket.on("player:reconnected", onPlayerReconnected);
    socket.on("game:rematch-offered", onRematchOffered);
    socket.on("game:rematch-accepted", onRematchAccepted);
    socket.on("game:rematch-created", onRematchAccepted);

    // Initial Join
    socket.emit("game:join", {
      gameId,
      role: options.isSpectatorOnly ? "spectator" : "player",
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("game:state", onGameState);
      socket.off("game:clock", onClock);
      socket.off("game:draw-offered", onDrawOffered);
      socket.off("game:drawOffer", onDrawOffered);
      socket.off("game:draw-declined", onDrawDeclined);
      socket.off("game:finished", onFinished);
      socket.off("game:ended", onFinished);
      socket.off("game:viewers", onViewers);
      socket.off("game:error", onError);
      socket.off("player:disconnected", onPlayerDisconnected);
      socket.off("player:reconnected", onPlayerReconnected);
      socket.off("game:rematch-offered", onRematchOffered);
      socket.off("game:rematch-accepted", onRematchAccepted);
      socket.off("game:rematch-created", onRematchAccepted);
    };
  }, [gameId, options.isSpectatorOnly, currentUserId, router]);

  // Grace timer countdown
  useEffect(() => {
    if (!disconnectGrace) return;
    const timer = setInterval(() => {
      setDisconnectGrace((prev) => {
        if (!prev || prev.secondsRemaining <= 1) return null;
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [disconnectGrace]);

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

  // Handle Square Selection & Move Dispatch
  const handleSquareClick = useCallback(
    (square: string) => {
      if (isSpectator || gameState.status !== "playing") return;

      // Ensure it's currently the player's turn
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
        // Check for pawn promotion (rank 8 for white, rank 1 for black)
        const fromRank = selectedSquare[1];
        const toRank = square[1];
        try {
          const c = new Chess(gameState.fen);
          const piece = c.get(selectedSquare as Square);
          if (piece && piece.type === "p" && ((piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1"))) {
            setPendingPromotion({ from: selectedSquare, to: square });
            setSelectedSquare(null);
            return;
          }
        } catch {}

        // Dispatch move to server
        const from = selectedSquare;
        const to = square;
        setSelectedSquare(null);

        socket.emit("game:move", {
          gameId,
          from,
          to,
          promotion: "q",
        });
      } else {
        // Selected another of user's pieces
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
    [isSpectator, gameState.status, gameState.turn, gameState.fen, userColor, selectedSquare, legalDestinations, gameId]
  );

  // Promotion choice confirmed
  const handleSelectPromotion = useCallback(
    (promoPiece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      socket.emit("game:move", {
        gameId,
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: promoPiece,
      });
      setPendingPromotion(null);
    },
    [gameId, pendingPromotion]
  );

  // Draw Actions
  const handleOfferDraw = useCallback(() => {
    setIsDrawOfferedByMe(true);
    socket.emit("game:draw-offer", { gameId });
  }, [gameId]);

  const handleAcceptDraw = useCallback(() => {
    setDrawOfferedByOpponent(false);
    socket.emit("game:draw-accept", { gameId });
  }, [gameId]);

  const handleDeclineDraw = useCallback(() => {
    setDrawOfferedByOpponent(false);
    socket.emit("game:draw-decline", { gameId });
  }, [gameId]);

  // Resign Action
  const handleResign = useCallback(() => {
    socket.emit("game:resign", { gameId });
  }, [gameId]);

  // Rematch Action
  const handleRequestRematch = useCallback(() => {
    setRematchStatus("Rematch requested. Waiting for opponent...");
    socket.emit("game:rematch", { gameId });
  }, [gameId]);

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
