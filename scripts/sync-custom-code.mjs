#!/usr/bin/env node
/**
 * Sync custom-code blocks across template/*.html from template/custom-code.json.
 * Mirrors Webflow's site-level / page-level inline-script model so the project
 * stays portable. Owned blocks live strictly between marker comments — anything
 * between markers is overwritten on every run.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATE_DIR = join(ROOT, 'template');
const REGISTRY_PATH = join(TEMPLATE_DIR, 'custom-code.json');
const MAX_CHARS = 10_000;

const SCOPES = ['site', 'page'];
const LOCATIONS = ['header', 'footer'];

/** @typedef {{ name: string, version: string, source: string, canCopy?: boolean }} Script */

const emptyRegistry = () => ({ site: { header: [], footer: [] }, pages: {} });

const marker = (scope, location, end) =>
  `<!-- custom-code:${scope}:${location}:${end ? 'end' : 'start'} -->`;

/**
 * Render a script list into the HTML block content.
 * @param {Script[]} scripts
 * @param {string} scope
 * @param {string} location
 */
function renderBlock(scripts, scope, location) {
  if (!scripts.length) return '';
  return (
    '\n' +
    scripts
      .map((s) => {
        if (s.source.length > MAX_CHARS) {
          throw new Error(
            `[${scope}:${location}] "${s.name}@${s.version}" exceeds ${MAX_CHARS} chars (${s.source.length})`,
          );
        }
        const attrs = [
          `data-custom-code="${scope}:${location}"`,
          `data-name="${s.name}"`,
          `data-version="${s.version}"`,
        ].join(' ');
        return `<script ${attrs}>\n${s.source}\n</script>`;
      })
      .join('\n') +
    '\n'
  );
}

/**
 * Ensure a marker pair exists in `html`. If missing, insert immediately before
 * the supplied anchor (`</head>` or `</body>`). Returns possibly-modified html.
 */
function ensureMarkers(html, scope, location, anchor) {
  const start = marker(scope, location, false);
  const end = marker(scope, location, true);
  if (html.includes(start) && html.includes(end)) return html;
  const block = `  ${start}\n  ${end}\n  `;
  const idx = html.lastIndexOf(anchor);
  if (idx === -1) {
    throw new Error(`Cannot insert markers: anchor "${anchor}" not found`);
  }
  return html.slice(0, idx) + block + html.slice(idx);
}

/** Replace whatever sits between the marker pair with `body`. */
function replaceBlock(html, scope, location, body) {
  const start = marker(scope, location, false);
  const end = marker(scope, location, true);
  const startIdx = html.indexOf(start);
  const endIdx = html.indexOf(end, startIdx);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Markers for ${scope}:${location} missing after ensureMarkers`);
  }
  return html.slice(0, startIdx + start.length) + body + html.slice(endIdx);
}

async function loadRegistry() {
  if (!existsSync(REGISTRY_PATH)) return emptyRegistry();
  const raw = await readFile(REGISTRY_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  parsed.site ??= { header: [], footer: [] };
  parsed.site.header ??= [];
  parsed.site.footer ??= [];
  parsed.pages ??= {};
  return parsed;
}

function validateUniqueness(scripts, label) {
  const seen = new Set();
  for (const s of scripts) {
    const key = `${s.name}@${s.version}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate script "${key}" in ${label}`);
    }
    seen.add(key);
  }
}

async function main() {
  const registry = await loadRegistry();
  validateUniqueness(registry.site.header, 'site:header');
  validateUniqueness(registry.site.footer, 'site:footer');
  for (const [page, blocks] of Object.entries(registry.pages)) {
    validateUniqueness(blocks.header ?? [], `pages.${page}:header`);
    validateUniqueness(blocks.footer ?? [], `pages.${page}:footer`);
  }

  const files = (await readdir(TEMPLATE_DIR)).filter((f) => f.endsWith('.html'));
  const summary = { changed: [], unchanged: [] };

  for (const file of files) {
    const path = join(TEMPLATE_DIR, file);
    const original = await readFile(path, 'utf8');
    let html = original;

    for (const scope of SCOPES) {
      for (const location of LOCATIONS) {
        const anchor = location === 'header' ? '</head>' : '</body>';
        html = ensureMarkers(html, scope, location, anchor);
        const scripts =
          scope === 'site'
            ? registry.site[location]
            : registry.pages[file]?.[location] ?? [];
        html = replaceBlock(html, scope, location, renderBlock(scripts, scope, location));
      }
    }

    if (html !== original) {
      await writeFile(path, html, 'utf8');
      summary.changed.push(file);
    } else {
      summary.unchanged.push(file);
    }
  }

  const totals = {
    siteHeader: registry.site.header.length,
    siteFooter: registry.site.footer.length,
    pageScripts: Object.values(registry.pages).reduce(
      (n, p) => n + (p.header?.length ?? 0) + (p.footer?.length ?? 0),
      0,
    ),
  };
  console.log('custom-code sync complete');
  console.log(
    `  site: ${totals.siteHeader} header / ${totals.siteFooter} footer | page scripts: ${totals.pageScripts}`,
  );
  console.log(`  changed: ${summary.changed.length ? summary.changed.join(', ') : 'none'}`);
  console.log(`  unchanged: ${summary.unchanged.length}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
