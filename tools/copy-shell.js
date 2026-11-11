#!/usr/bin/env node
// Keeps a pristine copy of the Vite-built index.html as dist/shell.html.
// prerender.js later overwrites dist/index.html with the home page snapshot,
// and vercel.json rewrites every non-prerendered route to /shell.html, so a
// route that failed to prerender gets a neutral app shell (the app renders the
// right page) instead of the home page's HTML and title.
import fs from 'fs';
import path from 'path';

const dist = path.join(process.cwd(), 'dist');
const src = path.join(dist, 'index.html');
if (!fs.existsSync(src)) {
  console.error('dist/index.html not found — run vite build first.');
  process.exit(1);
}
fs.copyFileSync(src, path.join(dist, 'shell.html'));
console.log('wrote dist/shell.html');
