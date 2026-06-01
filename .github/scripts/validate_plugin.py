#!/usr/bin/env python3
"""Validate WIGTN plugin manifests against the filesystem and each other.

Guards the count/version drift class of bugs: stated counts in descriptions,
plugin.json arrays, and the actual files on disk must all agree, and the
version must be consistent across manifests. Exits non-zero on any mismatch.

Run locally: python3 .github/scripts/validate_plugin.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parents[2]
MARKETPLACE = ROOT / ".claude-plugin" / "marketplace.json"

errors: List[str] = []


def load_json(path: Path) -> dict:
    """Load JSON, recording a fatal error if it is missing or malformed."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        errors.append(f"{path.relative_to(ROOT)}: file not found")
    except json.JSONDecodeError as exc:
        errors.append(f"{path.relative_to(ROOT)}: invalid JSON — {exc}")
    return {}


def count_dir(path: Path, pattern: str) -> int:
    """Count entries matching a glob; 0 if the directory is absent."""
    return len(list(path.glob(pattern))) if path.is_dir() else 0


def stated_counts(text: str) -> dict:
    """Extract 'N agents | commands | skills' counts from a description string."""
    found = {}
    for kind in ("agents", "commands", "skills"):
        match = re.search(rf"(\d+)\s+{kind}", text)
        if match:
            found[kind] = int(match.group(1))
    return found


def check_plugin(source: Path, mkt_version: str) -> None:
    """Validate one plugin's manifest, arrays, file counts, and version."""
    rel = source.relative_to(ROOT)
    manifest = source / ".claude-plugin" / "plugin.json"
    data = load_json(manifest)
    if not data:
        return

    actual: dict = {
        "agents": count_dir(source / "agents", "*.md"),
        "commands": count_dir(source / "commands", "*.md"),
        "skills": len([p for p in (source / "skills").glob("*") if p.is_dir()])
        if (source / "skills").is_dir()
        else 0,
    }

    # plugin.json arrays must match the files on disk.
    for kind in ("agents", "commands", "skills"):
        listed = len(data.get(kind, []))
        if listed != actual[kind]:
            errors.append(
                f"{rel}: plugin.json lists {listed} {kind} "
                f"but {actual[kind]} exist on disk"
            )

    # Stated counts in plugin.json description must match reality.
    for kind, n in stated_counts(data.get("description", "")).items():
        if n != actual[kind]:
            errors.append(
                f"{rel}: description says {n} {kind} but {actual[kind]} exist"
            )

    # Version must agree with the marketplace entry (when present).
    plugin_version = data.get("version")
    if plugin_version and mkt_version and plugin_version != mkt_version:
        errors.append(
            f"{rel}: plugin.json version {plugin_version} != "
            f"marketplace version {mkt_version}"
        )

    return actual


def main() -> int:
    mkt = load_json(MARKETPLACE)
    if not mkt:
        print_report()
        return 1

    mkt_meta_version = mkt.get("metadata", {}).get("version", "")
    last_actual: dict = {}

    for entry in mkt.get("plugins", []):
        source = (ROOT / entry["source"]).resolve()
        entry_version = entry.get("version", "")
        if entry_version and mkt_meta_version and entry_version != mkt_meta_version:
            errors.append(
                f"marketplace.json: plugin '{entry.get('name')}' version "
                f"{entry_version} != metadata version {mkt_meta_version}"
            )
        actual = check_plugin(source, entry_version or mkt_meta_version)

        # Stated counts in the marketplace description must match reality too.
        if actual:
            last_actual[entry.get("name")] = actual
            for kind, n in stated_counts(entry.get("description", "")).items():
                if n != actual[kind]:
                    errors.append(
                        f"marketplace.json: plugin '{entry.get('name')}' "
                        f"description says {n} {kind} but {actual[kind]} exist"
                    )
            for kind, n in stated_counts(
                mkt.get("metadata", {}).get("description", "")
            ).items():
                if n != actual[kind]:
                    errors.append(
                        f"marketplace.json: metadata description says {n} {kind} "
                        f"but {actual[kind]} exist"
                    )

    # Root-level .claude-plugin/plugin.json (top manifest, no arrays) must also
    # agree on version and stated counts. It has no source, so validate it
    # against the single plugin's actuals when there is exactly one plugin.
    root_plugin = ROOT / ".claude-plugin" / "plugin.json"
    if root_plugin.exists() and len(last_actual) == 1:
        rp = load_json(root_plugin)
        actual = next(iter(last_actual.values()))
        rp_version = rp.get("version")
        if rp_version and mkt_meta_version and rp_version != mkt_meta_version:
            errors.append(
                f".claude-plugin/plugin.json: version {rp_version} != "
                f"marketplace version {mkt_meta_version}"
            )
        for kind, n in stated_counts(rp.get("description", "")).items():
            if n != actual[kind]:
                errors.append(
                    f".claude-plugin/plugin.json: description says {n} {kind} "
                    f"but {actual[kind]} exist"
                )

    print_report()
    return 1 if errors else 0


def print_report() -> None:
    if errors:
        print("Plugin validation FAILED:\n")
        for err in errors:
            print(f"  ✗ {err}")
        print(f"\n{len(errors)} problem(s). See .github/scripts/validate_plugin.py")
    else:
        print("Plugin validation passed — manifests, counts, and version agree.")


if __name__ == "__main__":
    sys.exit(main())
