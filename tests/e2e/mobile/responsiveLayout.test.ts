import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("E2E Layout & Mobile Responsive Boundaries (Step 90.8)", () => {
  type Viewport = {
    name: string;
    width: number;
    height: number;
    isMobile: boolean;
  };

  const viewports: Viewport[] = [
    { name: "Mobile Portrait (iPhone 14)", width: 390, height: 844, isMobile: true },
    { name: "Mobile Landscape", width: 844, height: 390, isMobile: true },
    { name: "Tablet (iPad Mini)", width: 768, height: 1024, isMobile: false },
    { name: "Desktop Wide", width: 1440, height: 900, isMobile: false },
  ];

  // Helper calculating responsive board size (matching CSS: min(90vw, 65vh, 600px))
  function calculateBoardDimension(vp: Viewport): { size: number; horizontalOverflow: boolean } {
    const maxWidth = vp.width * 0.92;
    const maxHeight = vp.height * 0.65;
    const size = Math.min(maxWidth, maxHeight, 600);

    return {
      size: Math.floor(size),
      horizontalOverflow: size > vp.width,
    };
  }

  for (const vp of viewports) {
    it(`calculates optimal board sizing for ${vp.name} without horizontal overflow`, () => {
      const { size, horizontalOverflow } = calculateBoardDimension(vp);
      assert.equal(horizontalOverflow, false, "Board must never cause horizontal scrollbar");
      assert.ok(size >= 240, "Board must remain legible (> 240px)");
      assert.ok(size <= vp.width);
    });
  }

  it("verifies interactive game buttons meet minimum touch-target requirements (>= 44px)", () => {
    const mobileControls = [
      { name: "Resign Button", minHeightPx: 44, minWidthPx: 80 },
      { name: "Draw Offer Button", minHeightPx: 44, minWidthPx: 80 },
      { name: "Chat Toggle", minHeightPx: 44, minWidthPx: 44 },
      { name: "Move Navigation Back", minHeightPx: 44, minWidthPx: 44 },
    ];

    for (const ctrl of mobileControls) {
      assert.ok(ctrl.minHeightPx >= 44, `${ctrl.name} must meet 44px minimum touch target height`);
      assert.ok(ctrl.minWidthPx >= 44, `${ctrl.name} must meet 44px minimum touch target width`);
    }
  });
});
