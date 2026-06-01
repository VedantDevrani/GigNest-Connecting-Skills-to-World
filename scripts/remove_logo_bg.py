from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "assets" / "logo.png"
SOURCE = ROOT / ".next" / "dev" / "static" / "media" / "logo.1ae009da.png"
BG = np.array([245.0, 246.0, 250.0])


def saturation(r: np.ndarray, g: np.ndarray, b: np.ndarray) -> np.ndarray:
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    return (max_c - min_c) / (max_c + 1e-6)


def is_gold(r: np.ndarray, g: np.ndarray, b: np.ndarray, sat: np.ndarray) -> np.ndarray:
    return (
        (sat > 0.18)
        & (r > 95)
        & (g > 65)
        & (b < 145)
        & (r >= g * 0.82)
        & ((r - b) > 25)
    )


def is_purple(r: np.ndarray, g: np.ndarray, b: np.ndarray, sat: np.ndarray) -> np.ndarray:
    return (
        (sat > 0.12)
        & (b > 100)
        & (r > 80)
        & (b > g + 12)
        & ((r + b) > g * 1.5)
    )


def dilate(mask: np.ndarray, radius: int = 3) -> np.ndarray:
    out = mask.copy()
    h, w = mask.shape
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dx == 0 and dy == 0:
                continue
            shifted = np.zeros_like(mask)
            y0 = max(0, dy)
            y1 = min(h, h + dy)
            x0 = max(0, dx)
            x1 = min(w, w + dx)
            sy0 = max(0, -dy)
            sy1 = sy0 + (y1 - y0)
            sx0 = max(0, -dx)
            sx1 = sx0 + (x1 - x0)
            shifted[y0:y1, x0:x1] = mask[sy0:sy1, sx0:sx1]
            out |= shifted
    return out


def remove_background(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    r, g, b, _ = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    sat = saturation(r, g, b)
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    logo = is_gold(r, g, b, sat) | is_purple(r, g, b, sat)
    logo = dilate(logo, radius=2)

    dist = np.sqrt((r - BG[0]) ** 2 + (g - BG[1]) ** 2 + (b - BG[2]) ** 2)
    bg_mask = ~logo & (
        (dist < 40)
        | ((lum > 170) & (sat < 0.06))
        | ((lum > 210) & (sat < 0.12))
    )

    alpha = np.where(bg_mask, 0.0, 255.0)
    edge = ~logo & ~bg_mask & (dist < 58)
    alpha = np.where(edge, 255.0 * ((dist - 40.0) / 18.0), alpha)

    out = np.stack([r, g, b, alpha], axis=-1).astype(np.uint8)
    return Image.fromarray(out)


def clean_gold_shadows(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGBA"), dtype=np.float32)
    r, g, b, a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    sat = saturation(r, g, b)
    lum = 0.299 * r + 0.587 * g + 0.114 * b

    gold = is_gold(r, g, b, sat) & (a > 0)
    gold_zone = dilate(gold, radius=8)

    warm_dark = gold_zone & (a > 0) & (r > b * 0.55) & (lum < 170) & (
        (r < 155) | (g < 125) | (lum < 145)
    )
    purple_fringe = gold_zone & (a > 0) & (b > r + 18) & (lum < 170)
    low_sat_gold = gold_zone & (a > 0) & (sat < 0.35) & (lum < 150) & (r > 50)

    fix = warm_dark | purple_fringe | low_sat_gold

    warm_r, warm_g, warm_b = 228.0, 178.0, 68.0
    shadow_r, shadow_g, shadow_b = 198.0, 148.0, 48.0

    depth = np.clip((155.0 - lum) / 110.0, 0.0, 1.0)
    target_r = warm_r + (shadow_r - warm_r) * depth
    target_g = warm_g + (shadow_g - warm_g) * depth
    target_b = warm_b + (shadow_b - warm_b) * depth

    r = np.where(fix, target_r, r)
    g = np.where(fix, target_g, g)
    b = np.where(fix, target_b, b)

    out = np.stack([r, g, b, a], axis=-1).astype(np.uint8)
    return Image.fromarray(out)


def crop_to_content(img: Image.Image, pad: int = 10) -> Image.Image:
    alpha = np.array(img.split()[-1])
    rows = np.any(alpha > 12, axis=1)
    cols = np.any(alpha > 12, axis=0)
    if not rows.any() or not cols.any():
        return img

    top = int(np.argmax(rows))
    bottom = int(len(rows) - np.argmax(rows[::-1]))
    left = int(np.argmax(cols))
    right = int(len(cols) - np.argmax(cols[::-1]))

    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(img.width, right + pad)
    bottom = min(img.height, bottom + pad)
    return img.crop((left, top, right, bottom))


def main() -> None:
    source = SOURCE if SOURCE.exists() else OUTPUT
    img = Image.open(source)
    result = remove_background(img)
    result = clean_gold_shadows(result)
    result = crop_to_content(result)
    result.save(OUTPUT, optimize=True)
    print(f"Saved: {OUTPUT} ({result.size[0]}x{result.size[1]})")


if __name__ == "__main__":
    main()
