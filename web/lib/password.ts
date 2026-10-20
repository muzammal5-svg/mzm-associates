// Ambiguous glyphs (I/l/1/O/0) are excluded: owners read these passwords out over the phone.
const UPPER  = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER  = "abcdefghijkmnopqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*+-=?";

const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function randomInt(maxExclusive: number): number {
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % maxExclusive;
  }
}

function charFrom(charset: string): string {
  return charset[randomInt(charset.length)];
}

export function generateTempPassword(length = 20): string {
  if (!Number.isInteger(length) || length < 8) {
    throw new Error("generateTempPassword requires an integer length of at least 8");
  }
  const chars = [charFrom(UPPER), charFrom(LOWER), charFrom(DIGITS), charFrom(SYMBOLS)];
  while (chars.length < length) chars.push(charFrom(ALL));
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
