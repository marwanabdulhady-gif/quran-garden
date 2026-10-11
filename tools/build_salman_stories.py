"""يبني src/salman/data/stories.generated.js من نصوص الكتابين (docs/salmans-garden/source).
الاستخدام: python3 tools/build_salman_stories.py  (من جذر المستودع)
"""
import re, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'docs/salmans-garden/source'
OUT = ROOT / 'src/salman/data/stories.generated.js'

LETTER_RE = re.compile(r'حرف\s+\S+\s+\((\S+?)\)')
DROP_PREFIX = ('>', '---', '*الصفحة', '**د/', '⁽', '**أسئلة', '**والآن', '**وال', '[أنظر', '## ', '### ', '**والآن')

def clean(lines):
    out, cur = [], []
    for ln in lines:
        s = ln.strip()
        if not s:
            if cur:
                out.append(' '.join(cur)); cur = []
            continue
        if s.startswith(DROP_PREFIX) or re.match(r'^\*?الصفحة \d+\*?$', s):
            continue
        s = re.sub(r'⁽\d+⁾', '', s).strip()
        if s:
            cur.append(s)
    if cur:
        out.append(' '.join(cur))
    return [p for p in out if len(p) > 3]

def parse_prophet():
    text = (SRC / 'alphabet-with-the-final-prophet.md').read_text(encoding='utf-8').split('\n')
    letters, cur, mode = [], None, None
    buf = []
    def flush():
        nonlocal buf
        if cur is not None and mode == 'story':
            cur['_story'] = clean(buf)
        buf = []
    for ln in text:
        m = re.match(r'^## (\d+)\. (.+?) - (.+)$', ln)
        if m:
            flush()
            lm = LETTER_RE.search(m.group(2))
            cur = {'num': int(m.group(1)), 'letter': (lm.group(1).replace('ـ','') if lm else '?'), 'word': m.group(3).split(' (')[0].split(' / ')[0].strip(), 'gloss': m.group(3), '_story': [], '_hadith': [], '_idea': []}
            letters.append(cur); mode = None
            continue
        if cur is None:
            continue
        if ln.startswith('### 📖'):
            flush(); mode = 'story'; continue
        if ln.startswith('### 💬'):
            flush(); mode = 'hadith'; continue
        if ln.startswith('### 💡'):
            flush(); mode = 'idea'; continue
        if ln.startswith('## '):
            flush(); mode = None; continue
        if mode == 'story':
            buf.append(ln)
        elif mode == 'hadith':
            pass
        elif mode == 'idea':
            pass
    return letters

def parse_companions():
    text = (SRC / 'alphabet-with-the-companions.md').read_text(encoding='utf-8').split('\n')
    chapters, cur, story, buf, in_story = {}, None, None, [], False
    def close():
        nonlocal story, buf, in_story
        if story is not None and cur is not None:
            paras = clean(buf)
            if paras:
                cur['stories'].append({'title': story, 'paragraphs': paras})
        story, buf, in_story = None, [], False
    for ln in text:
        m = re.match(r'^## الفصل (\d+) — الحرف: (.) — «(.+)»', ln)
        if m:
            close()
            cur = {'num': int(m.group(1)), 'letter': m.group(2), 'word': m.group(3), 'stories': []}
            chapters[m.group(2)] = cur
            continue
        if ln.startswith('## ') and not ln.startswith('## الفصل'):
            close(); cur = None; continue
        if cur is None:
            continue
        if ln.startswith('### '):
            close(); story = ln[4:].strip(); in_story = True; continue
        if ln.startswith('**أسئلة تربوية'):
            close(); continue
        if in_story:
            buf.append(ln)
    close()
    return chapters

def clean_title(t):
    t = re.sub(r'\s*\(.*?\)\s*$', '', t).strip()
    t = re.sub(r'^تابع الفصل \d+ — الحرف: .+? — قصة ثانية: ', '', t).strip()
    return t

ALPHABET = ['أ','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ي']
# فصول الكتاب الثاني: قصة ن موجودة داخل فصل ه، وقصة ه الثانية بعدها (انظر README)
MANUAL_FIX = {'ن': ('ch25', 0), 'ه': ('ch25', 1)}

def build():
    prophet = {L['letter']: L for L in parse_prophet()}
    comp = parse_companions()
    comp_by_letter = {}
    for ltr, ch in comp.items():
        comp_by_letter[ltr] = ch['stories']
    # صحّح ربط ن/ه
    ch25 = comp['ه']['stories']
    comp_by_letter['ن'] = [ch25[0]] if len(ch25) > 0 else []
    comp_by_letter['ه'] = [ch25[1]] if len(ch25) > 1 else []
    data = []
    for i, ltr in enumerate(ALPHABET, start=1):
        pr = prophet[ltr]
        comp_word = comp[ltr]['word'] if ltr in comp else ''
        stories = []
        if pr['_story']:
            stories.append({'id': f'ar-{i:02d}-p', 'source': 'prophet', 'title': pr['gloss'].split(' (')[0].split(' / ')[0].strip(), 'paragraphs': pr['_story']})
        for j, st in enumerate(comp_by_letter.get(ltr, [])):
            stories.append({'id': f'ar-{i:02d}-c{j+1}', 'source': 'companions', 'title': clean_title(st['title']), 'paragraphs': st['paragraphs']})
        data.append({'num': i, 'letter': ltr, 'word': pr['word'], 'companionWord': comp_word, 'stories': stories})
    return data

def to_js(data):
    body = json.dumps(data, ensure_ascii=False, indent=2)
    return ('// ملف مُولَّد تلقائيًا من docs/salmans-garden/source عبر tools/build_salman_stories.py — لا تعدّله يدويًا.\n'
            'export const ARABIC_STORIES = ' + body + ';\n')

if __name__ == '__main__':
    import sys
    if '--write' in sys.argv:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(to_js(build()), encoding='utf-8')
        print('wrote', OUT)
    else:
        for L in build():
            print(L['num'], L['letter'], L['word'], L['companionWord'], [(x['id'], x['title'][:40], sum(len(q) for q in x['paragraphs'])) for x in L['stories']])
