#!/usr/bin/env bash
# Render a diagram spec (JSON) to SVG + PNG.
# Usage: render.sh <spec.json> [out-basename]   (default out-basename: spec path without .json)
# Exit 0 = rendered and layout checks passed, 1 = rendered but checks failed, 2 = bad input / setup error.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
CACHE="${WIGTN_DIAGRAM_CACHE:-${XDG_CACHE_HOME:-$HOME/.cache}/wigtn-diagram}"
DEPS="elkjs@0.12.0 roughjs@4.6.6 puppeteer@25.12.0 subset-font@2.9.0"

setup_fail() {
  echo "wigtn-diagram: $1" >&2
  exit 2
}

for tool in node npm curl; do
  command -v "$tool" >/dev/null 2>&1 || setup_fail "'$tool' is required but not installed"
done

# One setup at a time: concurrent first runs would corrupt the shared npm prefix.
mkdir -p "$CACHE"
LOCK="$CACHE/.setup.lock"
got_lock=0
for _ in $(seq 1 180); do
  if mkdir "$LOCK" 2>/dev/null; then got_lock=1; break; fi
  sleep 1
done
[ "$got_lock" = 1 ] || setup_fail "another setup has held $LOCK for 3 minutes (delete it if no render is running)"
trap 'rmdir "$LOCK" 2>/dev/null || true' EXIT

if [ ! -f "$CACHE/.deps" ] || [ "$(cat "$CACHE/.deps")" != "$DEPS" ]; then
  echo "wigtn-diagram: installing renderer deps into $CACHE (first run only)..." >&2
  # shellcheck disable=SC2086
  npm install --prefix "$CACHE" --no-audit --no-fund --loglevel=error $DEPS >&2 \
    || setup_fail "npm install failed (network or registry problem) — nothing was rendered"
  printf '%s' "$DEPS" > "$CACHE/.deps"
fi

# Fonts (all SIL OFL 1.1), pinned and hash-checked. Poor Story = Korean handwriting for titles
# and annotations (full Hangul), Pretendard = body text. Subsets are embedded into the SVG.
# A failed download is not fatal: the renderer falls back to system fonts and says so.
FONTS="$CACHE/fonts"
mkdir -p "$FONTS"
sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi
}
fetch_font() {
  local name="$1" url="$2" want="$3" part
  if [ -s "$FONTS/$name" ] && [ "$(sha256 "$FONTS/$name")" = "$want" ]; then return 0; fi
  part="$(mktemp "$FONTS/.$name.XXXXXX")"
  if curl -fsSL --retry 2 -o "$part" "$url" && [ "$(sha256 "$part")" = "$want" ]; then
    mv -f "$part" "$FONTS/$name"
  else
    rm -f "$part"
    echo "wigtn-diagram: could not fetch a verified $name (system font fallback)" >&2
  fi
}
fetch_font PoorStory-Regular.ttf \
  https://raw.githubusercontent.com/google/fonts/1ef157d3939299d14563418b2f7271b20f0e9161/ofl/poorstory/PoorStory-Regular.ttf \
  831ab87f7b5463f9cd83ac249bf386816f3a478f1d226427c88cac907adb7ee2
fetch_font Pretendard-Regular.otf \
  https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Regular.otf \
  3ffbacde6ab8411f1d2db54bb9b1f0b3ee2a738932033722cf0388c06aed1c93
fetch_font Pretendard-SemiBold.otf \
  https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-SemiBold.otf \
  c89bc43027dc7cde5726e96223376f8eec09302b2fc1f8147fd5b57cfc376118

rmdir "$LOCK" 2>/dev/null || true
trap - EXIT
WIGTN_DIAGRAM_FONTS="$FONTS" NODE_PATH="$CACHE/node_modules" exec node "$HERE/render.cjs" "$@"
