import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const root = process.cwd();
const monogram = path.join(root, "public/logo/mzm-monogram.png");
const brandMark = path.join(root, "public/logo/brand-mark.png");
const out = path.join(root, "public/icons");
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
await fs.access(monogram);
await fs.mkdir(out, { recursive: true });
const metadata = await sharp(monogram).metadata();
console.log(`SOURCE ${monogram}: ${metadata.format} ${metadata.width}x${metadata.height}`);
// Keep the existing brand-mark crop for backward compatibility.
await sharp(path.join(root, "public/logo/logoadv.jpeg")).extract({ left: 175, top: 450, width: 510, height: 325 }).png().toFile(brandMark);
// Generate all icons from the square monogram (safe for small sizes and masking).
for (const size of sizes) await sharp(monogram).resize(size, size, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(out, `icon-${size}.png`));
// Keep the complete mark inside the central 80% safe zone for OS masking.
await sharp(monogram).resize(410, 410, { fit: "contain", background: "#ffffff" }).extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#0B1B3A" }).png().toFile(path.join(out, "icon-512-maskable.png"));
await sharp(monogram).resize(64, 64, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(root, "public/favicon.png"));
console.log(`MONOGRAM ${monogram}: 512x512 square for icons, favicon, small headers`);
console.log(`Generated logo icons: ${[...sizes.map(s => `${s}x${s}`), "512x512 maskable", "64x64 favicon"].join(", ")}`);
