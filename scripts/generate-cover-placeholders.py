#!/usr/bin/env python3
"""Generate abstract cover images (1680x720, 21:9) for post bundles.

Each post bundle gets a `cover.jpg` in a muted palette that fits the site's
mauve accent: a soft duotone base with glowing color blobs and subtle grain.
These work as real covers, not just placeholders — replace any of them by
dropping a new image into the bundle folder (see scripts/make-cover.py).

Usage:
  python3 scripts/generate-cover-placeholders.py            # all posts
  python3 scripts/generate-cover-placeholders.py how-rocksdb-works

Requires macOS `sips` for BMP→JPG conversion (present on every macOS).
"""

import random
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "posts"
SIZE = (1680, 720)  # 21:9 canonical cover ratio (theme srcset tops out at 1500w)
FIELD_SCALE = 4  # blob field rendered at 1/4 size then bilinear-upscaled (blobs are smooth)
GRAIN = 7  # peak luminance noise amplitude (±GRAIN/2)

# slug -> base duotone (top-left, bottom-right) + blob accent colors + jitter seed
PALETTES = {
    "building-a-programmer-personality-test": {
        "base": ("8E6E85", "C9AD9C"),  # mauve → clay
        "blobs": ("D9B8A6", "6E4E66", "E8D5C0", "B07A98"),
        "seed": 1,
    },
    "favorite-personal-websites": {
        "base": ("5F6B8C", "B08E9E"),  # slate → dusty pink
        "blobs": ("8FA3C4", "C4A0B8", "46527A", "D8C0C8"),
        "seed": 2,
    },
    "how-rocksdb-works": {
        "base": ("4A5D6E", "93A6A0"),  # steel → sage mist
        "blobs": ("7A98A8", "A8C0B0", "3A4A5E", "C8D4C4"),
        "seed": 3,
    },
    "linux-disk-bug-triage": {
        "base": ("6B5D57", "C4B49A"),  # taupe → sand
        "blobs": ("A89478", "8A6E5E", "D8C8A8", "5E4E48"),
        "seed": 4,
    },
    "sorting-algorithms-interview-reference": {
        "base": ("756A83", "D8CFC0"),  # grey violet → bone
        "blobs": ("9A8CA8", "B8A890", "5E5468", "E0D4C0"),
        "seed": 5,
    },
    "why-i-built-this-blog": {
        "base": ("96687A", "DCC3AE"),  # berry → apricot cream
        "blobs": ("C898A0", "E8CCA8", "78505E", "E8D8C0"),
        "seed": 6,
    },
}

# fractional blob anchor spots (x, y); each post jitters these with its seed
BLOB_SPOTS = ((0.20, 0.28), (0.80, 0.22), (0.62, 0.78), (0.14, 0.82), (0.92, 0.72))
BLOB_SIGMA = (0.42, 0.55, 0.38, 0.50, 0.36)  # gaussian sigma as fraction of field height
BLOB_WEIGHT = (0.80, 0.70, 0.75, 0.60, 0.65)  # blend strength, kept < 1 so base shows through


def hex_to_rgb(h):
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def lerp(a, b, t):
    return a + (b - a) * t


def render_pixels(w, h, base, blob_colors, seed):
    """Diagonal duotone base + gaussian glow blobs + grain, as BGR rows for BMP."""
    rng = random.Random(seed)
    sw, sh = max(2, w // FIELD_SCALE), max(2, h // FIELD_SCALE)

    # blobs: (cx, cy, sigma, weight, color) in small-field pixel space
    blobs = []
    for i, color in enumerate(blob_colors):
        sx, sy = BLOB_SPOTS[i % len(BLOB_SPOTS)]
        cx = (sx + rng.uniform(-0.06, 0.06)) * sw
        cy = (sy + rng.uniform(-0.06, 0.06)) * sh
        sigma = BLOB_SIGMA[i % len(BLOB_SIGMA)] * sh
        blobs.append((cx, cy, sigma, BLOB_WEIGHT[i % len(BLOB_WEIGHT)], hex_to_rgb(color)))

    # small-scale composite field (smooth, cheap)
    small = []
    for y in range(sh):
        fy = y / (sh - 1)
        row = []
        for x in range(sw):
            t = (x / (sw - 1) + fy) / 2
            px = [lerp(base[0][c], base[1][c], t) for c in range(3)]
            for cx, cy, sigma, weight, color in blobs:
                d2 = (x - cx) ** 2 + (y - cy) ** 2
                g = weight * pow(2.718281828, -d2 / (2 * sigma * sigma))
                for c in range(3):
                    px[c] = lerp(px[c], color[c], g)
            row.append(px)
        small.append(row)

    # bilinear upscale to full size + grain, emit as BMP rows (BGR, bottom-up)
    noise = rng.random
    half = GRAIN / 2
    rows = []
    for y in range(h):
        syf = y / (h - 1) * (sh - 1)
        y0 = int(syf)
        y1 = min(y0 + 1, sh - 1)
        wy = syf - y0
        row = bytearray()
        for x in range(w):
            sxf = x / (w - 1) * (sw - 1)
            x0 = int(sxf)
            x1 = min(x0 + 1, sw - 1)
            wx = sxf - x0
            grain = (noise() - 0.5) * GRAIN
            for c in range(3):
                v = (
                    lerp(
                        lerp(small[y0][x0][c], small[y0][x1][c], wx),
                        lerp(small[y1][x0][c], small[y1][x1][c], wx),
                        wy,
                    )
                    + grain
                )
                row.append(max(0, min(255, int(v + 0.5))))
        rows.append(bytes(row))
    rows.reverse()  # BMP bottom-up
    return rows


def write_bmp(path, rows, w, h):
    row_bytes = len(rows[0])
    padding = (4 - (w * 3) % 4) % 4
    if padding:  # BMP rows must be 4-byte aligned; 1680*3 is already aligned but stay safe
        padded = []
        for r in rows:
            padded.append(r + b"\x00" * padding)
        rows = padded
    pixel_size = (row_bytes + padding) * h
    header = b"BM" + struct.pack(
        "<IHHI", 54 + pixel_size, 0, 0, 54
    ) + struct.pack("<IiiHHIIiiII", 40, w, h, 1, 24, 0, pixel_size, 2835, 2835, 0, 0)
    path.write_bytes(header + b"".join(rows))


def to_jpg(bmp_path, jpg_path):
    subprocess.run(
        [
            "sips", "-s", "format", "jpeg", "-s", "formatOptions", "80",
            str(bmp_path), "--out", str(jpg_path),
        ],
        check=True,
        capture_output=True,
    )


def main():
    slugs = sys.argv[1:] or list(PALETTES)
    for slug in slugs:
        if slug not in PALETTES:
            sys.exit(f"Unknown slug: {slug}. Known: {', '.join(PALETTES)}")
        bundle = POSTS / slug
        if not bundle.is_dir():
            sys.exit(f"Missing bundle folder: {bundle}")

        spec = PALETTES[slug]
        rows = render_pixels(
            *SIZE, (hex_to_rgb(spec["base"][0]), hex_to_rgb(spec["base"][1])),
            spec["blobs"], spec["seed"],
        )
        with tempfile.NamedTemporaryFile(suffix=".bmp") as tmp:
            write_bmp(Path(tmp.name), rows, *SIZE)
            out = bundle / "cover.jpg"
            to_jpg(tmp.name, out)
        print(f"✓ {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
