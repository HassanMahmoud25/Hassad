#!/usr/bin/env python3
"""Builds every platform asset from the official logo master, brand/hassad-logo.png.

The master is never edited: each asset is the master scaled down (Lanczos)
and placed on a canvas. The mark stays black with its original alpha.

    python3 scripts/brand/make-brand-assets.py      # needs Pillow

Outputs
  app/assets/brand/hassad-logo{,@2x,@3x}.png          in-app logo (tight crop)
  ios/.../AppIcon.appiconset/AppIcon-1024.png          iOS app icon
  ios/.../LaunchLogo.imageset/                         iOS launch screen logo
  android/.../mipmap-*/ic_launcher{,_round,_foreground}.png
  android/.../drawable-*/launch_logo.png               pre-Android-12 splash
"""
import json
import math
import os

from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MASTER = os.path.join(ROOT, 'brand', 'hassad-logo.png')

PAPER = (0xF7, 0xF4, 0xEE, 255)  # palettes.light.paper

master = Image.open(MASTER).convert('RGBA')
# Tight crop to the mark's own pixels (drops only the transparent margin).
logo = master.crop(master.getchannel('A').getbbox())
LW, LH = logo.size
ASPECT = LW / LH


def p(*parts):
    path = os.path.join(ROOT, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def scaled(height):
    h = max(1, round(height))
    return logo.resize((max(1, round(h * ASPECT)), h), Image.LANCZOS)


def place(canvas, height):
    """Centres the mark (by its bounding box) on the canvas."""
    m = scaled(height)
    x = (canvas.width - m.width) // 2
    y = (canvas.height - m.height) // 2
    canvas.alpha_composite(m, (x, y))
    return canvas


# Furthest opaque pixel from the mark's centre, as a fraction of its height,
# so the mark can be fitted inside circular masks (adaptive / round icons).
probe = scaled(400)
pa = probe.getchannel('A').load()
cx, cy = probe.width / 2, probe.height / 2
reach = max(
    math.hypot(x + 0.5 - cx, y + 0.5 - cy)
    for y in range(probe.height)
    for x in range(probe.width)
    if pa[x, y] > 8
) / probe.height


def height_in_circle(radius):
    return radius / reach


# ── In-app logo (rendered via <HassadLogo size={h}>; 1x = 120pt tall) ─────
for suffix, scale in (('', 1), ('@2x', 2), ('@3x', 3)):
    scaled(120 * scale).save(p('app', 'assets', 'brand', f'hassad-logo{suffix}.png'), optimize=True)

# ── iOS app icon: black mark on paper, full bleed (iOS applies the mask) ──
icon = Image.new('RGBA', (1024, 1024), PAPER)
place(icon, 1024 * 0.58)
icon.convert('RGB').save(p('ios', 'hassad', 'Images.xcassets', 'AppIcon.appiconset', 'AppIcon-1024.png'), optimize=True)

# ── iOS launch logo: 120pt tall. Dark appearance gets a transparent slot ──
# (the black mark disappears on night paper; the white variant goes here later).
LAUNCH_PT = 120
ls_dir = ('ios', 'hassad', 'Images.xcassets', 'LaunchLogo.imageset')
images = []
for scale in (1, 2, 3):
    m = scaled(LAUNCH_PT * scale)
    name = f'LaunchLogo@{scale}x.png'
    m.save(p(*ls_dir, name), optimize=True)
    images.append({'filename': name, 'idiom': 'universal', 'scale': f'{scale}x'})
    dark = f'LaunchLogo-dark@{scale}x.png'
    Image.new('RGBA', m.size, (0, 0, 0, 0)).save(p(*ls_dir, dark), optimize=True)
    images.append({
        'appearances': [{'appearance': 'luminosity', 'value': 'dark'}],
        'filename': dark, 'idiom': 'universal', 'scale': f'{scale}x',
    })
with open(p(*ls_dir, 'Contents.json'), 'w') as f:
    json.dump({'images': images, 'info': {'author': 'xcode', 'version': 1}}, f, indent=2)
    f.write('\n')

# ── Android ────────────────────────────────────────────────────────────────
DENSITIES = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
res = ('android', 'app', 'src', 'main', 'res')

for d, k in DENSITIES.items():
    # Adaptive foreground: 108dp canvas; the mark stays inside the 66dp
    # safe circle (radius 33dp) with a little air, so no launcher mask clips it.
    fg = Image.new('RGBA', (round(108 * k),) * 2, (0, 0, 0, 0))
    place(fg, height_in_circle(30 * k))
    fg.save(p(*res, f'mipmap-{d}', 'ic_launcher_foreground.png'), optimize=True)

    # Legacy icons (Android 7.x): paper rounded square / paper disc.
    s = round(48 * k)
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(sq).rounded_rectangle((k, k, s - 1 - k, s - 1 - k), radius=round(8 * k), fill=PAPER)
    place(sq, s * 0.58)
    sq.save(p(*res, f'mipmap-{d}', 'ic_launcher.png'), optimize=True)

    rd = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(rd).ellipse((k, k, s - 1 - k, s - 1 - k), fill=PAPER)
    place(rd, height_in_circle(s * 0.36))
    rd.save(p(*res, f'mipmap-{d}', 'ic_launcher_round.png'), optimize=True)

    # Pre-Android-12 splash: the window background centres this bitmap.
    scaled(LAUNCH_PT * k).save(p(*res, f'drawable-{d}', 'launch_logo.png'), optimize=True)

print(f'logo {LW}x{LH}, reach {reach:.3f}·h — assets written')
