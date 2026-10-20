import { describe, expect, it } from "vitest";
import { generateTempPassword } from "../lib/password";

const CLASSES = /[A-Z]/, LOWER = /[a-z]/, DIGIT = /[2-9]/, SYMBOL = /[!@#$%&*+\-=?]/;

describe("generateTempPassword", () => {
  it("returns 16+ characters containing every class", () => {
    for (let i = 0; i < 200; i++) {
      const pw = generateTempPassword();
      expect(pw.length).toBeGreaterThanOrEqual(16);
      expect(pw).toMatch(CLASSES);
      expect(pw).toMatch(LOWER);
      expect(pw).toMatch(DIGIT);
      expect(pw).toMatch(SYMBOL);
    }
  });

  it("never emits ambiguous glyphs (0 O 1 l I)", () => {
    for (let i = 0; i < 200; i++) expect(generateTempPassword()).not.toMatch(/[0O1lI]/);
  });

  it("keeps every class at the shortest allowed length", () => {
    for (let i = 0; i < 200; i++) {
      const pw = generateTempPassword(8);
      expect(pw).toMatch(CLASSES);
      expect(pw).toMatch(LOWER);
      expect(pw).toMatch(DIGIT);
      expect(pw).toMatch(SYMBOL);
    }
  });

  it("honours an explicit length", () => {
    expect(generateTempPassword(24)).toHaveLength(24);
  });

  it("produces distinct passwords", () => {
    const seen = new Set(Array.from({ length: 50 }, () => generateTempPassword()));
    expect(seen.size).toBe(50);
  });

  it("refuses lengths that cannot be strong", () => {
    expect(() => generateTempPassword(7)).toThrow(/at least 8/);
    expect(() => generateTempPassword(1.5)).toThrow(/integer/);
  });
});
