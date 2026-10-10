"""يبني docs/salmans-garden/journey/index.html: خريطة تفاعلية لدمج الكتابين في رحلة الحروف.
الاستخدام (من جذر المستودع): python3 tools/build_journey.py
المصادر: docs/salmans-garden/source/*.md (عبر tools/build_salman_stories.py) — لا يوجد نص يُدخل يدويًا.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from build_salman_stories import build, SRC, clean  # noqa: E402

OUT = ROOT / 'docs/salmans-garden/journey/index.html'

STAGES = [
    {'id': 1, 'title': 'غابة الأصدقاء', 'letters': ['أ', 'ب', 'ت', 'ث']},
    {'id': 2, 'title': 'مزرعة الحروف', 'letters': ['ج', 'ح', 'خ', 'د']},
    {'id': 3, 'title': 'جبل الحروف', 'letters': ['ذ', 'ر', 'ز', 'س']},
    {'id': 4, 'title': 'ساحل الحروف', 'letters': ['ش', 'ص', 'ض', 'ط']},
    {'id': 5, 'title': 'واحة الحروف', 'letters': ['ظ', 'ع', 'غ', 'ف']},
    {'id': 6, 'title': 'قرية الحروف', 'letters': ['ق', 'ك', 'ل', 'م']},
    {'id': 7, 'title': 'قمة النجوم', 'letters': ['ن', 'ه', 'و', 'ي']},
]


def prophet_extras():
    """حديث شريف وفكرة تربوية لكل حرف من كتاب خاتم الأنبياء."""
    out, cur, mode, buf = {}, None, None, []

    def flush():
        if cur is not None and mode in ('hadith', 'idea'):
            out.setdefault(cur, {})[mode] = clean(buf)

    letter_re = re.compile(r'حرف\s+\S+\s+\((\S+?)\)')
    for ln in (SRC / 'alphabet-with-the-final-prophet.md').read_text(encoding='utf-8').split('\n'):
        m = re.match(r'^## \d+\. (.+)$', ln)
        if m:
            flush()
            lm = letter_re.search(m.group(1))
            cur = lm.group(1).replace('ـ', '') if lm else None
            mode, buf = None, []
            continue
        if ln.startswith('### 💬'):
            flush(); mode = 'hadith'; buf = []; continue
        if ln.startswith('### 💡'):
            flush(); mode = 'idea'; buf = []; continue
        if ln.startswith('### ') or ln.startswith('## '):
            flush(); mode = None; buf = []; continue
        if mode:
            buf.append(ln)
    flush()
    return out


def companion_questions():
    """أسئلة تربوية وأفكار عملية لكل فصل من كتاب الصحابة."""
    out, cur = {}, None
    lines = (SRC / 'alphabet-with-the-companions.md').read_text(encoding='utf-8').split('\n')
    want = False
    for ln in lines:
        m = re.match(r'^## الفصل \d+ — الحرف: (.) —', ln)
        if m:
            cur = m.group(1); want = False; continue
        if ln.startswith('## '):
            cur = None; want = False; continue
        if cur and ln.startswith('**أسئلة تربوية'):
            want = True; continue
        if want and ln.strip():
            out.setdefault(cur, clean([ln]))
            want = False
    return out


def build_data():
    stories = build()
    prophet = prophet_extras()
    comp_q = companion_questions()
    by_letter = {}
    for L in stories:
        ltr = L['letter']
        p_story = next((s for s in L['stories'] if s['source'] == 'prophet'), None)
        c_stories = [s for s in L['stories'] if s['source'] == 'companions']
        stage = next(s['id'] for s in STAGES if ltr in s['letters'])
        by_letter[ltr] = {
            'num': L['num'],
            'letter': ltr,
            'stage': stage,
            'word': L['word'],
            'companionWord': L['companionWord'],
            'prophet': {
                'title': p_story['title'] if p_story else '',
                'story': p_story['paragraphs'] if p_story else [],
                'hadith': prophet.get(ltr, {}).get('hadith', []),
                'idea': prophet.get(ltr, {}).get('idea', []),
            },
            'companions': [
                {'title': s['title'], 'story': s['paragraphs']} for s in c_stories
            ],
            'companionQuestions': comp_q.get(ltr, []),
        }
    letters = [by_letter[ltr] for st in STAGES for ltr in st['letters']]
    return {'stages': STAGES, 'letters': letters}


HTML = """<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>خريطة رحلة الحروف — حديقة سلمان</title>
<style>
  :root { --ink:#134e4a; --bg:#ecfdf5; --card:#fff; --line:#99f6e4; --accent:#10b981; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, 'Segoe UI', Tahoma, sans-serif; background: var(--bg); color: var(--ink); line-height: 1.8; }
  header { background: linear-gradient(135deg,#10b981,#0d9488); color:#fff; padding: 24px 16px; }
  header h1 { margin: 0 0 6px; font-size: 1.7rem; }
  header p { margin: 0; opacity: .95; }
  main { max-width: 980px; margin: 0 auto; padding: 16px; display: flex; flex-direction: column; gap: 24px; }
  section { background: var(--card); border-radius: 22px; padding: 18px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
  h2 { margin: 0 0 12px; font-size: 1.3rem; }
  .muted { opacity: .75; font-size: .95rem; }
  .progress { height: 14px; background: #d1fae5; border-radius: 999px; overflow: hidden; margin: 8px 0 0; }
  .progress > span { display:block; height:100%; background: var(--accent); transition: width .4s; }
  /* المراحل */
  .stages { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; }
  .stage { border: 3px solid var(--line); border-radius: 20px; padding: 14px; background: #f0fdfa; cursor: pointer; text-align: start; font: inherit; color: inherit; min-height: 96px; }
  .stage.active { border-color: var(--accent); box-shadow: 0 0 0 4px #a7f3d0; }
  .stage { display: flex; flex-direction: column; gap: 6px; }
  .stage b { display: block; font-size: 1.05rem; }
  .stage .letters { display: block; font-size: 1.6rem; letter-spacing: 6px; }
  .stage .count { display: block; font-size: .9rem; opacity: .8; }
  /* الحروف */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 16px; }
  .tile { min-height: 112px; border-radius: 22px; border: 3px solid var(--line); background: #fff; font: inherit; color: inherit; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px; }
  .tile .ch { font-size: 2.4rem; font-weight: 800; line-height: 1; }
  .tile .w { font-size: .95rem; }
  .tile.done { background: #dcfce7; border-color: #16a34a; }
  .tile.selected { outline: 4px solid #fde68a; }
  .tile.dim { opacity: .3; }
  .detail { margin-top: 16px; border: 2px solid var(--line); border-radius: 20px; padding: 16px; }
  .tabs { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
  .tab { min-height: 56px; padding: 10px 16px; border-radius: 16px; border: 2px solid var(--line); background: #fff; font: inherit; font-weight: 700; color: inherit; cursor: pointer; }
  .tab.on { background: var(--accent); color:#fff; border-color: var(--accent); }
  .check { min-height: 56px; display:flex; align-items:center; gap: 10px; font-weight:700; margin-top: 8px; }
  .check input { width: 26px; height: 26px; }
  .story p { font-size: 1.08rem; margin: 0 0 10px; }
  .flow { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 12px; counter-reset: s; }
  .flow > div { background: #f0fdfa; border-radius: 18px; padding: 14px; border: 2px dashed var(--line); position: relative; }
  .flow > div::before { counter-increment: s; content: counter(s); display:inline-flex; width: 30px; height: 30px; border-radius: 50%; background: var(--accent); color:#fff; align-items:center; justify-content:center; font-weight:800; margin-bottom: 6px; }
  .flow b { display:block; }
  .notes li { margin-bottom: 8px; }
  .pill { display:inline-block; background:#fef9c3; border-radius:999px; padding: 2px 10px; font-size:.9rem; margin: 2px; }
  @media (prefers-reduced-motion: reduce) { .progress > span { transition: none; } }
</style>
</head>
<body>
<header>
  <h1>🌳 خريطة رحلة الحروف</h1>
  <p>ثلاثة مصادر في مسار واحد: حروف مع الصحابة، وحروف مع خاتم الأنبياء، ومغامرة الحروف — لكل حرف قصتان وحديث وأسئلة للأهل.</p>
</header>
<main>
  <section>
    <h2>تقدّمك</h2>
    <p id="progressText" class="muted"></p>
    <div class="progress" aria-hidden="true"><span id="progressBar" style="width:0%"></span></div>
  </section>

  <section>
    <h2>المراحل السبع</h2>
    <p class="muted">كل مرحلة أربعة حروف (من مراحل مغامرة الحروف). اضغط مرحلة لتصفية الحروف.</p>
    <div id="stages" class="stages"></div>
  </section>

  <section>
    <h2>الحروف</h2>
    <div id="grid" class="grid"></div>
    <div id="detail" class="detail" hidden></div>
  </section>

  <section>
    <h2>كيف تتكامل المصادر في الحصة</h2>
    <p class="muted">خطوات لكل حرف، وتستغرق عادة يومين مع التكرار. الإيقاع المقترح للتجربة، ويُعدَّل بعد اختبار مع الطفل.</p>
    <div class="flow">
      <div><b>اسمع الحرف</b>صوت الحرف مع حيوان الحرف (مغامرة الحروف) — دقيقة.</div>
      <div><b>اقرأ القصة</b>قصة النبي ﷺ أو الصحابي مع الطفل، بصوت الأهل — دقيقتان.</div>
      <div><b>فكّر معه</b>الفكرة التربوية والسؤال الأول من الكتاب — دقيقة.</div>
      <div><b>العب في الحديقة</b>سؤال الحرف في تطبيق سلمان، وتُكسب النجوم — دقيقتان.</div>
      <div><b>راجع بعد يومين</b>الحرف المكتسب يعود في المراجعة، والقصة تُعاد عند الطلب.</div>
    </div>
  </section>

  <section>
    <h2>حالة المصادر</h2>
    <ul class="notes muted">
      <li><b>حروف مع الصحابة (PDF، 56 صفحة ممسوحة):</b> نص مكتوب بالنظر من الصور، ولم يُراجع بعد مقابل الكتاب. صفحة الفصل 4 (ب) تطابقت مع الصورة. <span class="pill">يحتاج مراجعة</span></li>
      <li><b>حروف مع خاتم الأنبياء (نص Drive «Welcome file.md»):</b> 28 حرفًا، وطابق التعرف الضوئي معظم صفحات الـ PDF. <span class="pill">يحتاج مراجعة</span></li>
      <li><b>حرف الفاء:</b> لا توجد قصة في كتاب الصحابة. <span class="pill">ناقص</span></li>
      <li><b>القصص القرآنية في التطبيق:</b> مبسّطة من إعداد المطوّر، وتُراجَع مع معلّم أو عالم قبل النشر. <span class="pill">يحتاج مراجعة</span></li>
      <li><b>الترتيب في كتاب الصحابة:</b> قصة النون تأتي داخل فصل الهاء في الترتيب المطبوع (الصفحات 48–50)، وأعيدت إلى حرفها في هذه الخريطة.</li>
    </ul>
  </section>
</main>

<script>
const DATA = __DATA__;
const KEY = 'journey-progress-v1';
let activeStage = null;
let selected = null;
let tab = 'prophet';

const $ = (id) => document.getElementById(id);
function loadDone() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function saveDone(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
let done = loadDone();

function renderProgress() {
  const n = Object.keys(done).filter(k => done[k]).length;
  const total = DATA.letters.length;
  $('progressText').textContent = `تم ${n} من ${total} حرفًا`;
  $('progressBar').style.width = Math.round(n / total * 100) + '%';
}

function renderStages() {
  $('stages').innerHTML = '';
  for (const st of DATA.stages) {
    const doneCount = st.letters.filter(l => done[l]).length;
    const b = document.createElement('button');
    b.className = 'stage' + (activeStage === st.id ? ' active' : '');
    b.innerHTML = `<b>المرحلة ${st.id}: ${st.title}</b><span class="letters">${st.letters.join(' ')}</span><span class="count">تم ${doneCount} من ${st.letters.length}</span>`;
    b.onclick = () => { activeStage = activeStage === st.id ? null : st.id; renderAll(); };
    $('stages').appendChild(b);
  }
}

function renderGrid() {
  $('grid').innerHTML = '';
  for (const L of DATA.letters) {
    const b = document.createElement('button');
    const cls = ['tile'];
    if (done[L.letter]) cls.push('done');
    if (selected === L.letter) cls.push('selected');
    if (activeStage && L.stage !== activeStage) cls.push('dim');
    b.className = cls.join(' ');
    b.setAttribute('aria-label', `الحرف ${L.letter} — ${L.word}`);
    b.innerHTML = `<span class="ch">${L.letter}</span><span class="w">${L.word}</span>${done[L.letter] ? '<span>✅</span>' : ''}`;
    b.onclick = () => { selected = L.letter; renderAll(); $('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
    $('grid').appendChild(b);
  }
}

function paras(arr) { return (arr || []).map(p => `<p>${escapeHtml(p)}</p>`).join('') || '<p class="muted">لا يوجد نص في المصدر.</p>'; }
function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function renderDetail() {
  const d = $('detail');
  const L = DATA.letters.find(x => x.letter === selected);
  if (!L) { d.hidden = true; return; }
  d.hidden = false;
  const tabs = [
    ['prophet', 'قصة النبي ﷺ'],
    ['companions', 'قصة الصحابي'],
    ['hadith', 'حديث'],
    ['idea', 'أفكار للأهل'],
  ];
  let body = '';
  if (tab === 'prophet') body = `<h3>${escapeHtml(L.prophet.title || '—')}</h3><div class="story">${paras(L.prophet.story)}</div>`;
  if (tab === 'companions') {
    body = L.companions.length
      ? L.companions.map(c => `<h3>${escapeHtml(c.title)}</h3><div class="story">${paras(c.story)}</div>`).join('')
      : '<p class="muted">لا توجد قصة للصحابة لهذا الحرف في الكتاب (حرف الفاء).</p>';
  }
  if (tab === 'hadith') body = `<div class="story">${paras(L.prophet.hadith)}</div>`;
  if (tab === 'idea') body = `<h3>فكرة تربوية</h3><div class="story">${paras(L.prophet.idea)}</div>${L.companionQuestions.length ? '<h3>أسئلة للطفل</h3><div class="story">' + paras(L.companionQuestions) + '</div>' : ''}`;
  d.innerHTML = `
    <h2>الحرف ${L.letter} — «${escapeHtml(L.word)}» · المرحلة ${L.stage}: ${escapeHtml(DATA.stages[L.stage - 1].title)}</h2>
    <div class="tabs">${tabs.map(([k, t]) => `<button class="tab${tab === k ? ' on' : ''}" data-tab="${k}">${t}</button>`).join('')}</div>
    ${body}
    <label class="check"><input type="checkbox" id="doneBox" ${done[L.letter] ? 'checked' : ''}/> تمّ هذا الحرف في البيت</label>`;
  d.querySelectorAll('[data-tab]').forEach(btn => btn.onclick = () => { tab = btn.dataset.tab; renderDetail(); });
  $('doneBox').onchange = (e) => { done[L.letter] = e.target.checked; saveDone(done); renderAll(); };
}

function renderAll() { renderProgress(); renderStages(); renderGrid(); renderDetail(); }
renderAll();
</script>
</body>
</html>
"""


def main():
    data = build_data()
    payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(HTML.replace('__DATA__', payload), encoding='utf-8')
    print('wrote', OUT, 'letters', len(data['letters']))


if __name__ == '__main__':
    main()
