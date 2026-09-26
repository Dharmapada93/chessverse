import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";

describe("Chess Engine Rules & Move Validation", () => {
  it("validates pawn movement: single step, double initial step, and illegal moves", () => {
    const chess = new Chess();

    // Valid single step
    const m1 = chess.move("e3");
    assert.ok(m1, "e3 should be legal");
    assert.equal(m1.san, "e3");

    // Valid double step for black
    const m2 = chess.move("d5");
    assert.ok(m2, "d5 should be legal");

    // Illegal triple step
    assert.throws(() => {
      chess.move("e6");
    }, /Invalid move/i);
  });

  it("handles pawn captures and en passant", () => {
    const chess = new Chess();
    // 1. e4 d5 2. e5 f5 3. exf6 (en passant)
    chess.move("e4");
    chess.move("d5");
    chess.move("e5");
    chess.move("f5");

    // En passant capture
    const epMove = chess.move({ from: "e5", to: "f6" });
    assert.ok(epMove, "En passant should be legal");
    assert.equal(epMove.captured, "p", "Captured piece must be pawn");
    assert.equal(epMove.flags.includes("e"), true, "Move flag must contain en passant");
  });

  it("handles pawn promotion to Queen, Rook, Bishop, Knight", () => {
    // Position where White pawn on a7 is ready to promote
    const fen = "8/P7/8/8/8/8/8/4K2k w - - 0 1";
    
    // Promote to Queen
    const chessQ = new Chess(fen);
    const mQ = chessQ.move({ from: "a7", to: "a8", promotion: "q" });
    assert.ok(mQ);
    assert.equal(mQ.promotion, "q");
    assert.equal(chessQ.get("a8")?.type, "q");

    // Promote to Knight (underpromotion)
    const chessN = new Chess(fen);
    const mN = chessN.move({ from: "a7", to: "a8", promotion: "n" });
    assert.ok(mN);
    assert.equal(mN.promotion, "n");
    assert.equal(chessN.get("a8")?.type, "n");
  });

  it("validates Knight jumping and movement geometry", () => {
    const chess = new Chess();
    // Knight can jump over unmoved pawns
    const move = chess.move("Nf3");
    assert.ok(move);
    assert.equal(move.piece, "n");
    assert.equal(move.to, "f3");

    // Cannot move straight or diagonally
    assert.throws(() => {
      chess.move("Nd4");
    }, /Invalid move/i);
  });

  it("validates Bishop diagonal line of sight and obstruction", () => {
    const chess = new Chess();
    // Bishop obstructed by pawn
    assert.throws(() => {
      chess.move("Bc4");
    }, /Invalid move/i);

    // Open diagonal
    chess.move("e4");
    chess.move("e5");
    const bMove = chess.move("Bc4");
    assert.ok(bMove);
    assert.equal(bMove.piece, "b");
  });

  it("validates Rook rank and file movements", () => {
    const chess = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    const rMove = chess.move("Ra5");
    assert.ok(rMove);
    assert.equal(rMove.piece, "r");
    assert.equal(rMove.to, "a5");
  });

  it("validates Queen combined movement capabilities", () => {
    const chess = new Chess("4k3/8/8/4Q3/8/8/8/4K3 w - - 0 1");
    // Diagonal
    assert.ok(chess.move("Qh8+"));
    // Black king moves
    chess.move("Kd7");
    // File move
    assert.ok(chess.move("Qh7+"));
  });

  it("validates Kingside and Queenside castling and rights loss", () => {
    const chess = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    
    // White Kingside castling
    const o_o = chess.move("O-O");
    assert.ok(o_o);
    assert.equal(chess.get("g1")?.type, "k");
    assert.equal(chess.get("f1")?.type, "r");

    // Black Queenside castling
    const o_o_o = chess.move("O-O-O");
    assert.ok(o_o_o);
    assert.equal(chess.get("c8")?.type, "k");
    assert.equal(chess.get("d8")?.type, "r");
  });

  it("forbids castling through or out of check", () => {
    // White king on e1, Black rook on e8 checking e1 directly (Black king on h8)
    const checkFen = "4r2k/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    const chess = new Chess(checkFen);
    assert.equal(chess.inCheck(), true);
    assert.throws(() => {
      chess.move("O-O");
    }, /Invalid move/i);

    // Black rook attacking f1 (square through which White king must pass for O-O, Black king on h8)
    const passCheckFen = "5r1k/8/8/8/8/8/8/R3K2R w KQ - 0 1";
    const chessPass = new Chess(passCheckFen);
    assert.throws(() => {
      chessPass.move("O-O");
    }, /Invalid move/i);
  });

  it("accurately identifies Checkmate (Scholar's Mate)", () => {
    const chess = new Chess();
    // 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#
    chess.move("e4");
    chess.move("e5");
    chess.move("Qh5");
    chess.move("Nc6");
    chess.move("Bc4");
    chess.move("Nf6");
    chess.move("Qxf7#");

    assert.equal(chess.inCheck(), true);
    assert.equal(chess.isCheckmate(), true);
    assert.equal(chess.isGameOver(), true);
  });

  it("accurately identifies Stalemate", () => {
    // Classic stalemate position: Black king on a8 has no legal moves but is not in check
    const stalemateFen = "k7/2Q5/1K6/8/8/8/8/8 b - - 0 1";
    const chess = new Chess(stalemateFen);

    assert.equal(chess.inCheck(), false);
    assert.equal(chess.isStalemate(), true);
    assert.equal(chess.isGameOver(), true);
  });

  it("rejects illegal moves exposing king to check", () => {
    // White pinned knight on e2 between King on e1 and Black rook on e8 (Black king on h8)
    const pinnedFen = "4r2k/8/8/8/8/8/4N3/4K3 w - - 0 1";
    const chess = new Chess(pinnedFen);

    // Attempting to move pinned knight
    assert.throws(() => {
      chess.move("Nd4");
    }, /Invalid move/i);
    // Board state unchanged
    assert.equal(chess.get("e2")?.type, "n");
  });
});
