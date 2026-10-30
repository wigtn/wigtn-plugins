"""Pinned fonts and text measurement.

The builder decides line breaks before it writes the pptx, so a title that would
wrap or a column that would overflow fails the build instead of showing up on stage.
Widths come from the real Pretendard advance widths (fontTools). When the fonts
cannot be fetched, a conservative estimate is used and the build says so.
"""

from __future__ import annotations

import hashlib
import os
import re
import sys
import urllib.request
from pathlib import Path

# Pretendard 1.3.9 (SIL OFL 1.1). Regular matches the architecture-diagram pin.
FONTS = {
    "regular": (
        "Pretendard-Regular.otf",
        "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Regular.otf",
        "3ffbacde6ab8411f1d2db54bb9b1f0b3ee2a738932033722cf0388c06aed1c93",
    ),
    "bold": (
        "Pretendard-Bold.otf",
        "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/Pretendard-Bold.otf",
        "2e91915fab54df71cc9598ebf608b2bdb54c6fe3c066ac61dff0bc44fca71cc7",
    ),
}

# Renderers differ from the font's advance widths by a few percent (kerning,
# PowerPoint vs LibreOffice), so a line may use only this share of its box.
FILL_LIMIT = 0.96


def cache_dir() -> Path:
    base = os.environ.get("WIGTN_PPT_CACHE")
    if base:
        return Path(base)
    xdg = os.environ.get("XDG_CACHE_HOME") or str(Path.home() / ".cache")
    return Path(xdg) / "wigtn-ppt"


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ensure_fonts(quiet: bool = False) -> dict[str, Path] | None:
    """Return {weight: path} for the pinned fonts, downloading once. None on failure."""
    folder = cache_dir() / "fonts"
    folder.mkdir(parents=True, exist_ok=True)
    found: dict[str, Path] = {}
    for weight, (name, url, want) in FONTS.items():
        path = folder / name
        if path.is_file() and _sha256(path) == want:
            found[weight] = path
            continue
        part = folder / f".{name}.part"
        try:
            with urllib.request.urlopen(url, timeout=60) as resp:
                part.write_bytes(resp.read())
            if _sha256(part) != want:
                raise ValueError("checksum mismatch")
            part.replace(path)
            found[weight] = path
        except Exception as exc:  # network, checksum, disk
            part.unlink(missing_ok=True)
            if not quiet:
                print(f"wigtn-ppt: {name} 을(를) 받지 못했습니다 ({exc}). 추정 폭으로 계산합니다.", file=sys.stderr)
            return None
    return found


MARKUP = re.compile(r"(\*\*.+?\*\*|==.+?==)")


def parse_runs(text: str) -> list[tuple[str, bool, bool]]:
    """Split inline markup into (text, bold, accent) runs.

    **x** makes x bold, ==x== colors x with the slide's focal tone.
    """
    runs: list[tuple[str, bool, bool]] = []
    for part in MARKUP.split(text or ""):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            runs.append((part[2:-2], True, False))
        elif part.startswith("==") and part.endswith("==") and len(part) > 4:
            runs.append((part[2:-2], False, True))
        else:
            runs.append((part, False, False))
    return runs


def plain(text: str) -> str:
    return "".join(r[0] for r in parse_runs(text))


class Measurer:
    def __init__(self, fonts: dict[str, Path] | None):
        self.exact = False
        self._adv: dict[bool, tuple[dict[int, int], int]] = {}
        if fonts:
            try:
                from fontTools.ttLib import TTFont
            except ImportError:
                fonts = None
        if fonts:
            for bold, key in ((False, "regular"), (True, "bold")):
                font = TTFont(str(fonts[key]), lazy=True)
                cmap = font.getBestCmap()
                hmtx = font["hmtx"]
                adv = {cp: hmtx[g][0] for cp, g in cmap.items()}
                self._adv[bold] = (adv, font["head"].unitsPerEm)
            self.exact = True

    def char_width(self, ch: str, size: float, bold: bool) -> float:
        if self.exact:
            adv, upm = self._adv[bold]
            units = adv.get(ord(ch))
            if units is None:
                units = upm  # missing glyph: assume a full em
            return units / upm * size
        # Conservative estimate, wider than Pretendard on every class.
        cp = ord(ch)
        if 0xAC00 <= cp <= 0xD7A3 or 0x3000 <= cp <= 0x9FFF or 0x1100 <= cp <= 0x11FF:
            em = 0.92
        elif ch == " ":
            em = 0.3
        elif ch.isupper():
            em = 0.75
        elif ch.isalnum():
            em = 0.64
        else:
            em = 0.62
        return em * size * (1.06 if bold else 1.0)

    def width(self, text: str, size: float, bold: bool = False) -> float:
        total = 0.0
        for run, run_bold, _ in parse_runs(text):
            b = bold or run_bold
            total += sum(self.char_width(ch, size, b) for ch in run)
        return total

    def wrap(self, text: str, size: float, box_width: float, bold: bool = False) -> list[str]:
        """Greedy word wrap the way PowerPoint wraps Korean (at spaces).

        A word longer than the line is broken by character. Returns plain lines.
        """
        limit = box_width * FILL_LIMIT
        lines: list[str] = []
        for para in plain(text).split("\n"):
            # Bold runs inside the paragraph widen it; measure with the markup kept.
            words = para.split(" ")
            line = ""
            for word in words:
                trial = word if not line else f"{line} {word}"
                if self._w(trial, text, size, bold) <= limit:
                    line = trial
                    continue
                if line:
                    lines.append(line)
                    line = ""
                if self._w(word, text, size, bold) <= limit:
                    line = word
                    continue
                for ch in word:  # break an over-long word by character
                    if self._w(line + ch, text, size, bold) <= limit:
                        line += ch
                    else:
                        lines.append(line)
                        line = ch
            lines.append(line)
        return lines

    def _w(self, fragment: str, source: str, size: float, bold: bool) -> float:
        # Bold runs in the source are measured bold even when the fragment is plain.
        bold_words = {w for run, b, _ in parse_runs(source) if b for w in run.split()}
        total = 0.0
        for i, word in enumerate(fragment.split(" ")):
            if i:
                total += self.char_width(" ", size, bold)
            wb = bold or word in bold_words
            total += sum(self.char_width(ch, size, wb) for ch in word)
        return total
