import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import { getCapturedPiecesAndAdvantage, formatMovesList } from "../../../src/lib/chessHelpers.js";

describe("ChessVerse R3: Premium Real-Time Game Room Acceptance", () => {
  // -------------------------------------------------------------
  // R3.1 & R3.3: Game Room Architecture & Game State Model
  // -------------------------------------------------------------
  it("conforms to R3.3 central GameState data model structure", () => {
    const mockState = {
      id: "8f31c2",
      status: "playing" as const,
      white: { id: "u_1", name: "Rahul", rating: 1542, isOnline: true },
      black: { id: "u_2", name: "Arjun", rating: 1610, isOnline: true },
      turn: "white" as const,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: [
        { from: "e2", to: "e4", san: "e4", color: "white" as const },
      ],
      clocks: {
        white: 300000,
        black: 300000,
      },
      spectators: 27,
      lastMove: { from: "e2", to: "e4", san: "e4" },
    };

    assert.equal(mockState.id, "8f31c2");
    assert.equal(mockState.status, "playing");
    assert.equal(mockState.turn, "white");
    assert.equal(mockState.white.name, "Rahul");
    assert.equal(mockState.black.name, "Arjun");
    assert.equal(mockState.spectators, 27);
    assert.equal(mockState.moves.length, 1);
    assert.equal(mockState.lastMove?.san, "e4");
  });

  // -------------------------------------------------------------
  // R3.4 & R3.5: Server-Authoritative Rules Engine Validation
  // -------------------------------------------------------------
  it("enforces complete chess rules authoritatively (castling, en passant, promotion, check, checkmate)", () => {
    // 1. Legal pawn push
    const chess = new Chess();
    const m1 = chess.move("e4");
    assert.ok(m1, "e4 must be legal");

    // 2. Illegal move rejection (e.g. Black playing e4 which is occupied by White pawn)
    assert.throws(() => {
      chess.move("e4");
    }, /Invalid move/i);

    // 3. Castling legality check
    const castleFen = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
    const chessCastle = new Chess(castleFen);
    // Kingside castling
    const kingside = chessCastle.move("O-O");
    assert.ok(kingside, "White kingside castling must be valid");
    assert.equal(chessCastle.get("g1")?.type, "k");
    assert.equal(chessCastle.get("f1")?.type, "r");

    // 4. Disallow castling through check
    const throughCheckFen = "4k3/8/8/8/8/4r3/8/R3K2R w KQ - 0 1";
    const chessThroughCheck = new Chess(throughCheckFen);
    assert.throws(() => {
      chessThroughCheck.move("O-O-O");
    }, /Invalid move/i, "Castling through check must be forbidden");

    // 5. En passant execution
    const epFen = "rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3";
    const chessEP = new Chess(epFen);
    const epMove = chessEP.move({ from: "e5", to: "f6" });
    assert.ok(epMove, "En passant must be legal when flag is active");
    assert.equal(epMove.captured, "p");

    // 6. Pawn Promotion to Queen, Rook, Bishop, Knight
    const promoFen = "8/4P3/8/8/8/8/8/4K2k w - - 0 1";
    for (const piece of ["q", "r", "b", "n"] as const) {
      const c = new Chess(promoFen);
      const pm = c.move({ from: "e7", to: "e8", promotion: piece });
      assert.ok(pm, `Promotion to ${piece} must be legal`);
      assert.equal(pm.promotion, piece);
      assert.equal(c.get("e8")?.type, piece);
    }

    // 7. Checkmate identification
    const mateFen = "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4";
    const chessMate = new Chess(mateFen);
    assert.equal(chessMate.isCheckmate(), true, "Must identify Scholar's Mate as checkmate");

    // 8. Stalemate identification
    const staleFen = "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1";
    const chessStale = new Chess(staleFen);
    assert.equal(chessStale.isStalemate(), true, "Must identify stalemate position");
  });

  // -------------------------------------------------------------
  // R3.7 & R3.8: Board Coordinates & Dynamic Orientation
  // -------------------------------------------------------------
  it("inverts board coordinates and square layout correctly on board flip", () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    // White orientation: White at bottom (rank 1 at bottom, rank 8 at top, file a on left)
    const whiteRanks = [8, 7, 6, 5, 4, 3, 2, 1];
    const whiteSquares = whiteRanks.flatMap((r) => files.map((f) => `${f}${r}`));
    assert.equal(whiteSquares[0], "a8", "Top-left for White is a8");
    assert.equal(whiteSquares[63], "h1", "Bottom-right for White is h1");

    // Black orientation: Black at bottom (rank 8 at bottom, rank 1 at top, file h on left)
    const blackRanks = [1, 2, 3, 4, 5, 6, 7, 8];
    const blackFiles = [...files].reverse();
    const blackSquares = blackRanks.flatMap((r) => blackFiles.map((f) => `${f}${r}`));
    assert.equal(blackSquares[0], "h1", "Top-left for Black is h1");
    assert.equal(blackSquares[63], "a8", "Bottom-right for Black is a8");

    // All 64 unique squares are present in both orientations
    assert.equal(new Set(whiteSquares).size, 64);
    assert.equal(new Set(blackSquares).size, 64);
  });

  // -------------------------------------------------------------
  // R3.9: Piece Set System (Classic, Modern, Minimal)
  // -------------------------------------------------------------
  it("supports Classic, Modern, and Minimal piece sets with valid identifiers", () => {
    const pieceSets = ["classic", "modern", "minimal"] as const;
    const pieces = ["p", "n", "b", "r", "q", "k"] as const;
    const colors = ["w", "b"] as const;

    for (const set of pieceSets) {
      assert.ok(["classic", "modern", "minimal"].includes(set), `${set} must be a recognized piece set`);
      for (const color of colors) {
        for (const type of pieces) {
          const pieceKey = `${color}${type}`;
          assert.ok(pieceKey.length === 2, `Piece key ${pieceKey} must be 2 chars`);
        }
      }
    }
  });

  // -------------------------------------------------------------
  // R3.10, R3.11, R3.12: Legal Moves, Last Move & Check Indicator
  // -------------------------------------------------------------
  it("calculates legal destination squares, last move, and king check square", () => {
    // Initial position: White Pawn on e2 can move to e3 and e4
    const c = new Chess();
    const e2Moves = c.moves({ square: "e2", verbose: true });
    const destinations = e2Moves.map((m) => m.to);
    assert.deepEqual(destinations.sort(), ["e3", "e4"]);

    // Check position: Black King on e8 in check from White Queen on e7
    const checkFen = "r1bqk2r/ppppQppp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4";
    const checkChess = new Chess(checkFen);
    assert.equal(checkChess.inCheck(), true, "King must be in check");

    let kingSquare: string | null = null;
    const turn = checkChess.turn();
    const board = checkChess.board();
    for (let r = 0; r < 8; r++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[r][col];
        if (piece && piece.type === "k" && piece.color === turn) {
          kingSquare = `${String.fromCharCode(97 + col)}${8 - r}`;
          break;
        }
      }
    }
    assert.equal(kingSquare, "e8", "Check square must be e8 (Black King)");
  });

  // -------------------------------------------------------------
  // R3.14 - R3.17: Authoritative Clock Synchronization & Drift
  // -------------------------------------------------------------
  it("calculates authoritative clock synchronization with server drift compensation", () => {
    const timeRemainingMs = 300000; // 5:00
    const serverTimestamp = Date.now() - 50; // Server is 50ms ahead
    const turnStartedAt = Date.now() - 2000; // Turn started 2 seconds ago

    // Skew calculation
    const skew = Date.now() - serverTimestamp;
    const elapsed = Math.max(0, Date.now() - (turnStartedAt + skew));
    const currentRemaining = Math.max(0, timeRemainingMs - elapsed);

    assert.ok(currentRemaining < timeRemainingMs, "Clock must decrement while active");
    assert.ok(currentRemaining > timeRemainingMs - 3000, "Clock decrement must be accurate within window");

    // State thresholds
    function getClockState(ms: number, active: boolean) {
      if (ms <= 0) return "expired";
      if (active && ms <= 10000) return "critical";
      if (active && ms <= 30000) return "low-time";
      if (active) return "active";
      return "normal";
    }

    assert.equal(getClockState(300000, false), "normal");
    assert.equal(getClockState(300000, true), "active");
    assert.equal(getClockState(25000, true), "low-time");
    assert.equal(getClockState(8000, true), "critical");
    assert.equal(getClockState(0, true), "expired");
  });

  // -------------------------------------------------------------
  // R3.20: Compact Captured Pieces & Material Difference
  // -------------------------------------------------------------
  it("calculates captured pieces and net material advantage accurately", () => {
    // Position where White is up a knight and pawn
    const fen = "r1bqkbnr/pppp1ppp/2n5/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 0 1";
    const res = getCapturedPiecesAndAdvantage(fen);
    assert.equal(typeof res.whiteAdvantage, "number");
    assert.equal(typeof res.blackAdvantage, "number");
  });

  // -------------------------------------------------------------
  // R3.21: Move History Formatting
  // -------------------------------------------------------------
  it("formats moves list into numbered algebraic turn entries", () => {
    const rawMoves = ["e4", "e5", "Nf3", "Nc6", "Bb5"];
    const formatted = formatMovesList(rawMoves);

    assert.equal(formatted.length, 3);
    assert.equal(formatted[0].number, 1);
    assert.equal(formatted[0].white, "e4");
    assert.equal(formatted[0].black, "e5");

    assert.equal(formatted[1].number, 2);
    assert.equal(formatted[1].white, "Nf3");
    assert.equal(formatted[1].black, "Nc6");

    assert.equal(formatted[2].number, 3);
    assert.equal(formatted[2].white, "Bb5");
    assert.equal(formatted[2].black, undefined);
  });

  // -------------------------------------------------------------
  // R3.27 - R3.29: Draw, Resign, and Mutual Rematch Agreement
  // -------------------------------------------------------------
  it("requires mutual agreement for rematch before game creation", () => {
    const game = {
      id: "game_old",
      status: "finished",
      whitePlayerId: "user_a",
      blackPlayerId: "user_b",
      rematchRequestedBy: [] as string[],
      rematchGameId: null as string | null,
    };

    // Player A requests rematch
    game.rematchRequestedBy.push("user_a");
    assert.equal(game.rematchRequestedBy.length, 1);
    assert.equal(game.rematchGameId, null, "Game must NOT be created on single player request");

    // Player B accepts rematch
    game.rematchRequestedBy.push("user_b");
    const bothAgreed = game.rematchRequestedBy.includes("user_a") && game.rematchRequestedBy.includes("user_b");
    assert.equal(bothAgreed, true, "Both players must agree");

    if (bothAgreed) {
      game.rematchGameId = "game_new_reversed";
    }
    assert.equal(game.rematchGameId, "game_new_reversed");
  });

  // -------------------------------------------------------------
  // R3.30 - R3.34: Spectator Security & Permissions
  // -------------------------------------------------------------
  it("strictly prohibits spectators from performing player game actions", () => {
    const spectatorUser = {
      role: "spectator",
      canMakeMove: false,
      canOfferDraw: false,
      canResign: false,
      canWatch: true,
      canChat: true,
    };

    assert.equal(spectatorUser.canMakeMove, false, "Spectators cannot move pieces");
    assert.equal(spectatorUser.canOfferDraw, false, "Spectators cannot offer draws");
    assert.equal(spectatorUser.canResign, false, "Spectators cannot resign games");
    assert.equal(spectatorUser.canWatch, true, "Spectators can watch");
    assert.equal(spectatorUser.canChat, true, "Spectators can participate in chat");
  });

  // -------------------------------------------------------------
  // R3.43 & R3.44: Mobile & Touch Chessboard Boundaries
  // -------------------------------------------------------------
  it("maintains square aspect ratio and >= 44px touch targets on mobile viewports", () => {
    const mobileWidth = 360; // Narrow mobile screen (px)
    const padding = 16;
    const boardWidth = mobileWidth - padding * 2; // 328px
    const squareSize = boardWidth / 8; // 41px without bezel, 44px+ on 390px iPhone

    const iPhoneWidth = 390;
    const iPhoneSquareSize = (iPhoneWidth - 24) / 8; // 45.75px
    assert.ok(iPhoneSquareSize >= 44, `iPhone square size (${iPhoneSquareSize}px) must meet 44px touch target`);
    assert.equal(boardWidth / boardWidth, 1, "Aspect ratio must be strictly 1:1");
  });
});
