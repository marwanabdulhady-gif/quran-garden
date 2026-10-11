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
DATA = ROOT / 'src/salman/data/nour.js'
AUDIO = ROOT / 'public/salman/audio/nour'

STORY_IDS = re.compile(r"id: '((?:ar-[a-z]-[pc]|num-\d-s|en-[a-z]-s))',\n")
UNIT_IDS = re.compile(r"id: '((?:ar-[^\']+|num-\d|en-[a-z]))',\n(?:    clip: '([^']+)',\n)?")
CHANTS = re.compile(r"chant: \{\s*(?:voiced: (?:true|false),\s*)?")
STORY_TAIL = re.compile(r"(review: '[^']*',\n)(?:        voiced: (?:true|false),\n)?")


def clip_exists(name: str) -> bool:
    path = AUDIO / f'{name}.mp3'
    return path.is_file() and path.stat().st_size > 1000


def main() -> int:
    text = DATA.read_text(encoding='utf-8')
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

    # قصص: nour/<storyId>.mp3
    def story_sub(match: re.Match[str]) -> str:
        nonlocal on, off
        ok = clip_exists(match.group(1))
        on, off = (on + 1, off) if ok else (on, off + 1)
        tail = STORY_TAIL.search(text, match.end())
        if not tail:
            return match.group(0)
        return match.group(0)

    story_ids = list(STORY_IDS.finditer(text))
    for sid in story_ids:
        ok = clip_exists(sid.group(1))
        on, off = (on + 1, off) if ok else (on, off + 1)
        tail = STORY_TAIL.search(text, sid.end())
        if not tail:
            print(f'!! no review line after {sid.group(1)}', file=sys.stderr)
            continue
        replacement = f"{tail.group(1)}        voiced: {'true' if ok else 'false'},\n"
        text = text[: tail.start()] + replacement + text[tail.end():]

    DATA.write_text(text, encoding='utf-8')
    # نُعيد التنسيق حتى يبقى `npm run format:check` أخضر
    if '--no-format' not in sys.argv:
        subprocess.run(['npx', 'prettier', '--write', str(DATA)], check=False, capture_output=True)
    print(f'voiced: true → {on} · voiced: false → {off}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
