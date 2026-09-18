#!/usr/bin/env bash
# Regenerate the shipped bundles from the source modules.
#
#   ./build.sh          build in place, then commit the generated bundle(s)
#   ./build.sh --check   verify the committed bundles are fresh WITHOUT touching
#                        the working tree (used by .githooks/pre-commit)
#
# Bundling rather than loading a dozen <script> tags: Webflow's footer custom
# code has a 10,000-character limit and every extra request costs a round trip.
# One pinned jsDelivr URL per bundle keeps the Webflow side to a single line.
set -euo pipefail
cd "$(dirname "$0")"

# ── Configuration ──────────────────────────────────────────────────────────
# GH_SLUG must match the GitHub repo that serves the bundles over jsDelivr.
# STAMPED lists the files carrying a pinned @vX.Y.Z tag that build.sh rewrites.
GH_SLUG="0x5am5/webflai-ai-workflow-template"
STAMPED=(webflow-snippet.html)

# Bundles. page-init MUST be first in the core bundle — it defines
# window.SitePage before any module tries to register against it.
core=(page-init example-module)

# Add further bundles by declaring another array and a matching build call at
# the foot of this file, e.g. for a heavy effect only a few pages need:
#   heavy=(some-shader some-consumer)

check=0
[[ "${1:-}" == "--check" ]] && check=1

version="$(cat VERSION)"

# ── Version stamp ──────────────────────────────────────────────────────────
# VERSION is the SINGLE place to bump the shipped release tag. The stamp
# rewrites the pinned @vX.Y.Z tag in place wherever it appears, so hand-pinned
# URLs never drift out of lock-step. Never edit those tags by hand. After
# tagging vX.Y.Z the git tag MUST match VERSION.
# (macOS/BSD sed needs the empty -i '' argument.)
if [[ "$check" == 1 ]]; then
  for f in "${STAMPED[@]}"; do
    [[ -f "$f" ]] || continue
    grep -q "@v${version}" "$f" \
      || { echo "STALE: $f is not stamped with @v${version} — run ./build.sh"; exit 1; }
  done
else
  for f in "${STAMPED[@]}"; do
    [[ -f "$f" ]] || continue
    sed -i '' "s|${GH_SLUG}@v[0-9][0-9.]*|${GH_SLUG}@v${version}|g" "$f"
  done
fi

# build <outfile> <name> <module…>
# <name> is the committed bundle basename stamped into the header, so a --check
# build into a temp dir produces bytes identical to the committed bundle — the
# header must not encode the temp path.
build() {
  local out="$1" name="$2"; shift 2
  : > "$out"
  printf '/* %s — generated bundle from: %s. Do not edit directly; edit the source modules and run ./build.sh. */\n' "$name" "$*" >> "$out"
  for m in "$@"; do
    printf '\n/* ==== %s.js ==== */\n' "$m" >> "$out"
    cat "$m.js" >> "$out"
  done
  node --check "$out"
  echo "built $out ($(wc -c < "$out") bytes)"
}

if [[ "$check" == 1 ]]; then
  # Build into a temp dir and diff against the committed bundles; the tree is
  # never modified. rm always runs (success or failure) via the EXIT trap.
  tmp=".build-check"
  rm -rf "$tmp"; mkdir -p "$tmp"
  trap 'rm -rf "$tmp"' EXIT
  build "$tmp/site-core.js" site-core.js "${core[@]}"
  stale=0
  for b in site-core.js; do
    diff -q "$b" "$tmp/$b" >/dev/null 2>&1 \
      || { echo "STALE: $b differs from a fresh build — run ./build.sh"; stale=1; }
  done
  [[ "$stale" == 0 ]] && echo "bundles are fresh"
  exit "$stale"
fi

build site-core.js site-core.js "${core[@]}"
