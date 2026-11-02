import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = "C:/dev/mzm/web";
const dRoot = "D:/dev/mzm/web";
const inputJpg = "C:/Users/HP/.gemini/antigravity/brain/25c1a596-d79c-49af-8613-4ff8b402ae36/.user_uploaded/media_1793646328622_60a09aad.jpg";

async function run() {
  console.log("Generating app icon & branding assets from user upload...");

  await fs.access(inputJpg);
  
  // 1. Crop the squircle icon (width: 528, height: 528, left: 249, top: 130)
  const squircleSize = 528;
  const radius = 118; // 22.5% corner radius standard for squircle
  
  const maskSvg = Buffer.from(
    `<svg width="${squircleSize}" height="${squircleSize}">
       <rect x="0" y="0" width="${squircleSize}" height="${squircleSize}" rx="${radius}" ry="${radius}" fill="#fff"/>
     </svg>`
  );

  const cropped = await sharp(inputJpg)
    .extract({ left: 249, top: 130, width: squircleSize, height: squircleSize })
    .composite([{ input: maskSvg, blend: "dest-in" }])
    .png()
    .toBuffer();

  // Resize to 1024x1024 crisp master PNG
  const master1024 = await sharp(cropped)
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  // Also create solid dark-navy background master for iOS (Apple doesn't allow alpha in AppIcon)
  const master1024Opaque = await sharp(master1024)
    .flatten({ background: "#0B1B3A" })
    .png()
    .toBuffer();

  const targetRoots = [root];
  try {
    await fs.access(dRoot);
    targetRoots.push(dRoot);
  } catch {}

  for (const tRoot of targetRoots) {
    const dirs = [
      path.join(tRoot, "public/logo"),
      path.join(tRoot, "public/icons"),
      path.join(tRoot, "app"),
      path.join(tRoot, "android/app/src/main/res/mipmap-mdpi"),
      path.join(tRoot, "android/app/src/main/res/mipmap-hdpi"),
      path.join(tRoot, "android/app/src/main/res/mipmap-xhdpi"),
      path.join(tRoot, "android/app/src/main/res/mipmap-xxhdpi"),
      path.join(tRoot, "android/app/src/main/res/mipmap-xxxhdpi"),
      path.join(tRoot, "android/app/src/main/res/values"),
      path.join(tRoot, "ios/App/App/Assets.xcassets/AppIcon.appiconset"),
    ];

    for (const d of dirs) {
      await fs.mkdir(d, { recursive: true });
    }

    // Save full poster graphic
    await fs.writeFile(path.join(tRoot, "public/logo/app-poster.png"), await sharp(inputJpg).png().toBuffer());

    // Save masters
    await fs.writeFile(path.join(tRoot, "public/logo/app-icon.png"), master1024);
    await fs.writeFile(path.join(tRoot, "public/logo/brand-mark.png"), await sharp(master1024).resize(512, 512).png().toBuffer());
    await fs.writeFile(path.join(tRoot, "public/logo/mzm-monogram.png"), await sharp(master1024).resize(512, 512).png().toBuffer());

    // PWA Manifest icons
    const pwaSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
    for (const s of pwaSizes) {
      const buf = await sharp(master1024).resize(s, s).png().toBuffer();
      await fs.writeFile(path.join(tRoot, `public/icons/icon-${s}.png`), buf);
    }

    // Maskable icon with 80% safe zone padded with #0B1B3A
    const maskableInner = await sharp(master1024).resize(410, 410).png().toBuffer();
    await sharp(maskableInner)
      .extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#0B1B3A" })
      .png()
      .toFile(path.join(tRoot, "public/icons/icon-512-maskable.png"));

    // Root-level icons
    await fs.writeFile(path.join(tRoot, "public/icon-192.png"), await sharp(master1024).resize(192, 192).png().toBuffer());
    await fs.writeFile(path.join(tRoot, "public/icon-512.png"), await sharp(master1024).resize(512, 512).png().toBuffer());
    await fs.writeFile(path.join(tRoot, "public/favicon.png"), await sharp(master1024).resize(64, 64).png().toBuffer());
    await fs.writeFile(path.join(tRoot, "public/apple-icon.png"), await sharp(master1024).resize(180, 180).png().toBuffer());

    // Next.js App Directory icons
    await fs.writeFile(path.join(tRoot, "app/icon.png"), await sharp(master1024).resize(32, 32).png().toBuffer());
    await fs.writeFile(path.join(tRoot, "app/apple-icon.png"), await sharp(master1024).resize(180, 180).png().toBuffer());

    // Multi-res Favicon.ico (16, 32, 48)
    const icoSizes = [16, 32, 48];
    const icoBuffers = [];
    for (const s of icoSizes) {
      const buf = await sharp(master1024).resize(s, s).png().toBuffer();
      icoBuffers.push({ width: s, height: s, buffer: buf });
    }
    const icoFile = createIco(icoBuffers);
    await fs.writeFile(path.join(tRoot, "public/favicon.ico"), icoFile);
    await fs.writeFile(path.join(tRoot, "app/favicon.ico"), icoFile);

    // Android Mipmaps
    const androidDensities = [
      { dir: "mipmap-mdpi", size: 48, fgSize: 108, iconInner: 72 },
      { dir: "mipmap-hdpi", size: 72, fgSize: 162, iconInner: 108 },
      { dir: "mipmap-xhdpi", size: 96, fgSize: 216, iconInner: 144 },
      { dir: "mipmap-xxhdpi", size: 144, fgSize: 324, iconInner: 216 },
      { dir: "mipmap-xxxhdpi", size: 192, fgSize: 432, iconInner: 288 },
    ];

    for (const { dir, size, fgSize, iconInner } of androidDensities) {
      const outDir = path.join(tRoot, `android/app/src/main/res/${dir}`);
      await sharp(master1024).resize(size, size).png().toFile(path.join(outDir, "ic_launcher.png"));

      const circleSvg = Buffer.from(
        `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff" /></svg>`
      );
      await sharp(master1024)
        .resize(size, size)
        .composite([{ input: circleSvg, blend: "dest-in" }])
        .png()
        .toFile(path.join(outDir, "ic_launcher_round.png"));

      const pad = Math.round((fgSize - iconInner) / 2);
      const innerBuf = await sharp(master1024).resize(iconInner, iconInner).png().toBuffer();
      await sharp(innerBuf)
        .extend({
          top: pad,
          bottom: fgSize - iconInner - pad,
          left: pad,
          right: fgSize - iconInner - pad,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(path.join(outDir, "ic_launcher_foreground.png"));
    }

    const bgXml = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0B1B3A</color>\n</resources>\n`;
    await fs.writeFile(path.join(tRoot, "android/app/src/main/res/values/ic_launcher_background.xml"), bgXml);

    // iOS AppIcon
    const iosIconPath = path.join(tRoot, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
    await sharp(master1024Opaque).resize(1024, 1024).png().toFile(iosIconPath);
    console.log(`✓ All assets generated in ${tRoot}`);
  }

  console.log("Done generating all app icons!");
}

function createIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirSize = 16;
  let offset = 6 + count * dirSize;

  const dirEntries = [];
  for (const img of images) {
    const entry = Buffer.alloc(dirSize);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map((b) => b.buffer)]);
}

run().catch((err) => {
  console.error("Asset generation error:", err);
  process.exitCode = 1;
});
