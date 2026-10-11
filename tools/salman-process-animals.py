# معالجة رسومات الحيوانات: إزالة الخلفية البيضاء بتعبئة من الحواف، ثم قص وتصغير وضغط الألوان.
import sys
from collections import deque
from PIL import Image

SRC = '/home/user/recovery/raw'
DST = '/home/user/quran-garden/public/salman/art/animals'
MAX = 256

def key_background(img, tol=38):
    img = img.convert('RGB')
    img.thumbnail((512, 512))
    w, h = img.size
    px = img.load()
    bg = px[0, 0]  # لون الزاوية هو لون الخلفية
    def close(c):
        return max(abs(c[0] - bg[0]), abs(c[1] - bg[1]), abs(c[2] - bg[2])) <= tol
    removed = [[False] * h for _ in range(w)]
    q = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or removed[x][y]:
            continue
        if not close(px[x, y]):
            continue
        removed[x][y] = True
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    rgba = Image.new('RGBA', img.size)
    out = rgba.load()
    for x in range(w):
        for y in range(h):
            out[x, y] = (0, 0, 0, 0) if removed[x][y] else (*px[x, y], 255)
    return rgba

def finish(rgba, path):
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    rgba.thumbnail((MAX, MAX), Image.LANCZOS)
    # ضغط الألوان مع الحفاظ على الشفافية
    alpha = rgba.getchannel('A')
    q = rgba.convert('RGB').quantize(colors=200, method=Image.Quantize.FASTOCTREE)
    q = q.convert('RGBA')
    q.putalpha(alpha)
    q.save(path, optimize=True)
    return q.size

if __name__ == '__main__':
    import os
    os.makedirs(DST, exist_ok=True)
    for slug in sys.argv[1:]:
        img = Image.open(f'{SRC}/animal-{slug}.png')
        rgba = key_background(img)
        size = finish(rgba, f'{DST}/{slug}.png')
        print(slug, size, os.path.getsize(f'{DST}/{slug}.png'))
