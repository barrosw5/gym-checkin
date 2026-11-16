// Renders the app icons (PNG) from the SVGs in public/, with the Chromium
// that Playwright already installs: no image library, and the PNGs can be
// rebuilt whenever the drawing changes. Run: pnpm icons
import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";

const ICONS = [
  // Installed app icon (Android, desktop): rounded corners, transparent outside
  { svg: "public/favicon.svg", size: 192, out: "public/icons/icon-192.png", transparent: true },
  { svg: "public/favicon.svg", size: 512, out: "public/icons/icon-512.png", transparent: true },
  // Android masks it to its own shape: full bleed, drawing in the safe zone
  { svg: "public/icons/icon-maskable.svg", size: 512, out: "public/icons/icon-maskable-512.png" },
  // iOS rounds the corners itself and shows transparency as black: full bleed
  { svg: "public/icons/icon-maskable.svg", size: 180, out: "public/icons/apple-touch-icon.png" },
];

const browser = await chromium.launch();
try {
  for (const { svg, size, out, transparent = false } of ICONS) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const source = await readFile(svg, "utf8");
    await page.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${source}`,
    );
    await page.screenshot({ path: out, omitBackground: transparent });
    await page.close();
    console.log(`${out} (${size}×${size})`);
  }
} finally {
  await browser.close();
}
