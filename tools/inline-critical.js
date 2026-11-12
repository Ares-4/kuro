#!/usr/bin/env node
// Inlines each prerendered page's critical CSS into its <head> and loads the
// full stylesheet without blocking rendering (media="print" + onload swap,
// with a <noscript> fallback). Without this, the 29 KB (gzip) stylesheet blocked
// the first paint, and the app script ran as soon as it arrived, so phones saw
// nothing until ~1.7s even unthrottled (Lighthouse mobile FCP 4.5s).
//
// Runs after tools/prerender.js. Skips dist/shell.html (no content to analyse;
// keeps the normal blocking stylesheet for routes that were not prerendered).
import fs from 'fs';
import path from 'path';
import Beasties from 'beasties';

const dist = path.join(process.cwd(), 'dist');

const pages = [];
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) { if (name !== 'assets') walk(full); }
    else if (name === 'index.html') pages.push(full);
  }
};
walk(dist);

const beasties = new Beasties({
  path: dist,
  publicPath: '/',
  preload: 'media',        // <link rel="stylesheet" media="print" onload="this.media='all'">
  noscriptFallback: true,
  pruneSource: false,      // keep the full stylesheet file intact (shared by all pages and the shell)
  inlineFonts: false,
  reduceInlineStyles: false,
  mergeStylesheets: true,
  compress: true,
  logLevel: 'warn',
});

let done = 0;
let failed = 0;
let inlineBytes = 0;
for (const file of pages) {
  try {
    const html = fs.readFileSync(file, 'utf8');
    if (!/<link[^>]+rel="stylesheet"[^>]+href="\/assets\//.test(html)) continue; // nothing to do
    const out = await beasties.process(html);
    const inlined = (out.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
    inlineBytes += inlined.length;
    fs.writeFileSync(file, out);
    done++;
  } catch (err) {
    failed++; // leave the page as it was: still correct, just render-blocking
    console.warn(`inline-critical: ${path.relative(dist, file)}: ${err.message}`);
  }
}
console.log(`inline-critical: ${done}/${pages.length} pages, avg inline CSS ${done ? Math.round(inlineBytes / done / 1024) : 0} KB${failed ? `, ${failed} failed (left unchanged)` : ''}`);
