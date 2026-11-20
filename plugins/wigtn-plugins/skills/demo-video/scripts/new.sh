#!/usr/bin/env bash
# Copy the demo-video Remotion template into a new project directory.
# Usage: new.sh <target-dir>
# Exit 0 = created, 2 = bad input (missing argument, target exists and is not empty).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE="$HERE/../template"

if [ $# -ne 1 ] || [ -z "$1" ]; then
  echo "usage: new.sh <target-dir>" >&2
  exit 2
fi
TARGET="$1"

if [ -e "$TARGET" ] && [ ! -d "$TARGET" ]; then
  echo "demo-video: $TARGET exists and is not a directory" >&2
  exit 2
fi
if [ -d "$TARGET" ] && [ -n "$(ls -A "$TARGET")" ]; then
  echo "demo-video: $TARGET is not empty. Nothing was copied. Choose a new directory." >&2
  exit 2
fi

mkdir -p "$TARGET"
cp -R "$TEMPLATE"/. "$TARGET"/

cat <<MSG
demo-video: created $TARGET
next:
  cd $TARGET
  npm install
  npm run typecheck
  npx remotion still Demo out/check.png --frame=60     # look at one frame
  npx remotion studio                                  # live preview
MSG
