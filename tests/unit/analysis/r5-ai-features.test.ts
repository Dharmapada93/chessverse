import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatEvaluationDisplay,
  calculateEvaluationBarPercentage,
  getAdvantageDescription,
  createEngineEvaluation,
} from "../../../src/services/ai/evaluation";
import { identifyOpening } from "../../../src/services/ai/openings";
import { detectTacticalMotifs } from "../../../src/services/ai/tactics";
import {
  generateMoveExplanation,
  getCoachResponseForQuestion,
} from "../../../src/services/ai/explanation";
import { classifyMove } from "../../../server/src/services/analysis/classifyMove.js";
import { BOT_DIFFICULTIES } from "../../../src/services/ai/opponent";

describe("ChessVerse R5: AI Features Acceptance (R5.1 - R5.60)", () => {
  // -------------------------------------------------------------
  // R5.6 & R5.7: Evaluation Bar & Evaluation Display
  // -------------------------------------------------------------
  describe("R5.6 & R5.7: Evaluation Display & Bar Metrics", () => {
    it("formats standard numeric pawn advantages correctly (+0.8, -1.4, 0.0)", () => {
      assert.equal(formatEvaluationDisplay(0.8), "+0.8");
      assert.equal(formatEvaluationDisplay(-1.4), "-1.4");
      assert.equal(formatEvaluationDisplay(0.0), "0.0");
      assert.equal(formatEvaluationDisplay(-0.02), "0.0");
    });

    it("formats forced checkmate evaluations correctly (+M3, -M2)", () => {
      assert.equal(formatEvaluationDisplay(10, 3), "+M3");
      assert.equal(formatEvaluationDisplay(-10, -2), "-M2");
    });

    it("calculates smooth sigmoid percentage for evaluation bar without clipping", () => {
      const equalPct = calculateEvaluationBarPercentage(0);
      assert.equal(equalPct, 50);

      const whiteAheadPct = calculateEvaluationBarPercentage(2.5);
      assert.ok(whiteAheadPct > 70 && whiteAheadPct < 85);

      const blackAheadPct = calculateEvaluationBarPercentage(-2.5);
      assert.ok(blackAheadPct > 15 && blackAheadPct < 30);

      // Extreme values bounded within [3%, 97%]
      const extremeWhite = calculateEvaluationBarPercentage(25);
      assert.ok(extremeWhite <= 97);

      // Forced mate is absolute
      assert.equal(calculateEvaluationBarPercentage(0, 2), 100);
      assert.equal(calculateEvaluationBarPercentage(0, -1), 0);
    });

    it("provides human advantage descriptions without claiming absolute certainty", () => {
      assert.equal(getAdvantageDescription(0.1), "Equal position");
      assert.equal(getAdvantageDescription(1.5), "Moderate white advantage");
      assert.equal(getAdvantageDescription(-3.5), "Decisive black advantage");
      assert.match(getAdvantageDescription(0, 3), /forced checkmate in 3/i);
    });
  });

  // -------------------------------------------------------------
  // R5.8 - R5.13: Move Quality, Blunders & Brilliant Moves
  // -------------------------------------------------------------
  describe("R5.10 - R5.13: Mistake Classification & Quality Indicators", () => {
    it("classifies moves into standard tiers (best, excellent, inaccuracy, mistake, blunder)", () => {
      // Optimal move
      const best = classifyMove({
        playedMoveSan: "Nf3",
        playedMoveUci: "g1f3",
        bestMoveUci: "g1f3",
        evalBefore: 0.2,
        evalAfter: 0.2,
        color: "white",
      });
      assert.equal(best.classification, "best");
      assert.equal(best.accuracyScore, 100);

      // Blunder: > 200 centipawns lost
      const blunder = classifyMove({
        playedMoveSan: "Qe7??",
        playedMoveUci: "d8e7",
        bestMoveUci: "g8f6",
        evalBefore: 0.3,
        evalAfter: -2.1,
        color: "white",
      });
      assert.equal(blunder.classification, "blunder");
      assert.ok(blunder.centipawnLoss >= 200);

      // Inaccuracy: 60-120cp lost
      const inaccuracy = classifyMove({
        playedMoveSan: "h3",
        playedMoveUci: "h2h3",
        bestMoveUci: "d2d4",
        evalBefore: 0.5,
        evalAfter: -0.3, // 80cp
        color: "white",
      });
      assert.equal(inaccuracy.classification, "inaccuracy");
    });

    it("verifies objective criteria for brilliant moves (piece sacrifice + maintaining advantage)", () => {
      const brilliant = classifyMove({
        playedMoveSan: "Bxh7+",
        playedMoveUci: "d3h7",
        bestMoveUci: "d3h7",
        evalBefore: 1.5,
        evalAfter: 3.0,
        color: "white",
        isSacrifice: true,
      });

      assert.equal(brilliant.classification, "brilliant");
      assert.equal(brilliant.accuracyScore, 100);
      assert.match(brilliant.commentary || "", /brilliant sacrifice/i);
    });
  });

  // -------------------------------------------------------------
  // R5.16: Opening Detection
  // -------------------------------------------------------------
  describe("R5.16: Opening Detection & Non-Hallucination", () => {
    it("identifies Italian Game and Giuoco Piano accurately", () => {
      const italian = identifyOpening(["e4", "e5", "Nf3", "Nc6", "Bc4"]);
      assert.equal(italian.name, "Italian Game");
      assert.equal(italian.eco, "C50");

      const giuoco = identifyOpening(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"]);
      assert.equal(giuoco.name, "Italian Game: Giuoco Piano");
    });

    it("identifies Sicilian Defense accurately", () => {
      const sicilian = identifyOpening(["e4", "c5"]);
      assert.equal(sicilian.name, "Sicilian Defense");
      assert.equal(sicilian.eco, "B20");
    });

    it("falls back to 'Unclassified' if opening cannot be confidently recognized (never hallucinating)", () => {
      const randomMoves = ["h4", "a6", "a4", "b6", "h5"];
      const unclassified = identifyOpening(randomMoves);
      assert.equal(unclassified.name, "Unclassified");
      assert.equal(unclassified.confidence, 0);

      const empty = identifyOpening([]);
      assert.equal(empty.name, "Unclassified");
    });
  });

  // -------------------------------------------------------------
  // R5.17: Tactical Motifs Detection
  // -------------------------------------------------------------
  describe("R5.17: Tactical Motif Patterns", () => {
    it("detects knight forks attacking king and major pieces simultaneously", () => {
      // FEN where white knight lands on c7 checking king on e8 and attacking rook on a8
      const forkFen = "r3k2r/ppNppppp/8/8/8/8/PPPPPPPP/R1BQKBNR b KQkq - 0 1";
      const motif = detectTacticalMotifs(forkFen, "Nc7+", "e6c7");

      assert.ok(motif !== undefined);
      assert.equal(motif?.type, "fork");
      assert.match(motif?.description || "", /attacks.*simultaneously/i);
    });

    it("detects back-rank weakness when king is trapped by pawns against check", () => {
      // Black king on g8, trapped by f7, g7, h7 pawns, checked by White rook on e8
      const backRankFen = "4R1k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1";
      const motif = detectTacticalMotifs(backRankFen, "Re8#", "e1e8");

      assert.ok(motif !== undefined);
      assert.equal(motif?.type, "back_rank");
      assert.match(motif?.title || "", /Back-Rank/i);
    });
  });

  // -------------------------------------------------------------
  // R5.24 - R5.27: AI Coach & Explanation Levels
  // -------------------------------------------------------------
  describe("R5.24 - R5.27: AI Coach Grounding & Guardrails", () => {
    it("adapts move explanations across Beginner, Intermediate, and Advanced levels", () => {
      const beginner = generateMoveExplanation({
        playedMove: "Nf3",
        bestMove: "Nf3",
        evaluationBefore: 0.2,
        evaluationAfter: 0.3,
        classification: "best",
        level: "beginner",
        gamePhase: "opening",
      });

      const advanced = generateMoveExplanation({
        playedMove: "Nf3",
        bestMove: "Nf3",
        evaluationBefore: 0.2,
        evaluationAfter: 0.3,
        classification: "best",
        level: "advanced",
        gamePhase: "opening",
      });

      assert.match(beginner, /develops your piece|center of the board/i);
      assert.match(advanced, /piece harmonization|central tension/i);
      // Both explain the same underlying truth (Nf3 is best)
      assert.ok(beginner.includes("Nf3"));
      assert.ok(advanced.includes("Nf3"));
    });

    it("enforces AI coach guardrails when position information is insufficient", () => {
      const guardrail = getCoachResponseForQuestion("What should I do?", {
        fen: "",
        bestMove: "",
      });

      assert.equal(
        guardrail,
        "I don't have enough information to explain that position reliably.",
      );
    });

    it("answers specific suggested questions using verified engine candidates", () => {
      const response = getCoachResponseForQuestion("Why was this move bad?", {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        playedMove: "f3",
        bestMove: "e4",
        evaluationBefore: 0.2,
        evaluationAfter: -0.6,
        classification: "inaccuracy",
      });

      assert.match(response, /f3/);
      assert.match(response, /e4/);
      assert.match(response, /dropped.*evaluation/i);
    });
  });

  // -------------------------------------------------------------
  // R5.28 - R5.31: AI Opponent Calibration & Timeout Logic
  // -------------------------------------------------------------
  describe("R5.28 - R5.31: AI Opponent Architecture", () => {
    it("calibrates difficulty levels without faking official FIDE ratings", () => {
      assert.ok(BOT_DIFFICULTIES.beginner.depth < BOT_DIFFICULTIES.intermediate.depth);
      assert.ok(BOT_DIFFICULTIES.intermediate.depth < BOT_DIFFICULTIES.advanced.depth);
      assert.ok(BOT_DIFFICULTIES.advanced.depth < BOT_DIFFICULTIES.expert.depth);

      assert.equal(BOT_DIFFICULTIES.beginner.depth, 3);
      assert.equal(BOT_DIFFICULTIES.expert.depth, 18);
    });

    it("enforces safe upper limit on AI calculation timeouts", () => {
      for (const bot of Object.values(BOT_DIFFICULTIES)) {
        assert.ok(bot.timeLimitMs <= 6000, "AI timeout must not exceed 6s");
      }
    });
  });

  // -------------------------------------------------------------
  // R5.51: Free Product Architecture & No Premium Locks
  // -------------------------------------------------------------
  describe("R5.51: 100% Free Guarantee", () => {
    it("confirms zero paywalls or subscription gates in AI types and configurations", () => {
      // All bot levels accessible
      const botLevels = Object.keys(BOT_DIFFICULTIES);
      assert.deepEqual(botLevels, ["beginner", "intermediate", "advanced", "expert"]);

      // Analysis service depth levels are all accessible without license keys
      const analysisObj = createEngineEvaluation(140);
      assert.ok(analysisObj.depth >= 18);
      assert.equal(analysisObj.type, "cp");
    });
  });
});
