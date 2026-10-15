import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const root = process.cwd();
const source = path.join(root, "public/logo/logoadv.jpeg");
const out = path.join(root, "public/icons");
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
await fs.access(source);
await fs.mkdir(out, { recursive: true });
const metadata = await sharp(source).metadata();
console.log(`SOURCE ${source}: ${metadata.format} ${metadata.width}x${metadata.height}`);
await fs.mkdir(out, { recursive: true });
for (const size of sizes) await sharp(source).resize(size, size, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(out, `icon-${size}.png`));
// Keep the complete mark inside the central 80% safe zone for OS masking.
await sharp(source).resize(410, 410, { fit: "contain", background: "#ffffff" }).extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#0B1B3A" }).png().toFile(path.join(out, "icon-512-maskable.png"));
await sharp(source).resize(64, 64, { fit: "contain", background: "#ffffff" }).png().toFile(path.join(root, "public/favicon.png"));
console.log(`Generated logo icons: ${[...sizes.map(s => `${s}x${s}`), "512x512 maskable", "64x64 favicon"].join(", ")}`);
