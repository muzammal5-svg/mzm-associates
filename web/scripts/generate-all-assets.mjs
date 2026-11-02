import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("web");
const inputJpg = "C:/Users/HP/.gemini/antigravity/brain/bc6c89f7-093f-481c-a202-3eb9c36db156/.user_uploaded/media_1793458455840_bf6b9df5.jpg";

async function run() {
  console.log("Starting full app icon & logo asset generation...");

  // Verify source
  await fs.access(inputJpg);
  const baseImg = sharp(inputJpg);
  const meta = await baseImg.metadata();
  console.log(`Source image: ${meta.format} ${meta.width}x${meta.height}`);

  // Create directories if needed
  const dirs = [
    path.join(root, "public/logo"),
    path.join(root, "public/icons"),
    path.join(root, "app"),
    path.join(root, "android/app/src/main/res/mipmap-mdpi"),
    path.join(root, "android/app/src/main/res/mipmap-hdpi"),
    path.join(root, "android/app/src/main/res/mipmap-xhdpi"),
    path.join(root, "android/app/src/main/res/mipmap-xxhdpi"),
    path.join(root, "android/app/src/main/res/mipmap-xxxhdpi"),
    path.join(root, "android/app/src/main/res/values"),
    path.join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset"),
  ];

  for (const d of dirs) {
    await fs.mkdir(d, { recursive: true });
  }

  // 1. High-resolution PNG master
  const master1024 = await sharp(inputJpg).png({ quality: 100 }).toBuffer();
  await fs.writeFile(path.join(root, "public/logo/app-icon.png"), master1024);
  await fs.writeFile(path.join(root, "public/logo/brand-mark.png"), await sharp(master1024).resize(512, 512).png().toBuffer());
  await fs.writeFile(path.join(root, "public/logo/mzm-monogram.png"), await sharp(master1024).resize(512, 512).png().toBuffer());
  console.log("✓ Saved master logos in public/logo/");

  // 2. Web & PWA Manifest icons
  const pwaSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
  for (const s of pwaSizes) {
    const buf = await sharp(master1024).resize(s, s).png().toBuffer();
    await fs.writeFile(path.join(root, `public/icons/icon-${s}.png`), buf);
  }

  // Maskable icon: 80% safe zone padded with #152d53
  const maskableInner = await sharp(master1024).resize(410, 410).png().toBuffer();
  await sharp(maskableInner)
    .extend({ top: 51, bottom: 51, left: 51, right: 51, background: "#152d53" })
    .png()
    .toFile(path.join(root, "public/icons/icon-512-maskable.png"));

  // Also root-level icons required by PWA & browsers
  await fs.writeFile(path.join(root, "public/icon-192.png"), await sharp(master1024).resize(192, 192).png().toBuffer());
  await fs.writeFile(path.join(root, "public/icon-512.png"), await sharp(master1024).resize(512, 512).png().toBuffer());
  await fs.writeFile(path.join(root, "public/favicon.png"), await sharp(master1024).resize(64, 64).png().toBuffer());
  await fs.writeFile(path.join(root, "public/apple-icon.png"), await sharp(master1024).resize(180, 180).png().toBuffer());

  // Next.js App Directory icons
  await fs.writeFile(path.join(root, "app/icon.png"), await sharp(master1024).resize(32, 32).png().toBuffer());
  await fs.writeFile(path.join(root, "app/apple-icon.png"), await sharp(master1024).resize(180, 180).png().toBuffer());
  console.log("✓ Saved Web & PWA icons");

  // 3. Multi-resolution Favicon.ico
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  for (const s of icoSizes) {
    const buf = await sharp(master1024).resize(s, s).png().toBuffer();
    icoBuffers.push({ width: s, height: s, buffer: buf });
  }

  const icoFile = createIco(icoBuffers);
  await fs.writeFile(path.join(root, "public/favicon.ico"), icoFile);
  await fs.writeFile(path.join(root, "app/favicon.ico"), icoFile);
  console.log("✓ Created multi-resolution favicon.ico");

  // 4. Android Native Mipmap Icons
  const androidDensities = [
    { dir: "mipmap-mdpi", size: 48, fgSize: 108, iconInner: 72 },
    { dir: "mipmap-hdpi", size: 72, fgSize: 162, iconInner: 108 },
    { dir: "mipmap-xhdpi", size: 96, fgSize: 216, iconInner: 144 },
    { dir: "mipmap-xxhdpi", size: 144, fgSize: 324, iconInner: 216 },
    { dir: "mipmap-xxxhdpi", size: 192, fgSize: 432, iconInner: 288 },
  ];

  for (const { dir, size, fgSize, iconInner } of androidDensities) {
    const outDir = path.join(root, `android/app/src/main/res/${dir}`);
    
    // Standard launcher icon
    await sharp(master1024).resize(size, size).png().toFile(path.join(outDir, "ic_launcher.png"));

    // Round launcher icon: circle mask
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff" /></svg>`
    );
    await sharp(master1024)
      .resize(size, size)
      .composite([{ input: circleSvg, blend: "dest-in" }])
      .png()
      .toFile(path.join(outDir, "ic_launcher_round.png"));

    // Adaptive icon foreground: center icon inside transparent canvas
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

  // Update ic_launcher_background.xml
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#152d53</color>\n</resources>\n`;
  await fs.writeFile(path.join(root, "android/app/src/main/res/values/ic_launcher_background.xml"), bgXml);
  console.log("✓ Generated Android mipmap icons & updated background color");

  // 5. iOS AppIcon
  const iosIconPath = path.join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
  await sharp(master1024).resize(1024, 1024).png().toFile(iosIconPath);
  console.log("✓ Generated iOS 1024x1024 AppIcon");

  console.log("All assets generated successfully!");
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
