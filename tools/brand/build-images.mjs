// Renders the social share image and a raster logo from the brand SVGs.
// Usage: node tools/brand/build-images.mjs   (needs the Playwright Chromium used by prerender)
// Output: public/og-image.png (1200x630), public/logo-512.png (512x512)
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { chromium } from 'playwright-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(pathToFileURL(path.join(here, 'og.html')).href, { waitUntil: 'networkidle' });
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: path.join(root, 'public', 'og-image.png') });

const logo = await browser.newPage({ viewport: { width: 512, height: 512 } });
await logo.goto(pathToFileURL(path.join(root, 'public', 'brand', 'kuro-icon.svg')).href);
await logo.waitForTimeout(300);
await logo.screenshot({ path: path.join(root, 'public', 'logo-512.png'), omitBackground: true });

await browser.close();
console.log('wrote public/og-image.png and public/logo-512.png');
