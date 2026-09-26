import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("E2E Real-Time: Three-Player Spectator Security (Step 90.2)", () => {
  type ClientSession = {
    sessionId: string;
    userId: string;
    role: "player" | "spectator";
    color?: "white" | "black";
    chess: Chess;
    receivedMoves: string[];
  };

  class SimulatedThreePartyRoom {
    serverChess = new Chess();
    whitePlayerId = "usr-white-1";
    blackPlayerId = "usr-black-2";
    clients: ClientSession[] = [];

    addClient(userId: string, role: "player" | "spectator", color?: "white" | "black"): ClientSession {
      const client: ClientSession = {
        sessionId: `sess-${userId}`,
        userId,
        role,
        color,
        chess: new Chess(),
        receivedMoves: [],
      };
      this.clients.push(client);
      return client;
    }

    handleMoveProposal(client: ClientSession, moveSan: string): { success: boolean; errorCode?: string } {
      // Step 87.2 & 90.2: Enforce strict spectator boundaries
      if (client.role === "spectator" || (client.userId !== this.whitePlayerId && client.userId !== this.blackPlayerId)) {
        return { success: false, errorCode: "SPECTATOR_MOVE_REJECTED" };
      }

      const activeColor = this.serverChess.turn() === "w" ? "white" : "black";
      if (client.color !== activeColor) {
        return { success: false, errorCode: "NOT_PLAYER_TURN" };
      }

      try {
        const moveRes = this.serverChess.move(moveSan);
        if (!moveRes) return { success: false, errorCode: "ILLEGAL_MOVE" };

        const currentFen = this.serverChess.fen();
        // Broadcast to all (players and spectators)
        for (const c of this.clients) {
          c.chess.load(currentFen);
          c.receivedMoves.push(moveRes.san);
        }

        return { success: true };
      } catch {
        return { success: false, errorCode: "ILLEGAL_MOVE" };
      }
    }
  }

  it("broadcasts player moves to spectator, but strictly blocks spectator move attempts", () => {
    const room = new SimulatedThreePartyRoom();
    const white = room.addClient("usr-white-1", "player", "white");
    const black = room.addClient("usr-black-2", "player", "black");
    const spectator = room.addClient("usr-spectator-3", "spectator");

    // 1. White plays e4
    const m1 = room.handleMoveProposal(white, "e4");
    assert.equal(m1.success, true);

    // Assert both black and spectator received the update
    assert.equal(black.receivedMoves.includes("e4"), true);
    assert.equal(spectator.receivedMoves.includes("e4"), true);
    assert.equal(spectator.chess.fen(), white.chess.fen());

    // 2. Spectator attempts move e5 on behalf of Black
    const spectatorAttempt = room.handleMoveProposal(spectator, "e5");
    assert.equal(spectatorAttempt.success, false);
    assert.equal(spectatorAttempt.errorCode, "SPECTATOR_MOVE_REJECTED");

    // Assert board state remains unmodified after spectator attempt
    assert.equal(room.serverChess.turn(), "b", "Still black's turn to move");
    assert.equal(spectator.receivedMoves.length, 1);

    // 3. Black plays actual move e5
    const blackMove = room.handleMoveProposal(black, "e5");
    assert.equal(blackMove.success, true);
    assert.equal(spectator.receivedMoves.length, 2);
    assert.deepEqual(spectator.receivedMoves, ["e4", "e5"]);
  });
});
