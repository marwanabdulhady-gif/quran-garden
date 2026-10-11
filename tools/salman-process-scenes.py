"""معالجة رسوم حديقة سلمان (VISUALS.md):
  count <name> ...   أشياء العدّ: إزالة الخلفية البيضاء من الحواف، قص، تصغير إلى 256، ضغط ألوان مع الشفافية.
                     المصدر: raw/count-<name>.png  →  public/salman/art/count/<name>.png
  scene <id> ...     مشاهد القصص: قص إلى 16:9، تصغير إلى 800×450، JPG بجودة 80 بلا شفافية.
                     المصدر: raw/scenes/<id>.png    →  public/salman/art/stories/<id>.jpg

الاستخدام (من أي مكان، بمسار بايثون الذي فيه Pillow):
  /home/user/recovery/venv/bin/python tools/salman-process-scenes.py count apple star
  /home/user/recovery/venv/bin/python tools/salman-process-scenes.py scene math-s07 en-12
"""
import os
import sys
from collections import deque
from PIL import Image

RAW = '/home/user/recovery/raw'
REPO = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
COUNT_DST = os.path.join(REPO, 'public/salman/art/count')
SCENE_DST = os.path.join(REPO, 'public/salman/art/stories')
COUNT_MAX = 256
SCENE_W, SCENE_H = 800, 450


def key_background(img, tol=38):
    # إزالة الخلفية البيضاء بتعبئة من الحواف (نفس منطق رسوم الحيوانات)
    img = img.convert('RGB')
    img.thumbnail((512, 512))
    w, h = img.size
    px = img.load()
    bg = px[0, 0]

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


def finish_count(rgba, path):
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    rgba.thumbnail((COUNT_MAX, COUNT_MAX), Image.LANCZOS)
    alpha = rgba.getchannel('A')
    q = rgba.convert('RGB').quantize(colors=200, method=Image.Quantize.FASTOCTREE).convert('RGBA')
    q.putalpha(alpha)
    q.save(path, optimize=True)
    return q.size


def finish_scene(img, path):
    # قص مركزي إلى 16:9 ثم تصغير
    img = img.convert('RGB')
    w, h = img.size
    target = SCENE_W / SCENE_H
    if w / h > target:
        nw = int(h * target)
        left = (w - nw) // 2
        img = img.crop((left, 0, left + nw, h))
    else:
        nh = int(w / target)
        top = (h - nh) // 2
        img = img.crop((0, top, w, top + nh))
    img = img.resize((SCENE_W, SCENE_H), Image.LANCZOS)
    img.save(path, 'JPEG', quality=80, optimize=True, progressive=True)
    return img.size


def main(argv):
    if len(argv) < 3 or argv[1] not in ('count', 'scene'):
        print(__doc__)
        return 2
    mode, names = argv[1], argv[2:]
    if mode == 'count':
        os.makedirs(COUNT_DST, exist_ok=True)
        for name in names:
            img = Image.open(f'{RAW}/count-{name}.png')
            size = finish_count(key_background(img), f'{COUNT_DST}/{name}.png')
            print('count', name, size, os.path.getsize(f'{COUNT_DST}/{name}.png') // 1024, 'KB')
    else:
        os.makedirs(SCENE_DST, exist_ok=True)
        for sid in names:
            img = Image.open(f'{RAW}/scenes/{sid}.png')
            size = finish_scene(img, f'{SCENE_DST}/{sid}.jpg')
            print('scene', sid, size, os.path.getsize(f'{SCENE_DST}/{sid}.jpg') // 1024, 'KB')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
