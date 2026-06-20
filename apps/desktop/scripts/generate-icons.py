#!/usr/bin/env python3

from __future__ import annotations

import math
import shutil
import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SRC_ASSETS = ROOT / "src" / "assets"
PUBLIC = ROOT / "public"
PUBLIC_ICONS = PUBLIC / "icons"
APP_ICONS = SRC_ASSETS / "icons"
ICONSET = APP_ICONS / "icon.iconset"

MASTER_SIZE = 1024

BG_A = (18, 20, 26)
BG_B = (32, 37, 52)
GLYPH_A = (248, 250, 255)
GLYPH_B = (228, 234, 248)
ACCENT_A = (52, 228, 255)
ACCENT_B = (90, 139, 255)


def clamp(value: float, min_value: float = 0.0, max_value: float = 1.0) -> float:
    return max(min_value, min(max_value, value))


def mix(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def mix_rgb(c0: tuple[int, int, int], c1: tuple[int, int, int], t: float) -> tuple[float, float, float]:
    return (
        mix(c0[0], c1[0], t),
        mix(c0[1], c1[1], t),
        mix(c0[2], c1[2], t),
    )


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    if edge0 == edge1:
        return 0.0
    t = clamp((x - edge0) / (edge1 - edge0))
    return t * t * (3.0 - 2.0 * t)


def distance_to_segment(px: float, py: float, ax: float, ay: float, bx: float, by: float) -> float:
    vx = bx - ax
    vy = by - ay
    wx = px - ax
    wy = py - ay
    c1 = wx * vx + wy * vy
    if c1 <= 0:
        return math.hypot(px - ax, py - ay)
    c2 = vx * vx + vy * vy
    if c2 <= c1:
        return math.hypot(px - bx, py - by)
    t = c1 / c2
    proj_x = ax + t * vx
    proj_y = ay + t * vy
    return math.hypot(px - proj_x, py - proj_y)


def alpha_over(base_rgb: tuple[float, float, float], top_rgb: tuple[float, float, float], alpha: float) -> tuple[float, float, float]:
    inv = 1.0 - alpha
    return (
        base_rgb[0] * inv + top_rgb[0] * alpha,
        base_rgb[1] * inv + top_rgb[1] * alpha,
        base_rgb[2] * inv + top_rgb[2] * alpha,
    )


def png_bytes(width: int, height: int, rgba_bytes: bytes) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    rows = []
    stride = width * 4
    for y in range(height):
        row = rgba_bytes[y * stride : (y + 1) * stride]
        rows.append(b"\x00" + row)
    raw = b"".join(rows)
    compressed = zlib.compress(raw, 9)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
    idat = chunk(b"IDAT", compressed)
    iend = chunk(b"IEND", b"")
    return header + ihdr + idat + iend


def make_master_rgba() -> bytes:
    size = MASTER_SIZE
    rect_min = 80.0
    rect_max = 944.0
    radius = 212.0

    # Lambda skeleton
    top_a = (342.0, 320.0)
    top_b = (694.0, 320.0)
    left_a = (500.0, 320.0)
    left_b = (352.0, 742.0)
    right_a = (500.0, 320.0)
    right_b = (664.0, 742.0)
    stroke_half = 44.0
    feather = 2.2

    # Accent cube
    accent_x0, accent_y0 = 606.0, 348.0
    accent_x1, accent_y1 = 676.0, 418.0
    accent_radius = 17.0

    pixels = bytearray(size * size * 4)

    centre = size / 2.0
    for y in range(size):
        ny = y / (size - 1)
        for x in range(size):
            nx = x / (size - 1)
            idx = (y * size + x) * 4

            # Rounded rect alpha mask
            cx = clamp(x, rect_min + radius, rect_max - radius)
            cy = clamp(y, rect_min + radius, rect_max - radius)
            corner_distance = math.hypot(x - cx, y - cy)
            rect_alpha = 1.0 - smoothstep(radius - 1.0, radius + 1.5, corner_distance)

            if rect_alpha <= 0.0:
                pixels[idx + 0] = 0
                pixels[idx + 1] = 0
                pixels[idx + 2] = 0
                pixels[idx + 3] = 0
                continue

            bg_mix = clamp((nx * 0.58) + (ny * 0.42))
            vignette = clamp(math.hypot(x - centre, y - centre) / (size * 0.78))
            vignette_dark = 1.0 - (0.18 * smoothstep(0.35, 1.0, vignette))
            bg = mix_rgb(BG_A, BG_B, bg_mix)
            bg = (bg[0] * vignette_dark, bg[1] * vignette_dark, bg[2] * vignette_dark)

            glyph_mix = clamp((x - 320.0) / 380.0)
            glyph_colour = mix_rgb(GLYPH_A, GLYPH_B, glyph_mix)

            d_top = distance_to_segment(x, y, top_a[0], top_a[1], top_b[0], top_b[1])
            d_left = distance_to_segment(x, y, left_a[0], left_a[1], left_b[0], left_b[1])
            d_right = distance_to_segment(x, y, right_a[0], right_a[1], right_b[0], right_b[1])
            d_glyph = min(d_top, d_left, d_right)
            glyph_alpha = 1.0 - smoothstep(stroke_half - feather, stroke_half + feather, d_glyph)

            out = alpha_over(bg, glyph_colour, glyph_alpha)

            # Accent rounded square
            acx = clamp(x, accent_x0 + accent_radius, accent_x1 - accent_radius)
            acy = clamp(y, accent_y0 + accent_radius, accent_y1 - accent_radius)
            d_accent = math.hypot(x - acx, y - acy)
            accent_mask = 1.0 - smoothstep(accent_radius - 1.0, accent_radius + 1.2, d_accent)
            if accent_mask > 0:
                accent_mix = clamp(((x - accent_x0) + (y - accent_y0)) / ((accent_x1 - accent_x0) + (accent_y1 - accent_y0)))
                accent_colour = mix_rgb(ACCENT_A, ACCENT_B, accent_mix)
                out = alpha_over(out, accent_colour, accent_mask)

            pixels[idx + 0] = int(clamp(out[0] / 255.0) * 255)
            pixels[idx + 1] = int(clamp(out[1] / 255.0) * 255)
            pixels[idx + 2] = int(clamp(out[2] / 255.0) * 255)
            pixels[idx + 3] = int(clamp(rect_alpha) * 255)

    return bytes(pixels)


def resize_rgba_square(source_rgba: bytes, source_size: int, target_size: int) -> bytes:
    if source_size == target_size:
        return source_rgba

    def px_at(x: int, y: int) -> tuple[int, int, int, int]:
        ix = (y * source_size + x) * 4
        return (
            source_rgba[ix + 0],
            source_rgba[ix + 1],
            source_rgba[ix + 2],
            source_rgba[ix + 3],
        )

    out = bytearray(target_size * target_size * 4)
    scale = source_size / target_size

    for ty in range(target_size):
        sy = ((ty + 0.5) * scale) - 0.5
        y0 = max(0, min(source_size - 1, int(math.floor(sy))))
        y1 = max(0, min(source_size - 1, y0 + 1))
        wy = sy - y0
        for tx in range(target_size):
            sx = ((tx + 0.5) * scale) - 0.5
            x0 = max(0, min(source_size - 1, int(math.floor(sx))))
            x1 = max(0, min(source_size - 1, x0 + 1))
            wx = sx - x0

            c00 = px_at(x0, y0)
            c10 = px_at(x1, y0)
            c01 = px_at(x0, y1)
            c11 = px_at(x1, y1)

            out_ix = (ty * target_size + tx) * 4
            for i in range(4):
                top = c00[i] * (1.0 - wx) + c10[i] * wx
                bot = c01[i] * (1.0 - wx) + c11[i] * wx
                value = top * (1.0 - wy) + bot * wy
                out[out_ix + i] = int(clamp(value / 255.0) * 255)

    return bytes(out)


def write_png(path: Path, size: int, rgba: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png_bytes(size, size, rgba))


def write_ico(source_pngs: list[Path], destination: Path) -> None:
    png_payloads: list[bytes] = [path.read_bytes() for path in source_pngs]
    destination.parent.mkdir(parents=True, exist_ok=True)

    count = len(png_payloads)
    header = struct.pack("<HHH", 0, 1, count)
    directory = bytearray()
    payload = bytearray()
    offset = 6 + (16 * count)

    for png_path, png_data in zip(source_pngs, png_payloads, strict=True):
        # filename pattern: *-16x16.png
        size = int(png_path.stem.split("-")[-1].split("x")[0])
        width = 0 if size >= 256 else size
        height = 0 if size >= 256 else size
        directory.extend(
            struct.pack(
                "<BBBBHHII",
                width,
                height,
                0,
                0,
                1,
                32,
                len(png_data),
                offset,
            )
        )
        payload.extend(png_data)
        offset += len(png_data)

    destination.write_bytes(header + directory + payload)


def generate_iconset(master_rgba: bytes) -> None:
    if ICONSET.exists():
        shutil.rmtree(ICONSET)
    ICONSET.mkdir(parents=True, exist_ok=True)

    mapping = {
        "icon_16x16.png": 16,
        "icon_16x16@2x.png": 32,
        "icon_32x32.png": 32,
        "icon_32x32@2x.png": 64,
        "icon_128x128.png": 128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png": 256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png": 512,
        "icon_512x512@2x.png": 1024,
    }

    for filename, size in mapping.items():
        resized = resize_rgba_square(master_rgba, MASTER_SIZE, size)
        write_png(ICONSET / filename, size, resized)


def main() -> None:
    SRC_ASSETS.mkdir(parents=True, exist_ok=True)
    PUBLIC_ICONS.mkdir(parents=True, exist_ok=True)
    APP_ICONS.mkdir(parents=True, exist_ok=True)

    master_png = SRC_ASSETS / "icon-master.png"
    master_rgba = make_master_rgba()
    write_png(master_png, MASTER_SIZE, master_rgba)

    # Electron app icons
    app_sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
    for size in app_sizes:
        resized = resize_rgba_square(master_rgba, MASTER_SIZE, size)
        write_png(APP_ICONS / f"icon-{size}.png", size, resized)
    shutil.copy2(APP_ICONS / "icon-512.png", APP_ICONS / "icon.png")

    generate_iconset(master_rgba)
    if shutil.which("iconutil"):
        import subprocess

        try:
            subprocess.run(
                ["iconutil", "-c", "icns", str(ICONSET), "-o", str(APP_ICONS / "icon.icns")],
                check=True,
                capture_output=True,
                text=True,
            )
        except (OSError, subprocess.CalledProcessError):
            print("iconutil failed; skipped icns generation")
    else:
        print("iconutil missing; skipped icns generation")

    # Favicon + web icons
    shutil.copy2(APP_ICONS / "icon-32.png", PUBLIC_ICONS / "favicon-32x32.png")
    write_png(PUBLIC_ICONS / "favicon-16x16.png", 16, resize_rgba_square(master_rgba, MASTER_SIZE, 16))
    write_png(PUBLIC_ICONS / "favicon-48x48.png", 48, resize_rgba_square(master_rgba, MASTER_SIZE, 48))
    write_png(PUBLIC_ICONS / "apple-touch-icon.png", 180, resize_rgba_square(master_rgba, MASTER_SIZE, 180))
    write_png(PUBLIC_ICONS / "android-chrome-192x192.png", 192, resize_rgba_square(master_rgba, MASTER_SIZE, 192))
    write_png(PUBLIC_ICONS / "android-chrome-512x512.png", 512, resize_rgba_square(master_rgba, MASTER_SIZE, 512))
    shutil.copy2(SRC_ASSETS / "icon.svg", PUBLIC_ICONS / "favicon.svg")

    write_ico(
        [
            PUBLIC_ICONS / "favicon-16x16.png",
            PUBLIC_ICONS / "favicon-32x32.png",
            PUBLIC_ICONS / "favicon-48x48.png",
        ],
        PUBLIC / "favicon.ico",
    )
    shutil.copy2(PUBLIC / "favicon.ico", APP_ICONS / "icon.ico")

    if ICONSET.exists():
        shutil.rmtree(ICONSET)

    print("icons done")


if __name__ == "__main__":
    main()
