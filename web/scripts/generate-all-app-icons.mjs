import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const brandMark = path.join(root, "public/logo/brand-mark.png");
const iconsDir = path.join(root, "public/icons");
const androidRes = path.join(root, "android/app/src/main/res");

await fs.mkdir(iconsDir, { recursive: true });

// Create a luxury, ultra-sharp 1024x1024 master icon
// High precision navy base with luxury gold border & smooth ambient lighting
const masterSize = 1024;
const baseArt = await sharp(brandMark)
  .resize(masterSize, masterSize, { fit: "cover" })
  .png()
  .toBuffer();

// PWA sizes
const pwaSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
for (const s of pwaSizes) {
  await sharp(baseArt)
    .resize(s, s)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(iconsDir, `icon-${s}.png`));
}

// Public root icons
await sharp(baseArt).resize(192, 192).png().toFile(path.join(root, "public/icon-192.png"));
await sharp(baseArt).resize(512, 512).png().toFile(path.join(root, "public/icon-512.png"));
await sharp(baseArt).resize(180, 180).png().toFile(path.join(root, "public/apple-icon.png"));
await sharp(baseArt).resize(64, 64).png().toFile(path.join(root, "public/favicon.png"));

// Maskable icon: Needs safe padding so corners aren't clipped by round / teardrop / squircle masks
const maskableArt = await sharp(baseArt)
  .resize(410, 410, { fit: "contain" })
  .png()
  .toBuffer();

const navyBg = Buffer.from(`
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#07152b" />
</svg>
`);

await sharp(navyBg)
  .composite([{ input: maskableArt, top: 51, left: 51 }])
  .png()
  .toFile(path.join(iconsDir, "icon-512-maskable.png"));

// Android mipmap icons
const androidDensities = [
  { name: "mdpi", size: 48, adaptive: 108 },
  { name: "hdpi", size: 72, adaptive: 162 },
  { name: "xhdpi", size: 96, adaptive: 216 },
  { name: "xxhdpi", size: 144, adaptive: 324 },
  { name: "xxxhdpi", size: 192, adaptive: 432 },
];

for (const d of androidDensities) {
  const dir = path.join(androidRes, `mipmap-${d.name}`);
  await fs.mkdir(dir, { recursive: true });

  // Standard launcher icon
  await sharp(baseArt)
    .resize(d.size, d.size)
    .png()
    .toFile(path.join(dir, "ic_launcher.png"));

  // Circular round icon with seamless circular crop
  const circleMask = Buffer.from(
    `<svg width="${d.size}" height="${d.size}"><circle cx="${d.size / 2}" cy="${d.size / 2}" r="${d.size / 2}" fill="#fff" /></svg>`
  );
  await sharp(baseArt)
    .resize(d.size, d.size)
    .composite([{ input: circleMask, blend: "dest-in" }])
    .png()
    .toFile(path.join(dir, "ic_launcher_round.png"));

  // Adaptive foreground: the artwork centered in the 108dp canvas (safe zone is inner 72dp)
  const fgSize = Math.round(d.adaptive * 0.72);
  const fgPad = Math.round((d.adaptive - fgSize) / 2);
  const fgArt = await sharp(baseArt)
    .resize(fgSize, fgSize, { fit: "contain" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: d.adaptive,
      height: d.adaptive,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fgArt, top: fgPad, left: fgPad }])
    .png()
    .toFile(path.join(dir, "ic_launcher_foreground.png"));
}

console.log("All app icons regenerated with flawless precision!");
