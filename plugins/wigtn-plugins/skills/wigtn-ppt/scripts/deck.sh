#!/usr/bin/env bash
# Run deck.py with its dependencies (python-pptx, fonttools).
# Usage: deck.sh <check|outline|build|render|svg2png> ...   (see deck.py --help)
# Prefers uv (no install step, pinned versions); falls back to a python3 that already has them.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PINS=(--with "python-pptx==1.0.2" --with "fonttools==4.68.0")

if command -v uv >/dev/null 2>&1; then
  exec uv run -q --no-project "${PINS[@]}" python "$HERE/deck.py" "$@"
fi
if command -v python3 >/dev/null 2>&1 && python3 -c "import pptx, fontTools" >/dev/null 2>&1; then
  exec python3 "$HERE/deck.py" "$@"
fi
echo "wigtn-ppt: uv가 없고 python3에 python-pptx·fonttools도 없습니다." >&2
echo "  brew install uv   또는   python3 -m pip install python-pptx==1.0.2 fonttools==4.68.0" >&2
exit 2
