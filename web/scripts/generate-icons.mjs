import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const masterIcon = path.join(root, "public/logo/app-icon.png");
const out = path.join(root, "public/icons");
const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

await fs.access(masterIcon);
await fs.mkdir(out, { recursive: true });

const metadata = await sharp(masterIcon).metadata();
console.log(`SOURCE ${masterIcon}: ${metadata.format} ${metadata.width}x${metadata.height}`);

// Generate all icons from the master icon
for (const size of sizes) {
  await sharp(masterIcon).resize(size, size).png().toFile(path.join(out, `icon-${size}.png`));
}

// Maskable icon with 80% safe zone
await sharp(masterIcon)
  .resize(410, 410)
  .extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#152d53" })
  .png()
  .toFile(path.join(out, "icon-512-maskable.png"));

await sharp(masterIcon).resize(64, 64).png().toFile(path.join(root, "public/favicon.png"));
console.log(`Generated logo icons: ${[...sizes.map((s) => `${s}x${s}`), "512x512 maskable", "64x64 favicon"].join(", ")}`);
