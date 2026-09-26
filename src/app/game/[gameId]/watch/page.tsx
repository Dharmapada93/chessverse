"use client";

import { use } from "react";
import GameRoom from "@/views/GameRoom";

export default function SpectatorPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.gameId;

  return <GameRoom gameId={gameId} isSpectatorOnly={true} />;
}
