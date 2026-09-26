import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateExpectedScore,
  calculateRatingChange,
  calculateMatchRatings,
  RATING_FLOOR,
} from "../../../server/src/lib/elo.js";

describe("Elo Rating System", () => {
  it("computes equal expected scores for equal ratings", () => {
    const expWhite = calculateExpectedScore(1500, 1500);
    const expBlack = calculateExpectedScore(1500, 1500);
    assert.equal(expWhite, 0.5);
    assert.equal(expBlack, 0.5);
  });

  it("calculates symmetric rating deltas when White wins against equal opponent", () => {
    const res = calculateMatchRatings(1500, 1500, 1, false, false, 24);
    // With K=24 and expected=0.5: delta = 24 * (1 - 0.5) = +12
    assert.equal(res.whiteDelta, 12);
    assert.equal(res.blackDelta, -12);
    assert.equal(res.newWhiteRating, 1512);
    assert.equal(res.newBlackRating, 1488);
  });

  it("calculates zero delta on draw between equal players", () => {
    const res = calculateMatchRatings(1500, 1500, 0.5);
    assert.equal(res.whiteDelta, 0);
    assert.equal(res.blackDelta, 0);
    assert.equal(res.newWhiteRating, 1500);
    assert.equal(res.newBlackRating, 1500);
  });

  it("awards smaller gains to higher-rated player beating lower-rated player", () => {
    // 2000 rated player beats 1200 rated player
    const res = calculateMatchRatings(2000, 1200, 1);
    assert.ok(res.whiteDelta < 5, "Expected White delta to be very small");
    assert.ok(res.whiteDelta >= 0, "White delta must be positive on win");
  });

  it("awards large gains to lower-rated player upsetting higher-rated opponent", () => {
    // 1200 rated player beats 2000 rated player
    const res = calculateMatchRatings(1200, 2000, 1);
    assert.ok(res.whiteDelta > 28, "Upset should yield massive rating jump");
  });

  it("applies higher K-factor for provisional ratings", () => {
    const established = calculateMatchRatings(1500, 1500, 1, false, false);
    const provisional = calculateMatchRatings(1500, 1500, 1, true, false);

    assert.ok(
      provisional.whiteDelta > established.whiteDelta,
      "Provisional player should experience higher rating volatility",
    );
  });

  it("strictly enforces the rating floor", () => {
    // Player at rating floor losing to an equal opponent (expected 0.5, delta = -16, 105 - 16 = 89 -> clamped to 100)
    const res = calculateMatchRatings(105, 105, 0);
    assert.ok(res.newWhiteRating >= RATING_FLOOR, "Rating must never drop below the rating floor");
    assert.equal(res.newWhiteRating, RATING_FLOOR);
  });

  it("handles repeated games consistently", () => {
    let white = 1500;
    let black = 1500;

    for (let i = 0; i < 5; i++) {
      const match = calculateMatchRatings(white, black, 1);
      white = match.newWhiteRating;
      black = match.newBlackRating;
    }

    assert.ok(white > 1540);
    assert.ok(black < 1460);
  });
});
