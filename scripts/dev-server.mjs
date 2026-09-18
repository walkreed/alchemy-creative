#!/usr/bin/env node
/**
 * Local dev server for testing template/ pages against the LOCAL site-scripts
 * bundles (uncommitted edits included) instead of the pushed jsDelivr copies.
 *
 * Usage: node scripts/dev-server.mjs [port]   (default 8080; bun works too)
 *
 * What it does:
 *  - Serves template/ at /  (extensionless URLs resolve to .html, Webflow-style)
 *  - Mounts site-scripts/ at /site-scripts/
 *  - Rewrites every pinned https://cdn.jsdelivr.net/gh/<slug>@<tag>/site-scripts/
 *    URL in served .html and .js to /site-scripts/, so no committed file ever
 *    needs a local-only edit. Also covers pinned URLs baked inside a bundle
 *    (e.g. a lazily-loaded second bundle).
 *  - Before serving a bundle, re-runs site-scripts/build.sh automatically if any
 *    source module is newer than the committed bundle.
 *
 * External libs (GSAP and friends) still load from their real CDNs.
 */
import http from 'node:http';
import path from 'node:path';
import { existsSync, statSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = path.resolve(here, '../template');
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

/* Where the script modules live. Defaults to the in-repo site-scripts/; point
   SITE_SCRIPTS_DIR at a sibling checkout if the project splits them out. */
const SCRIPTS_ROOT = path.resolve(
  here,
  process.env.SITE_SCRIPTS_DIR || '../site-scripts',
);

/* Mount point and the pinned-CDN pattern to rewrite. Both derive from the
   directory name, so renaming site-scripts/ needs no other change here. */
const MOUNT = `/${path.basename(SCRIPTS_ROOT)}`;
const CDN_RE = new RegExp(
  `https://cdn\\.jsdelivr\\.net/gh/[^/"'\\s]+/[^/"'\\s]+@[^/"'\\s]+${MOUNT}/`,
  'g',
);

/** Generated bundle filenames — never treated as sources when checking staleness. */
const BUNDLES = new Set(['site-core.js']);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

const hasScripts = existsSync(SCRIPTS_ROOT);
if (!hasScripts) {
  console.warn(`[dev] no scripts directory at ${SCRIPTS_ROOT} — serving template/ only.`);
}

/** Re-run build.sh when any source module is newer than the requested bundle. */
function rebuildIfStale(bundleName) {
  const bundlePath = path.join(SCRIPTS_ROOT, bundleName);
  const bundleMtime = existsSync(bundlePath) ? statSync(bundlePath).mtimeMs : 0;
  const stale = readdirSync(SCRIPTS_ROOT).some((f) => {
    if (BUNDLES.has(f)) return false;
    if (!f.endsWith('.js') && f !== 'build.sh' && f !== 'VERSION') return false;
    return statSync(path.join(SCRIPTS_ROOT, f)).mtimeMs > bundleMtime;
  });
  if (!stale) return;
  console.log(`[dev] sources newer than ${bundleName} — running build.sh`);
  try {
    execFileSync('./build.sh', { cwd: SCRIPTS_ROOT, stdio: 'inherit' });
  } catch {
    console.error('[dev] build.sh FAILED — serving the previous (stale) bundle');
  }
}

/** Resolve a URL pathname to { file, root } or null. */
function resolveFile(pathname) {
  let root = TEMPLATE_ROOT;
  let rel = pathname;
  if (hasScripts && (pathname === MOUNT || pathname.startsWith(`${MOUNT}/`))) {
    root = SCRIPTS_ROOT;
    rel = pathname.slice(MOUNT.length) || '/';
  }
  let file = path.normalize(path.join(root, decodeURIComponent(rel)));
  if (!file.startsWith(root + path.sep) && file !== root) return null; // traversal guard
  // jsDelivr serves an auto-minified `<name>.min.js` alias for any committed
  // file; the repo only holds unminified sources, so map the alias back.
  if (root === SCRIPTS_ROOT && !existsSync(file) && file.endsWith('.min.js')) {
    const unmin = `${file.slice(0, -'.min.js'.length)}.js`;
    if (existsSync(unmin)) file = unmin;
  }
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!existsSync(file) && !path.extname(file) && existsSync(`${file}.html`)) file += '.html';
  return existsSync(file) && statSync(file).isFile() ? { file, root } : null;
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://x').pathname;
  const hit = resolveFile(pathname);
  if (!hit) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end(`404 ${pathname}`);
    return;
  }

  const base = path.basename(hit.file);
  if (hit.root === SCRIPTS_ROOT && BUNDLES.has(base)) rebuildIfStale(base);

  const ext = path.extname(hit.file).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  let body = readFileSync(hit.file);
  if (ext === '.html' || ext === '.js' || ext === '.mjs') {
    body = Buffer.from(body.toString('utf8').replace(CDN_RE, `${MOUNT}/`));
  }
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
  }).end(body);
});

server.listen(PORT, () => {
  console.log(`[dev] template/  →  http://localhost:${PORT}/`);
  if (hasScripts) {
    console.log(`[dev] ${SCRIPTS_ROOT}  →  http://localhost:${PORT}${MOUNT}/`);
    console.log('[dev] pinned jsDelivr URLs are rewritten to the local copy; bundles rebuild when stale.');
  }
});
