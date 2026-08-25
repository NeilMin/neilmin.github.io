#!/usr/bin/env python3
"""Generate abstract cover art via a local ComfyUI server (default :8188).

Queues a txt2img job per post slug, waits for it, saves the PNG to /tmp,
ready to install with scripts/make-cover.py.

Usage:
  python3 scripts/comfyui-generate-cover.py [--model flux|sdxl] <slug> [more...]
"""

import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COMFY = "http://localhost:8188"
SIZE = (1680, 720)  # 21:9 final cover size, divisible by 16 for flux latents
SDXL_SIZE = (1344, 576)  # SDXL-friendly 21:9 bucket (upscaled 1.25x by make-cover)

POS_BASE = (
    # style only — each post's SCENES entry owns its own color world so the
    # covers vary instead of reading as one uniform series
    "soft diffused natural light, subtle film grain, calm serene elegant mood, high detail"
)
NEGATIVE = (
    "text, letters, words, watermark, signature, logo, people, faces, hands, "
    "oversaturated, neon colors, busy, cluttered, harsh contrast, frame, border, "
    "plain gradient background, solid color, abstract gradient"
)

# per-post scene + palette, drawn from each article's theme
SCENES = {
    "building-a-programmer-personality-test":
        "a row of cute yellow rubber ducks on a wooden shelf, each wearing a different tiny accessory like glasses or a tiny hat, deep teal background, warm amber light",
    "favorite-personal-websites":
        "an open scrapbook album with vintage postcards, stamps and photographs spread across a wooden table, warm window light, sage green and terracotta tones",
    "how-rocksdb-works":
        "minimalist landscape photograph of layered sedimentary rock strata cliff, soft geological layers, morning haze, dusty rose, sage and cream tones",
    "linux-disk-bug-triage":
        "an opened mechanical hard disk drive with its shiny circular platter and actuator arm exposed, precision screwdriver beside it, on a workbench, top-down view, graphite grey, steel blue and copper tones",
    "sorting-algorithms-interview-reference":
        "a row of wooden thread spools with cotton thread in slate blue, cream, sand and grey tones, on a light wooden table, soft studio light, shallow depth of field",
    "why-i-built-this-blog":
        "an open notebook, a steaming cup of tea and a small teapot on a desk by a window at dawn, golden peach and warm ivory tones, soft morning glow",
}
SEED_BASE = 1000


def sdxl_workflow(slug, seed, scene):
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "realvisxlV50.safetensors"}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": f"{POS_BASE}, {scene}", "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": NEGATIVE, "clip": ["1", 1]}},
        "4": {"class_type": "EmptyLatentImage", "inputs": {"width": SDXL_SIZE[0], "height": SDXL_SIZE[1], "batch_size": 1}},
        "5": {"class_type": "KSampler", "inputs": {
            "seed": seed, "steps": 30, "cfg": 5.0, "sampler_name": "euler_ancestral",
            "scheduler": "karras", "denoise": 1.0,
            "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"images": ["6", 0], "filename_prefix": f"cover-{slug}-sdxl"}},
    }


def flux_workflow(slug, seed, scene):
    prompt = f"{POS_BASE}, {scene}"
    return {
        "1": {"class_type": "UnetLoaderGGUF", "inputs": {"unet_name": "flux1-schnell-Q8_0.gguf"}},
        "2": {"class_type": "DualCLIPLoader", "inputs": {
            "clip_name1": "clip_l.safetensors", "clip_name2": "t5xxl_fp8_e4m3fn.safetensors",
            "type": "flux", "device": "default"}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["2", 0]}},
        "4": {"class_type": "ConditioningZeroOut", "inputs": {"conditioning": ["3", 0]}},
        "5": {"class_type": "EmptySD3LatentImage", "inputs": {"width": SIZE[0], "height": SIZE[1], "batch_size": 1}},
        "6": {"class_type": "KSampler", "inputs": {
            "seed": seed, "steps": 4, "cfg": 1.0, "sampler_name": "euler",
            "scheduler": "simple", "denoise": 1.0,
            "model": ["1", 0], "positive": ["3", 0], "negative": ["4", 0], "latent_image": ["5", 0]}},
        "7": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "8": {"class_type": "VAEDecode", "inputs": {"samples": ["6", 0], "vae": ["7", 0]}},
        "9": {"class_type": "SaveImage", "inputs": {"images": ["8", 0], "filename_prefix": f"cover-{slug}-flux"}},
    }


def queue_and_wait(wf):
    req = urllib.request.Request(
        f"{COMFY}/prompt",
        json.dumps({"prompt": wf}).encode(),
        {"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read())
    prompt_id = body["prompt_id"]
    while True:
        time.sleep(2)
        with urllib.request.urlopen(f"{COMFY}/history/{prompt_id}", timeout=30) as resp:
            history = json.loads(resp.read())
        if prompt_id in history:
            entry = history[prompt_id]
            for node_out in entry.get("outputs", {}).values():
                for img in node_out.get("images", []):
                    return img
            status = entry.get("status", {})
            if status.get("status_str") == "error":
                sys.exit(f"ComfyUI reported an error for prompt {prompt_id}: {json.dumps(status)[:500]}")


def fetch(img, dest):
    url = f"{COMFY}/view?{urllib.parse.urlencode(img)}"
    urllib.request.urlretrieve(url, dest)


def main():
    args = sys.argv[1:]
    model = "sdxl"  # default: RealVisXL won the A/B vs flux-schnell (better prompt adherence + texture)
    scene_override = None
    if args and args[0] == "--model":
        model = args[1]
        args = args[2:]
    if args and args[0] == "--scene":
        scene_override = args[1]
        args = args[2:]
    slugs = args
    if not slugs:
        sys.exit(f"usage: {sys.argv[0]} [--model flux|sdxl] [--scene \"...\"] <slug> [more...]\nknown: {', '.join(SCENES)}")

    build = flux_workflow if model == "flux" else sdxl_workflow
    for i, slug in enumerate(slugs):
        scene = scene_override or SCENES.get(slug)
        if not scene:
            sys.exit(f"unknown slug: {slug}. known: {', '.join(SCENES)} (or pass --scene)")
        seed = SEED_BASE + i
        print(f"… [{model}] {slug} (seed {seed}){'' if not scene_override else ' · custom scene'}", flush=True)
        img = queue_and_wait(build(slug, seed, scene))
        dest = Path(f"/tmp/comfy-cover-{slug}-{model}.png")
        fetch(img, dest)
        print(f"✓ {dest}", flush=True)
    print(f"\ninstall with: python3 scripts/make-cover.py /tmp/comfy-cover-<slug>-{model}.png <slug>")


if __name__ == "__main__":
    main()
