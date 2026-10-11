#!/usr/bin/env python3
"""يضبط رايات `voiced` في src/salman/data/nour.js بحسب الملفات الموجودة فعلًا.

القاعدة: لا نسمّي مقطعًا «مسجّلًا» إلا إذا كان ملف mp3 موجودًا في
public/salman/audio/nour/. شغّله بعد توليد أي دفعة أصوات:

    python3 tools/salman-voice-flags.py
"""
from __future__ import annotations

import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_FILES = [
    ROOT / 'src/salman/data/nour.js',
    ROOT / 'src/salman/data/nour-letters.js',
    ROOT / 'src/salman/data/nour-english.js',
]
AUDIO = ROOT / 'public/salman/audio/nour'

STORY_IDS = re.compile(r"id: '((?:ar-[a-z]{1,2}-[pc]|num-\d-s|en-[a-z]-s))',\n")
UNIT_IDS = re.compile(r"id: '((?:ar-[^\']+|num-\d|en-[a-z]))',\n(?:    clip: '([^']+)',\n)?")
CHANTS = re.compile(r"chant: \{\s*(?:voiced: (?:true|false),\s*)?")
STORY_TAIL = re.compile(r"(review: '[^']*',\n)(?:        voiced: (?:true|false),\n)?")


def clip_exists(name: str) -> bool:
    path = AUDIO / f'{name}.mp3'
    return path.is_file() and path.stat().st_size > 1000


def process_file(path: pathlib.Path) -> tuple[int, int]:
    text = path.read_text(encoding='utf-8')
    on, off = 0, 0

    # مقاطع الأناشيد: nour/<clip>-chant.mp3
    def chant_sub(match: re.Match[str]) -> str:
        nonlocal on, off
        # ابحث عن الوحدة الحاوية (أقرب id قبل الموضع)
        start = text.rfind("    id: '", 0, match.start())
        unit = UNIT_IDS.match(text[start + 4:])
        slug = None
        if unit:
            slug = unit.group(2) or unit.group(1)
        ok = bool(slug) and clip_exists(f'{slug}-chant')
        on, off = (on + 1, off) if ok else (on, off + 1)
        return f"chant: {{ voiced: {'true' if ok else 'false'}, "

    text = CHANTS.sub(chant_sub, text)

    # قصص: nour/<storyId>.mp3 — نضبط voiced ونُعيد ترتيب (review · voiced · note) بلا تكرار
    stories = list(re.finditer(r"id: '((?:ar-[a-z]{1,2}-[pc]|num-\d-s|en-[a-z]-s))',\n", text))
    for sid in reversed(stories):
        ok = clip_exists(sid.group(1))
        on, off = (on + 1, off) if ok else (on, off + 1)
        review = re.compile(r"        review: '([^']*)',\n").search(text, sid.end())
        if not review:
            print(f'!! no review line after {sid.group(1)}', file=sys.stderr)
            continue
        tail = review.end()
        note = None
        while True:
            m = re.compile(r"        (voiced: (?:true|false)|note: '([^']*)'),\n").match(text, tail)
            if not m:
                break
            if m.group(2) is not None:
                note = note or m.group(2)
            tail = m.end()
        block = f"        review: '{review.group(1)}',\n        voiced: {'true' if ok else 'false'},\n"
        if note:
            block += f"        note: '{note}',\n"
        text = text[: review.start()] + block + text[tail:]

    path.write_text(text, encoding='utf-8')
    # نُعيد التنسيق حتى يبقى `npm run format:check` أخضر
    if '--no-format' not in sys.argv:
        subprocess.run(['npx', 'prettier', '--write', str(path)], check=False, capture_output=True)
    return on, off


def main() -> int:
    on = off = 0
    for path in DATA_FILES:
        if not path.is_file():
            print(f'!! {path} غير موجود', file=sys.stderr)
            continue
        a, b = process_file(path)
        on, off = on + a, off + b
    print(f'voiced: true → {on} · voiced: false → {off}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
