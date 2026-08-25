#!/usr/bin/env python3
"""Turn any image into a post cover: center-crop to 21:9, resize to 1680x720,
optimize, and save as <bundle>/cover.jpg.

Works with any format `sips` reads (jpg, png, webp, heic, tiff, bmp, gif...).
Both EN and ZH share the bundle's cover.jpg, so one command covers both.

Usage:
  python3 scripts/make-cover.py ~/Downloads/photo.jpg how-rocksdb-works
"""

import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "posts"
OUT_SIZE = (1680, 720)  # 21:9 canonical cover ratio
QUALITY = "80"


def die(msg):
    sys.exit(f"error: {msg}")


def sips(*args):
    return subprocess.run(["sips", *args], check=True, capture_output=True, text=True)


def dimensions(path):
    out = sips("-g", "pixelWidth", "-g", "pixelHeight", str(path)).stdout
    w = re.search(r"pixelWidth:\s*(\d+)", out)
    h = re.search(r"pixelHeight:\s*(\d+)", out)
    if not (w and h):
        die(f"could not read dimensions of {path}")
    return int(w.group(1)), int(h.group(1))


def main():
    if len(sys.argv) != 3:
        die(f"usage: {sys.argv[0]} <image> <post-slug>")
    src, slug = Path(sys.argv[1]).expanduser(), sys.argv[2]

    if not src.is_file():
        die(f"image not found: {src}")
    bundle = POSTS / slug
    if not bundle.is_dir():
        die(f"unknown post slug: {slug} (no folder {bundle})")

    w, h = dimensions(src)
    target = OUT_SIZE[0] / OUT_SIZE[1]
    crop = None
    if w / h > target + 1e-6:  # too wide → trim width
        crop = (h, round(h * target))
    elif w / h < target - 1e-6:  # too tall → trim height
        crop = (round(w / target), w)

    out = bundle / "cover.jpg"
    with tempfile.NamedTemporaryFile(suffix=src.suffix or ".img") as tmp:
        work = Path(tmp.name)
        shutil.copy(src, work)  # sips edits in place — always work on a copy
        if crop:
            sips("--cropToHeightWidth", str(crop[0]), str(crop[1]), str(work))
        sips(
            "--resampleHeightWidth", str(OUT_SIZE[1]), str(OUT_SIZE[0]), str(work)
        )
        sips(
            "-s", "format", "jpeg", "-s", "formatOptions", QUALITY,
            str(work), "--out", str(out),
        )

    note = ""
    if w < OUT_SIZE[0]:
        note = f" (source is only {w}px wide — will be upscaled; a larger image would look crisper)"
    print(f"✓ {out.relative_to(ROOT)}  ({w}x{h} → {OUT_SIZE[0]}x{OUT_SIZE[1]}){note}")


if __name__ == "__main__":
    main()
