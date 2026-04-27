import { describe, expect, it } from "vitest";
import { calculateDimensionScore, getLikertWeight, getResultCode } from "./scoring";

describe("getLikertWeight", () => {
  it("maps the seven-point scale to signed weights", () => {
    expect(getLikertWeight(1)).toBe(3);
    expect(getLikertWeight(4)).toBe(0);
    expect(getLikertWeight(7)).toBe(-3);
  });
});

describe("getResultCode", () => {
  it("uses P as the public letter for the Pray side", () => {
    expect(
      getResultCode({
        source: "C",
        hierarchy: "A",
        investigation: "P",
        purpose: "W",
      })
    ).toBe("CAPW");
  });
});

describe("calculateDimensionScore", () => {
  it("treats reverse-coded questions as weight toward the right-side pole", () => {
    expect(
      calculateDimensionScore("S", {
        S5: 1,
      }).winningPole
    ).toBe("T");
  });
});
