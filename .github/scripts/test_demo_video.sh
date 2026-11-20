#!/usr/bin/env bash
# demo-video skill tests: script parser, TTS safety (mocked fetch, no network, no key),
# manifest atomicity, stale-audio rules, check-video exit codes (fake ffprobe), new.sh.
# Needs only Node.js >= 20 and bash. No npm install, no model calls, no paid API.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TESTS="$ROOT/plugins/wigtn-plugins/skills/demo-video/tests"
command -v node >/dev/null 2>&1 || { echo "node is required" >&2; exit 2; }
unset ELEVENLABS_API_KEY
exec node --test "$TESTS"/*.test.mjs
