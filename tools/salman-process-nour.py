#!/usr/bin/env python3
"""يجهّز صور «حدائق النور»: إزالة الخلفية البيضاء، قصّ، تصغير، وتكميم الألوان.

المدخل: صور خام بخلفية بيضاء في `.work/<name>-raw.png` (خارج Git).
المخرج: `public/salman/art/nour/<name>.png` — خلفية شفافة، ≤ 256 px،
ألوان مكمَّمة حتى يبقى الحجم صغيرًا (ميزانية الطيار ≤ 200 KB).

    python3 tools/salman-process-nour.py mountain door mosque rooster
"""
from __future__ import annotations

import pathlib
import sys
from collections import deque

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / '.work'
OUT = ROOT / 'public/salman/art/nour'
MAX = 256
COLORS = 96


def flood_white(im: Image.Image, thr: int = 238, sat: int = 18) -> Image.Image:
    """يجعل البكسل الأبيض المتصل بالحافة شفافًا (بلا لمس الأبيض داخل الموضوع)."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]:
            continue
        seen[y * w + x] = 1
        r, g, b, a = px[x, y]
        if a and min(r, g, b) >= thr and max(r, g, b) - min(r, g, b) < sat:
            px[x, y] = (r, g, b, 0)
            q.extend([(x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)])
    return im


def process(name: str, thr: int = 238, sat: int = 18) -> None:
    src = SRC / f'{name}-raw.png'
    if not src.is_file():
        print(f'!! {src} غير موجود', file=sys.stderr)
        return
    im = flood_white(Image.open(src), thr, sat)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.thumbnail((MAX, MAX), Image.LANCZOS)
    im = im.quantize(colors=COLORS, method=Image.Quantize.FASTOCTREE)
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f'{name}.png'
    im.save(dest, 'PNG', optimize=True)
    print(f'{name}: {im.size} {dest.stat().st_size} bytes')


if __name__ == '__main__':
    names = sys.argv[1:] or ['mountain', 'door', 'mosque', 'rooster']
    for n in names:
        # الديك خلفيته كريمية: نرخي الحدّ قليلًا حتى تتلاشى الحواف الناعمة
        process(n, thr=214, sat=26) if n == 'rooster' else process(n)
