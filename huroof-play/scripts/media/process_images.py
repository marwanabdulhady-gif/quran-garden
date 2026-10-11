"""تجهيز رسومات الحيوانات: من الصور الخام (خلفية بيضاء) لـ PNG شفاف مربّع 384px.

الاستخدام (من جذر huroof-play):
    python3 scripts/media/process_images.py            # كل الملفات في media-src/animals
    python3 scripts/media/process_images.py lion duck  # ملفات محددة

الخطوات: 1) flood-fill من الحواف للخلفية البيضاء → alpha=0 (الأبيض اللي جوه الرسمة بيفضل)
          2) قص حول الرسمة مع هامش  3) تربيع + تصغير 384px  4) حفظ PNG مضغوط في public/media/animals
"""

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "media-src" / "animals"
DST = ROOT / "public" / "media" / "animals"
SIZE = 384
WHITE_TOL = 22  # قربّ اللون من الأبيض (0-255 لكل قناة) يتعتبر خلفية


def remove_background(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    # قناع الخلفية: أبيض تقريبًا
    white = Image.new("RGB", rgba.size, (255, 255, 255))
    diff = ImageChops.difference(rgba.convert("RGB"), white).convert("L")
    near_white = diff.point(lambda v: 255 if v <= WHITE_TOL else 0)
    # flood-fill من الأركان على القناع: اللي متصل بالحواف بس هو الخلفية
    mask = near_white.copy()
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if mask.getpixel(xy) == 255:
            ImageDraw.floodfill(mask, xy, 128)
    background = mask.point(lambda v: 255 if v == 128 else 0)
    alpha = background.point(lambda v: 0 if v == 255 else 255)
    rgba.putalpha(alpha)
    return rgba


def crop_square(img: Image.Image, pad_ratio: float = 0.06) -> Image.Image:
    bbox = img.getchannel("A").getbbox()
    if bbox is None:
        raise ValueError("الصورة فاضية بعد إزالة الخلفية")
    left, top, right, bottom = bbox
    w, h = right - left, bottom - top
    side = int(max(w, h) * (1 + pad_ratio * 2))
    cx, cy = (left + right) // 2, (top + bottom) // 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(img.crop(bbox), ((side - w) // 2, (side - h) // 2))
    return canvas


def process(name: str) -> Path:
    src = SRC / f"{name}.png"
    if not src.exists():
        raise FileNotFoundError(src)
    img = Image.open(src)
    out = crop_square(remove_background(img)).resize((SIZE, SIZE), Image.LANCZOS)
    DST.mkdir(parents=True, exist_ok=True)
    dst = DST / f"{name}.png"
    out.save(dst, optimize=True)
    return dst


if __name__ == "__main__":
    names = sys.argv[1:] or sorted(p.stem for p in SRC.glob("*.png"))
    for n in names:
        d = process(n)
        print(f"✔ {d.relative_to(ROOT)} ({d.stat().st_size // 1024} KB)")
