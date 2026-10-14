import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const root = process.cwd();
const manifest = JSON.parse(await fs.readFile(path.join(root, "public/manifest.json"), "utf8"));
let failed = false;
for (const icon of manifest.icons ?? []) {
  const relative = icon.src.slice(1).split("/").join(path.sep);
  const file = path.join(root, "public", relative);
  try {
    const meta = await sharp(file).metadata();
    const expected = icon.sizes.split("x").map(Number);
    const ok = meta.width === expected[0] && meta.height === expected[1];
    console.log(`${ok ? "OK" : "FAIL"} ${icon.src}: ${meta.width}x${meta.height}, expected ${icon.sizes}`);
    failed ||= !ok;
  } catch (error) { console.log(`FAIL ${icon.src}: ${error.message}`); failed = true; }
}
if (failed) process.exitCode = 1;