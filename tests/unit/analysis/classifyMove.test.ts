import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyMove } from "../../../server/src/services/analysis/classifyMove.js";

describe("AI Game Analysis & Move Classification", () => {
  it("identifies best moves correctly with 100% accuracy score", () => {
    const res = classifyMove({
      playedMoveSan: "Nf3",
      playedMoveUci: "g1f3",
      bestMoveUci: "g1f3",
      evalBefore: 0.1,
      evalAfter: 0.15,
      color: "white",
    });

    assert.equal(res.classification, "best");
    assert.equal(res.centipawnLoss, 0);
    assert.equal(res.accuracyScore, 100);
  });

  it("identifies brilliant moves when a sacrifice is the engine best move with decisive advantage", () => {
    const res = classifyMove({
      playedMoveSan: "Bxh7+",
      playedMoveUci: "d3h7",
      bestMoveUci: "d3h7",
      evalBefore: 1.5,
      evalAfter: 3.2,
      color: "white",
      isSacrifice: true,
    });

    assert.equal(res.classification, "brilliant");
    assert.equal(res.accuracyScore, 100);
    assert.match(res.commentary || "", /brilliant sacrifice/i);
  });

  it("classifies minor inaccuracies when losing 60-120 centipawns", () => {
    const res = classifyMove({
      playedMoveSan: "a3",
      playedMoveUci: "a2a3",
      bestMoveUci: "d2d4",
      evalBefore: 0.4,
      evalAfter: -0.4, // lost 0.8 pawns (80 centipawns)
      color: "white",
    });

    assert.equal(res.classification, "inaccuracy");
    assert.ok(res.centipawnLoss >= 60 && res.centipawnLoss <= 120);
    assert.ok(res.accuracyScore < 100);
  });

  it("classifies blunders when evaluation drops drastically (> 200 centipawns)", () => {
    const res = classifyMove({
      playedMoveSan: "Qe2??",
      playedMoveUci: "d1e2",
      bestMoveUci: "e1g1",
      evalBefore: 1.0,
      evalAfter: -2.5, // lost 3.5 pawns (350 centipawns)
      color: "white",
    });

    assert.equal(res.classification, "blunder");
    assert.ok(res.centipawnLoss >= 200);
    assert.ok(res.accuracyScore < 20);
  });

  it("identifies missed opportunity when squandering a +2.0 winning advantage", () => {
    const res = classifyMove({
      playedMoveSan: "Kh1",
      playedMoveUci: "g1h1",
      bestMoveUci: "Qxf7#",
      evalBefore: 3.5,
      evalAfter: 0.2, // lost 330cp from a completely winning position
      color: "white",
    });

    assert.equal(res.classification, "missed_opportunity");
    assert.match(res.commentary || "", /missed opportunity/i);
  });

  it("properly accounts for black player evaluation perspective", () => {
    // For black, evalBefore: -1.0 means black was +1.0 ahead.
    // evalAfter: -1.0 means black is still +1.0 ahead.
    const res = classifyMove({
      playedMoveSan: "c5",
      playedMoveUci: "c7c5",
      bestMoveUci: "c7c5",
      evalBefore: -1.0,
      evalAfter: -1.0,
      color: "black",
    });

    assert.equal(res.classification, "best");
    assert.equal(res.centipawnLoss, 0);
  });
});
