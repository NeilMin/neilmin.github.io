# Cover Image Prompt Templates

Target: **21:9 landscape, ≥1680px wide** (canonical cover size is 1680×720).
Site palette: muted mauve / dusty rose / sage / sand — soft, calm, abstract works best
for posts that may have nothing to do with the image (diary/essay style).

Workflow: generate with any tool → save anywhere → `python3 scripts/make-cover.py <image> <slug>`.

## Midjourney

```
abstract soft gradient landscape, muted mauve and dusty rose tones, gentle glowing
color blobs, subtle film grain, minimal, calm, no text --ar 21:9 --v 6
```

Swap the style line for variety:

- Photographic: `minimal still life photography, soft morning light, muted mauve and sand tones, shallow depth of field, no text --ar 21:9`
- 3D shapes: `soft 3D abstract shapes, matte clay texture, dusty rose and sage palette, studio lighting, minimal, no text --ar 21:9`
- Nature: `misty mountain ridge at dawn, muted desaturated tones, minimal composition, film photography, no text --ar 21:9`

## DALL·E / ChatGPT

No `--ar` flag — ask for landscape in words, then let `make-cover.py` fix the ratio:

```
A wide landscape abstract image (aim for the widest format available): soft gradient
with muted mauve, dusty rose and sage tones, gentle glowing blobs, subtle grain,
minimal and calm, absolutely no text or letters.
```

## 即梦 / 豆包（中文）

```
抽象柔和渐变风景，莫兰迪色调：灰紫、豆沙玫瑰、鼠尾草绿、沙色，柔和光斑，
细腻胶片颗粒，极简、安静，画面中不要出现任何文字。比例选最宽的（21:9 或横版）。
```

## Rules of thumb

- **No text in the image** — text gets cropped and looks broken; titles live in the card.
- Busy photos are fine on the list (heavy crop) but check the single-page view too.
- Anything ≥1680px wide avoids upscaling; `make-cover.py` warns if smaller.
- After swapping a cover, consider updating that post's `alt` frontmatter to describe it.
