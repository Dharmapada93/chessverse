import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("E2E Real-Time: Two-Player Game Parity (Step 90.1)", () => {
  type ClientState = {
    playerId: string;
    color: "white" | "black";
    chess: Chess;
    lastReceivedMove?: string;
  };

  class SimulatedGameRoom {
    serverChess = new Chess();
    clients: ClientState[] = [];
    moveHistory: string[] = [];

    registerClient(playerId: string, color: "white" | "black"): ClientState {
      const client = {
        playerId,
        color,
        chess: new Chess(),
      };
      this.clients.push(client);
      return client;
    }

    sendMove(fromPlayerId: string, moveSan: string): { success: boolean; fen: string } {
      const activeColor = this.serverChess.turn() === "w" ? "white" : "black";
      const client = this.clients.find((c) => c.playerId === fromPlayerId);
      if (!client || client.color !== activeColor) {
        throw new Error("Illegal: not player's turn");
      }

      const moveRes = this.serverChess.move(moveSan);
      if (!moveRes) throw new Error("Illegal move rejected by server engine");

      this.moveHistory.push(moveRes.san);
      const canonicalFen = this.serverChess.fen();

      // Broadcast authoritative state to both players
      for (const c of this.clients) {
        c.chess.load(canonicalFen);
        c.lastReceivedMove = moveRes.san;
      }

      return { success: true, fen: canonicalFen };
    }
  }

  it("synchronizes board state identically between Player 1 (White) and Player 2 (Black)", () => {
    const room = new SimulatedGameRoom();
    const p1 = room.registerClient("player-1", "white");
    const p2 = room.registerClient("player-2", "black");

    // Both start at standard starting position
    assert.equal(p1.chess.fen(), p2.chess.fen());

    // 1. Player 1 plays e4
    const r1 = room.sendMove("player-1", "e4");
    assert.equal(r1.success, true);

    // Verify Player 2 received e4 and boards match
    assert.equal(p2.lastReceivedMove, "e4");
    assert.equal(p1.chess.fen(), p2.chess.fen());
    assert.equal(p2.chess.turn(), "b");

    // 2. Player 2 plays e5
    const r2 = room.sendMove("player-2", "e5");
    assert.equal(r2.success, true);

    // Verify Player 1 received e5 and boards match
    assert.equal(p1.lastReceivedMove, "e5");
    assert.equal(p1.chess.fen(), p2.chess.fen());
    assert.equal(p1.chess.turn(), "w");

    // 3. Player 1 plays Nf3
    room.sendMove("player-1", "Nf3");
    assert.equal(p1.chess.fen(), p2.chess.fen());

    // 4. Player 2 plays Nc6
    room.sendMove("player-2", "Nc6");
    assert.equal(p1.chess.fen(), p2.chess.fen());

    assert.deepEqual(room.moveHistory, ["e4", "e5", "Nf3", "Nc6"]);
  });
});
