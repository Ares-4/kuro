#!/usr/bin/env node
// Renders tools/guide/guide-2027.html to public/guides/kuro-study-in-europe-guide-2027.pdf
// with the local Chrome. Run after editing the guide: node tools/build-guide.cjs
// (Not part of the Vercel build: the PDF is committed so deploys don't need it.)
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');

(async () => {
  const src = path.join(__dirname, 'guide', 'guide-2027.html');
  const outDir = path.join(__dirname, '..', 'public', 'guides');
  const out = path.join(outDir, 'kuro-study-in-europe-guide-2027.pdf');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: out,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;font-size:7pt;color:#8a97ad;padding:0 17mm;display:flex;justify-content:space-between;font-family:Arial"><span>Kuro Educational Consultancy · Study in Europe Guide 2027</span><span class="pageNumber"></span></div>',
  });
  await browser.close();
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`wrote ${path.relative(process.cwd(), out)} (${kb} KB)`);
})();
