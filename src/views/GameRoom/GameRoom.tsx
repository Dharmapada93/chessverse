"use client";

import React from "react";
import GameLayout from "@/layouts/GameLayout";
import ChessBoard from "@/components/game/ChessBoard";
import PlayerPanel from "@/components/game/PlayerPanel";
import GameControls from "@/components/game/GameControls";
import MoveList from "@/components/game/MoveList";
import SpectatorPanel from "@/components/game/SpectatorPanel";
import GameChat from "@/components/game/GameChat";
import ConnectionStatus from "@/components/game/ConnectionStatus";
import PromotionModal from "./PromotionModal";
import GameEndModal from "./GameEndModal";
import GameSettingsModal from "./GameSettingsModal";
import { useGameRoom } from "./useGameRoom";
import { Swords, Check, X, ShieldAlert } from "lucide-react";
import { PieceColor } from "@/components/game/ChessBoard/PieceSets";

interface GameRoomProps {
  gameId: string;
  isSpectatorOnly?: boolean;
}

export default function GameRoom({ gameId, isSpectatorOnly = false }: GameRoomProps) {
  const {
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
    soundEnabled,
    coordinates,
    showLegalMoves,
    animations,
    pieceSet,
    isSettingsOpen,
    handleSquareClick,
    handleSelectPromotion,
    setPendingPromotion,
    handleOfferDraw,
    handleAcceptDraw,
    handleDeclineDraw,
    handleResign,
    handleRequestRematch,
    toggleOrientation,
    setSoundEnabled,
    setCoordinates,
    setShowLegalMoves,
    setAnimations,
    setPieceSet,
    setIsSettingsOpen,
    setIsGameOverModalOpen,
  } = useGameRoom(gameId, { isSpectatorOnly });

  const isWhiteOrientation = orientation === "white";

  // Determine top and bottom players based on orientation
  const topPlayer = isWhiteOrientation ? gameState.black : gameState.white;
  const bottomPlayer = isWhiteOrientation ? gameState.white : gameState.black;
  const topColor = isWhiteOrientation ? "black" : "white";
  const bottomColor = isWhiteOrientation ? "white" : "black";

  const isTopActive = isWhiteOrientation
    ? gameState.turn === "black"
    : gameState.turn === "white";
  const isBottomActive = isWhiteOrientation
    ? gameState.turn === "white"
    : gameState.turn === "black";

  const topClockMs = isWhiteOrientation
    ? gameState.clocks.black
    : gameState.clocks.white;
  const bottomClockMs = isWhiteOrientation
    ? gameState.clocks.white
    : gameState.clocks.black;

  const topCaptured = isWhiteOrientation
    ? capturedState.whiteCaptured
    : capturedState.blackCaptured;
  const bottomCaptured = isWhiteOrientation
    ? capturedState.blackCaptured
    : capturedState.whiteCaptured;

  const isGameOver = gameState.status === "finished" || gameState.status === "aborted";

  // Status Banner (Draw offer alert, error message, etc.)
  const statusBanner = (
    <>
      {/* R3.35: Connection Status Pill & Error Banner */}
      {errorMessage && (
        <div className="bg-red-500/15 border-b border-red-500/30 px-4 py-2 text-center text-xs font-medium text-red-300 transition-all">
          {errorMessage}
        </div>
      )}

      {/* R3.27: Interactive Opponent Draw Offer Banner */}
      {drawOfferedByOpponent && !isGameOver && (
        <div className="bg-[#FBF9F3] dark:bg-[#21332B] border-b border-[rgba(24,34,30,0.10)] dark:border-white/10 px-4 py-2.5 shadow-xs">
          <div className="mx-auto max-w-[1500px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[#18352B] dark:text-[#F4EFE3] font-medium">
              <Swords size={16} className="text-[#B58A3A]" />
              <span>Your opponent offered a draw.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptDraw}
                className="inline-flex items-center gap-1 rounded-[10px] bg-[#18352B] dark:bg-[#285443] hover:bg-[#285443] px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer shadow-xs"
              >
                <Check size={13} />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={handleDeclineDraw}
                className="inline-flex items-center gap-1 rounded-[10px] border border-[rgba(24,34,30,0.12)] dark:border-white/10 bg-[#F7F4EC] dark:bg-[#1B2A24] hover:bg-[#FAF8F2] px-3.5 py-1.5 text-xs font-semibold text-[#18352B] dark:text-[#F4EFE3] transition cursor-pointer"
              >
                <X size={13} />
                <span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <GameLayout
        spectatorCount={gameState.spectators}
        isSpectator={isSpectator}
        statusBanner={statusBanner}
        topPlayer={
          <PlayerPanel
            name={topPlayer.name}
            rating={topPlayer.rating}
            color={topColor}
            isCurrentTurn={isTopActive}
            isUserPlayer={!isSpectator && userColor === topColor}
            clockMs={topClockMs}
            turnStartedAt={gameState.clocks.turnStartedAt}
            serverTime={gameState.clocks.serverTime}
            isClockActive={isTopActive && !isGameOver}
            capturedPieces={topCaptured}
            materialDifference={topColor === "white" ? capturedState.whiteAdvantage : capturedState.blackAdvantage}
            disconnectGraceSeconds={disconnectGrace?.color === topColor ? disconnectGrace.secondsRemaining : null}
          >
            <ConnectionStatus status={connectionStatus} />
          </PlayerPanel>
        }
        board={
          <ChessBoard
            fen={gameState.fen}
            orientation={orientation}
            selectedSquare={selectedSquare}
            legalDestinations={legalDestinations}
            lastMove={gameState.lastMove ? { from: gameState.lastMove.from, to: gameState.lastMove.to } : null}
            checkSquare={gameState.checkSquare}
            isCheckmate={gameState.isCheckmate}
            pieceSet={pieceSet}
            showCoordinates={coordinates}
            showLegalMoves={showLegalMoves}
            interactive={!isSpectator && !isGameOver}
            onSquareClick={handleSquareClick}
          />
        }
        bottomPlayer={
          <PlayerPanel
            name={bottomPlayer.name}
            rating={bottomPlayer.rating}
            color={bottomColor}
            isCurrentTurn={isBottomActive}
            isUserPlayer={!isSpectator && userColor === bottomColor}
            clockMs={bottomClockMs}
            turnStartedAt={gameState.clocks.turnStartedAt}
            serverTime={gameState.clocks.serverTime}
            isClockActive={isBottomActive && !isGameOver}
            capturedPieces={bottomCaptured}
            materialDifference={bottomColor === "white" ? capturedState.whiteAdvantage : capturedState.blackAdvantage}
            disconnectGraceSeconds={disconnectGrace?.color === bottomColor ? disconnectGrace.secondsRemaining : null}
          />
        }
        controls={
          <GameControls
            onOfferDraw={handleOfferDraw}
            onResign={handleResign}
            onFlipBoard={toggleOrientation}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            soundEnabled={soundEnabled}
            isGameOver={isGameOver}
            isSpectator={isSpectator}
            drawOffered={isDrawOfferedByMe}
          />
        }
        moveList={<MoveList moves={formattedMoves} />}
        spectators={<SpectatorPanel count={gameState.spectators} isSpectator={isSpectator} />}
        chat={<GameChat gameId={gameId} isSpectator={isSpectator} />}
      />

      {/* R3.25: Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={(userColor === "white" ? "w" : "b") as PieceColor}
          pieceSet={pieceSet}
          onSelect={handleSelectPromotion}
          onCancel={() => setPendingPromotion(null)}
        />
      )}

      {/* R3.49: Game End Modal */}
      <GameEndModal
        isOpen={isGameOverModalOpen && isGameOver}
        result={gameState.result || "Finished"}
        reason={gameState.resultReason}
        whitePlayer={gameState.white}
        blackPlayer={gameState.black}
        winnerColor={
          gameState.result === "1-0" || gameState.result === "white"
            ? "white"
            : gameState.result === "0-1" || gameState.result === "black"
              ? "black"
              : null
        }
        gameId={gameId}
        rematchStatus={rematchStatus || undefined}
        onRematch={handleRequestRematch}
        onClose={() => setIsGameOverModalOpen(false)}
        onReviewBoard={() => setIsGameOverModalOpen(false)}
      />

      {/* R3.47: Game Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        coordinates={coordinates}
        onToggleCoordinates={setCoordinates}
        showLegalMoves={showLegalMoves}
        onToggleLegalMoves={setShowLegalMoves}
        animations={animations}
        onToggleAnimations={setAnimations}
        pieceSet={pieceSet}
        onSelectPieceSet={setPieceSet}
      />
    </>
  );
}
