#!/usr/bin/env python3
"""wigtn-ppt: deck.json → checked storyline → editable .pptx → PNG review.

  deck.py check   deck.json [--story]        storyline (+ layout) checks; exit 1 on any error
  deck.py outline deck.json [-o out.md]      the storyline as one table, for review
  deck.py build   deck.json [-o deck.pptx] [--theme NAME|PATH]
  deck.py render  deck.pptx [-o DIR]         PDF + one PNG per slide + contact sheets
  deck.py svg2png in.svg out.png [--scale 3]

Run with the dependencies on hand:
  uv run --with python-pptx --with fonttools python deck.py ...
or install them once: python3 -m pip install python-pptx fonttools

Exit codes: 0 ok, 1 checks failed (nothing written), 2 bad input or missing tool.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
sys.path.insert(0, str(HERE))

import fonts  # noqa: E402
import layout  # noqa: E402
import story  # noqa: E402


def fail(msg: str, code: int = 2):
    print(f"wigtn-ppt: {msg}", file=sys.stderr)
    sys.exit(code)


def load_deck(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"파일이 없습니다: {path}")
    except json.JSONDecodeError as exc:
        fail(f"{path.name}의 JSON이 깨졌습니다: {exc}")


def load_theme(name_or_path: str) -> dict:
    p = Path(name_or_path).expanduser()
    if not p.suffix:
        p = SKILL / "themes" / f"{name_or_path}.json"
    if not p.is_file():
        names = ", ".join(sorted(x.stem for x in (SKILL / "themes").glob("*.json")))
        fail(f"테마를 찾지 못했습니다: {name_or_path} (내장 테마: {names}, 또는 테마 JSON 경로)")
    theme = json.loads(p.read_text(encoding="utf-8"))
    need = {"bg", "surface", "text", "text2", "muted", "line", "accent", "risk", "chart_base", "on_accent"}
    missing = need - set(theme.get("colors", {}))
    if missing:
        fail(f"테마 {p.name}에 색이 빠졌습니다: {', '.join(sorted(missing))}")
    theme["_path"] = p
    return theme


def report(errors, warnings) -> None:
    for w in warnings:
        print(f"  경고  {w}")
    for e in errors:
        print(f"  오류  {e}")
    print(f"오류 {len(errors)}개, 경고 {len(warnings)}개")


def measurer(quiet=False):
    paths = fonts.ensure_fonts(quiet=quiet)
    m = fonts.Measurer(paths)
    if not m.exact and not quiet:
        print("  참고  실제 글꼴 폭 대신 보수적인 추정으로 줄바꿈을 계산했습니다 (fontTools 또는 글꼴 없음)")
    return m


def lay_out(deck: dict, theme: dict, m, base_dir: Path):
    ctx = layout.Ctx(deck=deck, theme=theme, measure=m, base_dir=base_dir)
    pages = []
    for i, s in enumerate(deck.get("slides") or [], 1):
        ctx.index, ctx.slide_id = i, s.get("id", "")
        name = s.get("layout") or layout.DEFAULT_LAYOUT.get(s.get("role"))
        fn = layout.LAYOUTS.get(name)
        if fn is None:
            ctx.err("layout", f"알 수 없는 layout: {name!r} (쓸 수 있는 것: {', '.join(layout.LAYOUTS)})")
            pages.append(([], s))
            continue
        items = fn(ctx, s)
        layout.check_geometry(ctx, items)
        pages.append((items, s))
    return ctx, pages


def speaker_notes(deck: dict, i: int) -> str:
    slides = deck["slides"]
    s = slides[i]
    parts = []
    if s.get("notes"):
        parts.append(s["notes"])
    if i + 1 < len(slides) and slides[i + 1].get("answers"):
        parts.append(f"넘어가는 말: {slides[i + 1]['answers']}")
    minutes = (deck.get("meta") or {}).get("minutes")
    if minutes and i == 0:
        parts.append(f"전체 {minutes}분 · {len(slides)}장")
    return "\n\n".join(parts)


# ── commands ────────────────────────────────────────────────────────────────

def cmd_check(args) -> int:
    path = Path(args.deck)
    deck = load_deck(path)
    m = measurer()
    errors, warnings = story.check(deck, m, stage="story" if args.story else "build")
    if not args.story:
        theme = load_theme(args.theme or (deck.get("meta") or {}).get("theme", "wigtn-light"))
        ctx, _ = lay_out(deck, theme, m, path.parent)
        errors += ctx.errors
        warnings += ctx.warnings
    report(errors, warnings)
    return 1 if errors else 0


def cmd_outline(args) -> int:
    deck = load_deck(Path(args.deck))
    story.check(deck, fonts.Measurer(None), stage="story")  # fills inherited stages
    text = story.outline(deck)
    if args.out:
        Path(args.out).write_text(text + "\n", encoding="utf-8")
        print(f"outline: {args.out}")
    else:
        print(text)
    return 0


def cmd_build(args) -> int:
    path = Path(args.deck).resolve()
    deck = load_deck(path)
    theme = load_theme(args.theme or (deck.get("meta") or {}).get("theme", "wigtn-light"))
    m = measurer()
    errors, warnings = story.check(deck, m, stage="build")
    ctx, pages = lay_out(deck, theme, m, path.parent)
    errors += ctx.errors
    warnings += ctx.warnings
    if errors:
        report(errors, warnings)
        print("빌드하지 않았습니다. 오류를 고친 뒤 다시 실행하세요.")
        return 1
    try:
        from writer import Writer
    except ImportError as exc:
        fail(f"python-pptx가 필요합니다 ({exc}). uv run --with python-pptx --with fonttools python deck.py build ...")
    out = Path(args.out) if args.out else path.with_suffix(".pptx")
    cache = path.parent / ".wigtn-ppt"
    logo_dirs = [path.parent, SKILL / "assets" / "logo", Path.cwd() / "docs" / "images"]
    writer = Writer(theme, ctx, logo_dirs, lambda svg: svg_to_png(svg, cache / (svg.stem + ".png"), 3), cache)
    for i, (items, _s) in enumerate(pages):
        ctx.index, ctx.slide_id = i + 1, _s.get("id", "")
        writer.add_slide(items, speaker_notes(deck, i))
    if ctx.errors:
        report(ctx.errors, warnings)
        print("빌드하지 않았습니다.")
        return 1
    writer.save(out)
    report([], warnings)
    print(f"pptx: {out}  ({len(pages)}장, 테마 {theme.get('name')}, 글꼴 {theme.get('fonts', {}).get('family')})")
    return 0


def soffice_bin() -> str | None:
    for c in ("soffice", "libreoffice", "/Applications/LibreOffice.app/Contents/MacOS/soffice"):
        p = shutil.which(c) or (c if Path(c).is_file() else None)
        if p:
            return p
    return None


def cmd_render(args) -> int:
    src = Path(args.pptx).resolve()
    if not src.is_file():
        fail(f"파일이 없습니다: {src}")
    office = soffice_bin()
    if not office:
        fail("LibreOffice(soffice)가 없어 PNG로 렌더하지 못합니다. PowerPoint나 Keynote에서 열어 확인하세요.")
    if not shutil.which("pdftoppm"):
        fail("pdftoppm(poppler)이 없어 PDF를 PNG로 나누지 못합니다. brew install poppler")
    out = Path(args.out).resolve() if args.out else src.parent / f"{src.stem}-render"
    out.mkdir(parents=True, exist_ok=True)
    # A private LibreOffice profile whose user/fonts holds Pretendard, so the render
    # uses the deck's font without installing anything system-wide.
    profile = fonts.cache_dir() / "lo-profile"
    font_dir = profile / "user" / "fonts"
    font_dir.mkdir(parents=True, exist_ok=True)
    for p in (fonts.ensure_fonts() or {}).values():
        target = font_dir / p.name
        if not target.exists():
            shutil.copy2(p, target)
    cmd = [office, f"-env:UserInstallation={profile.as_uri()}", "--headless", "--convert-to", "pdf",
           "--outdir", str(out), str(src)]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    pdf = out / f"{src.stem}.pdf"
    if res.returncode != 0 or not pdf.is_file():
        fail(f"LibreOffice 변환 실패: {res.stderr.strip() or res.stdout.strip()}")
    for old in out.glob("slide-*.png"):
        old.unlink()
    subprocess.run(["pdftoppm", "-r", "96", "-png", str(pdf), str(out / "slide")], check=True)
    pngs = sorted(out.glob("slide-*.png"))
    sheets = contact_sheets(pngs, out)
    print(f"pdf: {pdf}")
    print(f"png: {out}/slide-NN.png ({len(pngs)}장)")
    for s in sheets:
        print(f"sheet: {s}")
    return 0


def contact_sheets(pngs: list[Path], out: Path, per=12, cols=3, tw=480) -> list[Path]:
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        return []
    for old in out.glob("sheet-*.png"):
        old.unlink()
    th = int(tw * 9 / 16)
    sheets = []
    for k in range(0, len(pngs), per):
        group = pngs[k:k + per]
        rows = (len(group) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * (tw + 16) + 16, rows * (th + 36) + 16), "#d9d9de")
        draw = ImageDraw.Draw(sheet)
        for j, p in enumerate(group):
            with Image.open(p) as im:
                thumb = im.convert("RGB").resize((tw, th))
            cx, cy = 16 + (j % cols) * (tw + 16), 16 + (j // cols) * (th + 36)
            sheet.paste(thumb, (cx, cy + 20))
            draw.text((cx, cy + 2), f"{k + j + 1}", fill="#1e1e28")
        path = out / f"sheet-{k // per + 1}.png"
        sheet.save(path)
        sheets.append(path)
    return sheets


def svg_size(svg: Path) -> tuple[float, float]:
    head = svg.read_text(encoding="utf-8", errors="ignore")[:4000]
    def num(attr):
        m = re.search(rf'\b{attr}="([\d.]+)(px)?"', head)
        return float(m.group(1)) if m else None
    w, h = num("width"), num("height")
    if not (w and h):
        m = re.search(r'viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"', head)
        if m:
            w, h = float(m.group(1)), float(m.group(2))
    return (w or 800.0), (h or 600.0)


def chrome_bin() -> str | None:
    env = os.environ.get("CHROME")
    cands = [env] if env else []
    cands += ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Chromium.app/Contents/MacOS/Chromium", "google-chrome", "chromium", "chromium-browser"]
    for c in cands:
        if not c:
            continue
        p = shutil.which(c) or (c if Path(c).is_file() else None)
        if p:
            return p
    return None


def svg_to_png(svg: Path, out: Path, scale: float = 3) -> Path | None:
    """Rasterize an SVG for the PNG fallback: rsvg-convert, then headless Chrome."""
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.is_file() and out.stat().st_mtime >= svg.stat().st_mtime:
        return out
    w, h = svg_size(svg)
    if shutil.which("rsvg-convert"):
        r = subprocess.run(["rsvg-convert", "-z", str(scale), "-o", str(out), str(svg)], capture_output=True)
        if r.returncode == 0 and out.is_file():
            return out
    chrome = chrome_bin()
    if chrome:
        with tempfile.TemporaryDirectory() as tmp:
            page = Path(tmp) / "page.html"
            page.write_text(
                f'<!doctype html><html><body style="margin:0;background:transparent">'
                f'<img src="{svg.resolve().as_uri()}" style="display:block;width:{w}px;height:{h}px"></body></html>',
                encoding="utf-8")
            r = subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                                f"--user-data-dir={tmp}/profile", "--default-background-color=00000000",
                                f"--force-device-scale-factor={scale}", f"--window-size={int(w)},{int(h)}",
                                f"--screenshot={out}", page.as_uri()], capture_output=True, timeout=120)
            if r.returncode == 0 and out.is_file():
                return out
    return None


def cmd_svg2png(args) -> int:
    out = svg_to_png(Path(args.svg), Path(args.png), args.scale)
    if not out:
        fail("SVG를 PNG로 바꾸지 못했습니다. rsvg-convert(brew install librsvg)나 Chrome이 필요합니다.")
    print(f"png: {out}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(prog="deck.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("check")
    p.add_argument("deck")
    p.add_argument("--story", action="store_true", help="이야기 검사만 (layout 없이)")
    p.add_argument("--theme")
    p.set_defaults(fn=cmd_check)
    p = sub.add_parser("outline")
    p.add_argument("deck")
    p.add_argument("-o", "--out")
    p.set_defaults(fn=cmd_outline)
    p = sub.add_parser("build")
    p.add_argument("deck")
    p.add_argument("-o", "--out")
    p.add_argument("--theme")
    p.set_defaults(fn=cmd_build)
    p = sub.add_parser("render")
    p.add_argument("pptx")
    p.add_argument("-o", "--out")
    p.set_defaults(fn=cmd_render)
    p = sub.add_parser("svg2png")
    p.add_argument("svg")
    p.add_argument("png")
    p.add_argument("--scale", type=float, default=3)
    p.set_defaults(fn=cmd_svg2png)
    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
