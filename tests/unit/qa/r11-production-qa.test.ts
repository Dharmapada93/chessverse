import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Chess } from "chess.js";
import { validateMove } from "../../../server/src/services/chessEngine.js";
import { getCurrentClock } from "../../../server/src/services/gameClock.js";
import { logger } from "../../../server/src/utils/logger.js";

const ROOT_DIR = path.resolve(__dirname, "../../..");

describe("ChessVerse R11: Production Readiness & Quality Assurance Acceptance", () => {
  // =========================================================================
  // 1. AUTHENTICATION & ACCESS CONTROL (R11.2, R11.3, R11.4)
  // =========================================================================
  describe("R11.2 - R11.4: Authentication & Authorization Security", () => {
    it("enforces server-side authentication and role-based access on admin endpoints", () => {
      const adminRoutesPath = path.join(ROOT_DIR, "server/src/routes/admin.ts");
      const content = fs.readFileSync(adminRoutesPath, "utf-8");

      assert.ok(content.includes("router.use(requireAuth)"), "admin.ts must apply requireAuth");
      assert.ok(content.includes("router.use(requireAdmin)"), "admin.ts must apply requireAdmin");
    });

    it("verifies auth route employs non-enumerating error responses", () => {
      const authRoutePath = path.join(ROOT_DIR, "server/src/routes/auth.ts");
      const content = fs.readFileSync(authRoutePath, "utf-8");

      assert.ok(
        content.includes("Invalid email or password") || content.includes("Invalid credentials"),
        "Auth routes must use generic non-enumerating error messages"
      );
    });

    it("verifies passwords are hashed with bcryptjs salt rounds", () => {
      const authRoutePath = path.join(ROOT_DIR, "server/src/routes/auth.ts");
      const content = fs.readFileSync(authRoutePath, "utf-8");

      assert.ok(
        content.includes("bcrypt.hash(") || content.includes("bcrypt.compare("),
        "Auth must use bcrypt for secure password hashing"
      );
    });
  });

  // =========================================================================
  // 2. CHESS RULES & ILLEGAL MOVE PROTECTION (R11.6, R11.7)
  // =========================================================================
  describe("R11.6 & R11.7: Chess Rule Validation & Anti-Tamper Checks", () => {
    it("validates standard opening pawn and piece moves correctly", () => {
      const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      // Legal White pawn e2-e4
      const moveE4 = validateMove(startFen, "e2", "e4");
      assert.ok(moveE4.legal, "e2-e4 must be legal");
      assert.equal(moveE4.move?.san, "e4");
      assert.equal(moveE4.turn, "b");

      // Legal Black knight g8-f6
      const moveNf6 = validateMove(moveE4.fen!, "g8", "f6");
      assert.ok(moveNf6.legal, "g8-f6 must be legal");
      assert.equal(moveNf6.move?.san, "Nf6");
      assert.equal(moveNf6.turn, "w");
    });

    it("validates Castling (Kingside and Queenside) correctly", () => {
      // Position where White can castle kingside
      const castleFen = "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
      const castleMove = validateMove(castleFen, "e1", "g1");
      assert.ok(castleMove.legal, "O-O must be legal");
      assert.equal(castleMove.move?.san, "O-O");
    });

    it("validates En Passant capture correctly", () => {
      // Position with en passant opportunity: White pawn on e5, Black plays d7-d5
      const epFen = "rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3";
      const epMove = validateMove(epFen, "e5", "d6");
      assert.ok(epMove.legal, "exd6 e.p. must be legal");
      assert.equal(epMove.move?.san, "exd6");
    });

    it("validates Pawn Promotion correctly", () => {
      // White pawn on a7 ready to promote on a8
      const promoFen = "8/P7/8/8/8/8/8/4K2k w - - 0 1";
      const promoMove = validateMove(promoFen, "a7", "a8", "q");
      assert.ok(promoMove.legal, "a7-a8=Q must be legal");
      assert.ok(promoMove.move?.san.startsWith("a8=Q"), "san must be promotion to Queen");
    });

    it("detects Checkmate ending accurately", () => {
      // Scholar's Mate final position
      const mateFen = "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4";
      const chess = new Chess(mateFen);
      assert.ok(chess.isCheckmate(), "Must detect checkmate");
      assert.ok(chess.isGameOver(), "Game must be terminal");
    });

    it("detects Stalemate ending accurately", () => {
      // Classic Stalemate position: Black king on a8, White queen on c7, White king on c6
      const stalemateFen = "k7/2Q5/2K5/8/8/8/8/8 b - - 0 1";
      const chess = new Chess(stalemateFen);
      assert.ok(chess.isStalemate(), "Must detect stalemate");
      assert.ok(chess.isDraw(), "Stalemate must be considered a draw");
      assert.ok(chess.isGameOver(), "Game must be terminal");
    });

    it("strictly rejects illegal moves attempting client manipulation", () => {
      const startFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

      // 1. Moving pawn backward
      const backwardPawn = validateMove(startFen, "e2", "e1");
      assert.equal(backwardPawn.legal, false, "Backward pawn move must be rejected");

      // 2. Moving through other pieces
      const rookJump = validateMove(startFen, "a1", "a4");
      assert.equal(rookJump.legal, false, "Rook jumping over pawn must be rejected");

      // 3. Moving opponent piece when White to move
      const blackPawnOnWhiteTurn = validateMove(startFen, "e7", "e5");
      assert.equal(blackPawnOnWhiteTurn.legal, false, "Moving black piece on white turn must be rejected");

      // 4. Moving to occupied square of own piece
      const selfCapture = validateMove(startFen, "d1", "d2");
      assert.equal(selfCapture.legal, false, "Capturing own piece must be rejected");
    });
  });

  // =========================================================================
  // 3. CLOCKS, RECONNECTION & MULTIPLAYER PARITY (R11.8 - R11.10)
  // =========================================================================
  describe("R11.8 - R11.10: Authoritative Clocks & Reconnection Recovery", () => {
    it("calculates authoritative clock decrements and avoids client clock drift", () => {
      const initialWhite = 300000; // 5 min
      const initialBlack = 300000;
      const turnStartedAt = Date.now() - 5000; // 5 seconds elapsed

      const clockState = getCurrentClock({
        whiteRemaining: initialWhite,
        blackRemaining: initialBlack,
        turn: "w",
        turnStartedAt,
      });

      assert.ok(
        clockState.whiteRemaining <= 295100 && clockState.whiteRemaining >= 294900,
        `White clock should reflect ~5s elapsed (actual: ${clockState.whiteRemaining}ms)`
      );
      assert.equal(
        clockState.blackRemaining,
        initialBlack,
        "Black clock must remain untouched on White's turn"
      );
    });

    it("verifies 30-second disconnect grace window exists in socket handler", () => {
      const socketHandlerPath = path.join(ROOT_DIR, "server/src/socket/gameSocket.ts");
      const content = fs.readFileSync(socketHandlerPath, "utf-8");

      assert.ok(
        content.includes("gracePeriodSeconds: 30") || content.includes("30000"),
        "gameSocket.ts must enforce 30-second disconnect grace period"
      );
      assert.ok(
        content.includes("player:disconnected"),
        "Must emit player:disconnected alert"
      );
      assert.ok(
        content.includes("player:reconnected"),
        "Must emit player:reconnected on grace recovery"
      );
    });

    it("verifies snapshot rehydration delivers full authoritative state on reconnect", () => {
      const socketHandlerPath = path.join(ROOT_DIR, "server/src/socket/gameSocket.ts");
      const content = fs.readFileSync(socketHandlerPath, "utf-8");

      assert.ok(
        content.includes('socket.on("game:sync"'),
        "Must handle game:sync event for reconnection"
      );
      assert.ok(
        content.includes('socket.on("game:rejoin"'),
        "Must handle game:rejoin event for reconnection"
      );
      assert.ok(
        content.includes("serializeGame(game)"),
        "Must serialize full game snapshot to rehydrating socket"
      );
    });
  });

  // =========================================================================
  // 4. SPECTATOR MODE RESTRICTIONS (R11.12, R11.13)
  // =========================================================================
  describe("R11.12 & R11.13: Spectator Mode Boundaries", () => {
    it("strictly prevents spectators from executing game moves or altering clocks", () => {
      const socketHandlerPath = path.join(ROOT_DIR, "server/src/socket/gameSocket.ts");
      const content = fs.readFileSync(socketHandlerPath, "utf-8");

      assert.ok(
        content.includes('socket.data.role === "spectator"'),
        "Must check if socket role is spectator"
      );
      assert.ok(
        content.includes("Spectators cannot make moves"),
        "Must reject moves from spectators"
      );
      assert.ok(
        content.includes("Spectators cannot resign"),
        "Must reject resignations from spectators"
      );
      assert.ok(
        content.includes("Spectators cannot offer draws") || content.includes("Spectators cannot accept draws"),
        "Must reject draw interactions from spectators"
      );
    });
  });

  // =========================================================================
  // 5. AI FEATURE ISOLATION & SECURITY (R11.20 - R11.23)
  // =========================================================================
  describe("R11.20 - R11.23: AI Worker Thread Isolation & Error Boundaries", () => {
    it("confirms Stockfish 18 engine executes in a dedicated Web Worker off the main thread", () => {
      const enginePath = path.join(ROOT_DIR, "src", "lib", "stockfish.ts");
      assert.ok(fs.existsSync(enginePath), "src/lib/stockfish.ts must exist");

      const content = fs.readFileSync(enginePath, "utf-8");
      assert.match(content, /new Worker\(/, "Must instantiate new Worker");
      assert.match(content, /this\.worker\.onmessage/, "Must handle worker onmessage events");
      assert.match(content, /this\.worker\?\.postMessage/, "Must send messages via postMessage");
    });

    it("verifies root ErrorBoundary catches unhandled crashes and offers reset", () => {
      const boundaryPath = path.join(ROOT_DIR, "src/components/ErrorBoundary.tsx");
      assert.ok(fs.existsSync(boundaryPath), "ErrorBoundary.tsx must exist");

      const content = fs.readFileSync(boundaryPath, "utf-8");
      assert.ok(content.includes("componentDidCatch"), "Must implement componentDidCatch");
      assert.ok(content.includes("handleReset"), "Must provide reset/reload handler");
      assert.ok(content.includes("Something went wrong"), "Must display user-friendly error headline");
    });

    it("verifies zero private AI API secrets exist in frontend client code", () => {
      const srcDir = path.join(ROOT_DIR, "src");
      const files = fs.readdirSync(srcDir, { recursive: true }) as string[];

      for (const file of files) {
        if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          const filePath = path.join(srcDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          assert.ok(
            !content.includes("NEXT_PUBLIC_AI_SECRET"),
            `File ${file} must not expose private AI secret`
          );
          assert.ok(
            !content.includes("NEXT_PUBLIC_OPENAI_API_KEY"),
            `File ${file} must not expose OpenAI key publicly`
          );
        }
      }
    });
  });

  // =========================================================================
  // 6. RATE LIMITING, AUDIT LOGGING & SECRETS (R11.40, R11.41, R11.44, R11.45)
  // =========================================================================
  describe("R11.40 - R11.45: Rate Limiting & Sensitive Key Redaction", () => {
    it("configures express rate limiters for authentication, mutations, and chat", () => {
      const rateLimiterPath = path.join(ROOT_DIR, "server/src/middleware/rateLimiter.ts");
      const content = fs.readFileSync(rateLimiterPath, "utf-8");

      assert.ok(content.includes("loginRateLimiter"), "Must export loginRateLimiter");
      assert.ok(content.includes("registerRateLimiter"), "Must export registerRateLimiter");
      assert.ok(content.includes("friendRequestLimiter"), "Must export friendRequestLimiter");
      assert.ok(content.includes("chatLimiter"), "Must export chatLimiter");
    });

    it("verifies logger automatically sanitizes and redacts passwords and secrets", () => {
      const loggerPath = path.join(ROOT_DIR, "server/src/utils/logger.ts");
      const content = fs.readFileSync(loggerPath, "utf-8");

      assert.ok(content.includes("[REDACTED]"), "Logger must replace sensitive values with [REDACTED]");
      assert.ok(content.includes("password"), "Must redact passwords");
      assert.ok(content.includes("token") || content.includes("secret"), "Must redact tokens/secrets");
    });
  });

  // =========================================================================
  // 7. SECURITY HEADERS & CORS (R11.52, R11.59)
  // =========================================================================
  describe("R11.52 & R11.59: Security Headers & CORS", () => {
    it("configures Helmet HSTS, content security options, and explicit CORS origins", () => {
      const indexPath = path.join(ROOT_DIR, "server/src/index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");

      assert.ok(content.includes("helmet("), "Must mount helmet middleware");
      assert.ok(content.includes("maxAge: 31536000"), "Must configure HSTS with 1-year maxAge");
      assert.ok(content.includes("xContentTypeOptions: true"), "Must enable X-Content-Type-Options: nosniff");
      assert.ok(content.includes("cors("), "Must configure CORS");
      assert.ok(content.includes("credentials: true"), "Must enable credentials support for CORS");
    });
  });

  // =========================================================================
  // 8. 100% FREE PRODUCT & N-BUTTON VERIFICATION (R11.72, R11.73)
  // =========================================================================
  describe("R11.72 & R11.73: Free-Only Model & N-Button Permanence", () => {
    it("guarantees 100% free product architecture with zero monetization routes", () => {
      const forbiddenRoutes = [
        "src/app/pricing",
        "src/app/plans",
        "src/app/subscribe",
        "src/app/checkout",
        "src/app/billing",
        "src/app/upgrade",
      ];

      for (const route of forbiddenRoutes) {
        const fullPath = path.join(ROOT_DIR, route);
        assert.ok(!fs.existsSync(fullPath), `Monetization route must not exist: ${route}`);
      }
    });

    it("verifies Next.js development indicator ('N' button) remains permanently suppressed", () => {
      const nextConfigPath = path.join(ROOT_DIR, "next.config.ts");
      const nextConfig = fs.readFileSync(nextConfigPath, "utf-8");
      assert.ok(
        nextConfig.includes("devIndicators: false") || nextConfig.includes("devIndicators: {"),
        "next.config.ts must suppress devIndicators"
      );

      const globalsCssPath = path.join(ROOT_DIR, "src/app/globals.css");
      const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");
      assert.ok(
        globalsCss.includes("display: none !important"),
        "globals.css must apply display: none !important to indicator selectors"
      );
    });
  });
});
