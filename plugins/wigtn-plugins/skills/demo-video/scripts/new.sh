#!/usr/bin/env bash
# Copy the demo-video Remotion template into a new project directory.
# Usage: new.sh <target-dir>
# Exit 0 = created, 2 = bad input.
#
# The target must not exist, or be an empty real directory. Refused, with nothing copied:
# a non-empty directory, a file, and a symbolic link (even one that points at an empty
# directory: give the real path instead, so it is clear where the files land).
# A relative path may start with "-"; it is treated as a path, never as an option.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE="$HERE/../template"

if [ $# -ne 1 ] || [ -z "$1" ]; then
  echo "usage: new.sh <target-dir>" >&2
  exit 2
fi
TARGET="$1"
# Make the path unambiguous for every command below ("-name" becomes "./-name").
case "$TARGET" in
  /*) ;;
  *) TARGET="./$TARGET" ;;
esac

if [ -L "$TARGET" ]; then
  echo "demo-video: $TARGET is a symbolic link. Nothing was copied. Give the real directory path." >&2
  exit 2
fi
if [ -e "$TARGET" ] && [ ! -d "$TARGET" ]; then
  echo "demo-video: $TARGET exists and is not a directory. Nothing was copied." >&2
  exit 2
fi
if [ -d "$TARGET" ] && [ -n "$(ls -A -- "$TARGET")" ]; then
  echo "demo-video: $TARGET is not empty. Nothing was copied. Choose a new directory." >&2
  exit 2
fi

mkdir -p -- "$TARGET"
cp -R -- "$TEMPLATE"/. "$TARGET"/

printf 'demo-video: created %s\nnext:\n' "$TARGET"
printf '  cd %q\n' "$TARGET"
cat <<'MSG'
  npm install
  npm run typecheck
  npx remotion compositions                            # evaluates the timeline checks (tsc does not)
  npx remotion still Demo out/check.png --frame=60     # look at one frame
  npx remotion studio                                  # live preview
MSG
