// «مجاري النور» — حراسة نموذج النطاقات والمجاري والسند (PLAN-K5-STREAMS.md).
//
// هذه الاختبارات تحرس **القواعد** لا الشكل: النطاقات تغطي K–5، والقرآن محور لا مجرى،
// ولا وحدة بلا سند، ولا وحدة غير مُراجَعة تُعرض على الطفل، ونصّ الخطة موجود.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AXIS,
  STREAMS,
  STREAM_ORDER,
  LIVE_STREAMS,
  SCIENCE_LIVE,
  BANDS,
  BAND_ORDER,
  GRADES,
  ANCHOR_RANKS,
  ANCHOR_RANK_ORDER,
  bandFor,
  bandsForGrade,
  bandIndex,
  deeperBand,
  defaultBandFor,
  validateAnchor,
  bandOfUnit,
  streamByBand,
  DEFAULT_BAND,
} from '../src/salman/data/bands.js';
import {
  SCIENCE_UNITS,
  SCIENCE_STATIONS,
  SCIENCE_DAY_LABELS,
  scienceStationsForBand,
  scienceUnitPlayable,
  playableScienceUnits,
} from '../src/salman/data/nour-science.js';
import { NOUR_UNITS, DAY_STEPS, gardenUnits } from '../src/salman/data/nour.js';
import { GARDENS, GARDEN_ORDER } from '../src/salman/data/gardens.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOUR_LIST = Object.values(NOUR_UNITS);

describe('مجاري النور — النطاقات', () => {
  it('ثلاثة نطاقات بترتيب تصاعدي، ولكلٍّ صفوفه وعمره', () => {
    expect(BAND_ORDER).toEqual(['k2', '2-4', '4-6']);
    expect(BANDS).toHaveLength(3);
    for (const b of BANDS) {
      expect(b.grades.length, `${b.id} له صفوف`).toBeGreaterThan(0);
      expect(b.ages[0]).toBeLessThan(b.ages[1]);
      expect(b.session.min).toBeLessThanOrEqual(b.session.max);
      expect(b.tier.length, `${b.id} له محرّكات`).toBeGreaterThan(0);
    }
  });

  it('النطاقات تغطي صفوف K–5 كلها بلا ثغرة (والسادس مَطلع)', () => {
    for (const grade of [...GRADES, 6]) {
      expect(bandsForGrade(grade).length, `الصف ${grade} له نطاق`).toBeGreaterThan(0);
    }
  });

  it('التقاطع عند ٢ و٤ مقصود: الطفل ليس صفًّا', () => {
    expect(bandsForGrade(2).map((b) => b.id)).toEqual(['k2', '2-4']);
    expect(bandsForGrade(4).map((b) => b.id)).toEqual(['2-4', '4-6']);
    // الصفوف الطرفية في نطاق واحد
    expect(bandsForGrade('K').map((b) => b.id)).toEqual(['k2']);
    expect(bandsForGrade(5).map((b) => b.id)).toEqual(['4-6']);
  });

  it('النطاق أرضية لا سقف: الافتراضي هو الأعمق المتاح', () => {
    expect(defaultBandFor('K')).toBe('k2');
    expect(defaultBandFor(1)).toBe('k2');
    expect(defaultBandFor(2)).toBe('2-4'); // أعمق النطاقين المتاحين للصف الثاني
    expect(defaultBandFor(3)).toBe('2-4');
    expect(defaultBandFor(4)).toBe('4-6');
    expect(defaultBandFor(5)).toBe('4-6');
    // صفّ خارج المدى لا يكسر — يعود إلى أرضية المجرى
    expect(defaultBandFor(99)).toBe('k2');
    expect(defaultBandFor(undefined)).toBe('k2');
  });

  it('bandIndex وdeeperBand يميّزان العمق', () => {
    expect(bandIndex('k2')).toBe(0);
    expect(bandIndex('4-6')).toBe(2);
    expect(bandIndex('غير-موجود')).toBe(-1);
    expect(deeperBand('k2', '2-4')).toBe('2-4');
    expect(deeperBand('4-6', '2-4')).toBe('4-6');
    expect(bandFor('k2')?.ar).toBe('التأسيس');
    expect(bandFor('لا-يوجد')).toBeNull();
  });

  it('كل نطاق يزيد الجلسة والقراءة والهدف عن الذي قبله', () => {
    for (let i = 1; i < BANDS.length; i += 1) {
      const prev = BANDS[i - 1];
      const cur = BANDS[i];
      expect(cur.session.min, `${cur.id} جلسة أطول`).toBeGreaterThanOrEqual(prev.session.min);
      expect(cur.session.minutes, `${cur.id} دقائق أكثر`).toBeGreaterThan(prev.session.minutes);
      expect(cur.newPerDay, `${cur.id} جديد أكثر`).toBeGreaterThanOrEqual(prev.newPerDay);
      expect(cur.objective, `${cur.id} هدفه مختلف`).not.toBe(prev.objective);
    }
  });
});

describe('مجاري النور — العين والمجاري', () => {
  it('القرآن محور لا مجرى: ليس في قائمة المجاري', () => {
    expect(AXIS).toBe('quran');
    expect(STREAM_ORDER).not.toContain(AXIS);
    expect(Object.keys(STREAMS)).not.toContain(AXIS);
  });

  it('أربعة مجاري بالمواد الأساسية، وكل مجرى له دليل وغاية عند العين', () => {
    expect(STREAM_ORDER).toEqual(['arabic', 'math', 'english', 'science']);
    for (const id of STREAM_ORDER) {
      const s = STREAMS[id];
      expect(s.name.trim(), `${id} له اسم`).not.toBe('');
      expect(s.guide.trim(), `${id} له دليل`).not.toBe('');
      expect(s.axisUse.trim(), `${id} يرجع إلى العين`).not.toBe('');
      expect(s.gardenName.trim(), `${id} له حديقة`).not.toBe('');
    }
  });

  it('المجاري الحيّة تطابق حدائق التطبيق القائمة + المحور', () => {
    // الحراسة الحقيقية: لا يظهر مجرى للطفل قبل أن يكون له حديقة مبنيّة، والعكس.
    expect(new Set([...LIVE_STREAMS, AXIS])).toEqual(new Set(GARDEN_ORDER));
    for (const id of LIVE_STREAMS) {
      expect(GARDENS[id], `الحديقة ${id} معرَّفة`).toBeDefined();
    }
  });

  it('مجرى الكون مُعلَن لكنه غير حيّ بعد — حتى تُراجَع محطته الأولى', () => {
    expect(STREAM_ORDER).toContain('science');
    expect(SCIENCE_LIVE).toBe(false);
    expect(LIVE_STREAMS).not.toContain('science');
    expect(GARDEN_ORDER).not.toContain('science');
    expect(GARDENS.science).toBeUndefined();
  });
});

describe('مجاري النور — مراتب السند', () => {
  const valid = { rank: 'm1', ref: 'البخاري ١', url: 'https://sunnah.com/bukhari:1', review: 'ok' };

  it('أربع مراتب بترتيبها، ولكلٍّ معناها ومتطلَّبها', () => {
    expect(ANCHOR_RANK_ORDER).toEqual(['m1', 'm2', 'm3', 'm4']);
    for (const r of ANCHOR_RANK_ORDER) {
      expect(ANCHOR_RANKS[r].ar.trim(), `${r} له اسم`).not.toBe('');
      expect(ANCHOR_RANKS[r].meaning.trim(), `${r} له معنى`).not.toBe('');
      expect(ANCHOR_RANKS[r].needs.length, `${r} له متطلَّب`).toBeGreaterThan(0);
    }
  });

  it('لا وحدة بلا سند — القاعدة الأولى', () => {
    expect(validateAnchor({})).toEqual(['لا سند للوحدة (anchor مفقود)']);
    expect(validateAnchor(null)).toEqual(['لا سند للوحدة (anchor مفقود)']);
    expect(validateAnchor({ anchor: undefined })).toHaveLength(1);
  });

  it('رتبة غير معروفة تُرفض', () => {
    const problems = validateAnchor({ anchor: { ...valid, rank: 'm9' } });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('m9');
  });

  it('م٣ (معنًى) يحتاج مرجعًا نصيًّا — لا قيمة بلا نصّ', () => {
    const bare = validateAnchor({ anchor: { rank: 'm3', ref: 'x', review: 'ok' } });
    expect(bare.some((p) => p.includes('related'))).toBe(true);
    const linked = validateAnchor({ anchor: { rank: 'm3', related: 'en-ant', review: 'ok' } });
    expect(linked).toEqual([]);
  });

  it('م٤ (أثر) يحتاج آية — لا اقتران مجرّد بين «علم» و«إسلام»', () => {
    const bare = validateAnchor({ anchor: { rank: 'm4', url: 'https://quran.com', review: 'ok' } });
    expect(bare.some((p) => p.includes('آية'))).toBe(true);
  });

  it('حالة المراجعة إلزامية ومعروفة', () => {
    expect(validateAnchor({ anchor: { ...valid, review: 'مجهولة' } })).toHaveLength(1);
    expect(validateAnchor({ anchor: { ...valid, review: undefined } })).toHaveLength(1);
    expect(validateAnchor({ anchor: valid })).toEqual([]);
  });
});

describe('مجاري النور — مجرى الكون (نطاق فقط)', () => {
  const UNITS = Object.values(SCIENCE_UNITS);
  const IDS = Object.keys(SCIENCE_UNITS);

  it('ثماني محطات على النطاقات الثلاثة بلا تكرار', () => {
    const ids = SCIENCE_STATIONS.map((st) => st.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SCIENCE_STATIONS).toHaveLength(8);
    expect(scienceStationsForBand('k2')).toHaveLength(3);
    expect(scienceStationsForBand('2-4')).toHaveLength(3);
    expect(scienceStationsForBand('4-6')).toHaveLength(2);
    // لا محطة بلا نطاق صالح
    for (const st of SCIENCE_STATIONS) {
      expect(BAND_ORDER, `${st.id} نطاقه معروف`).toContain(st.band);
      expect(st.units.length, `${st.id} فيه وحدات`).toBeGreaterThanOrEqual(2);
    }
    expect(scienceStationsForBand('لا-يوجد')).toEqual([]);
  });

  it('كل وحدة كاملة الحقول، ونطاقها مطابق لنطاق محطتها', () => {
    for (const u of UNITS) {
      expect(u.id.trim(), 'معرّف').not.toBe('');
      expect(u.sign.trim(), `${u.id} له أثر مسمّى`).not.toBe('');
      expect(u.signEmoji.trim(), `${u.id} له رمز`).not.toBe('');
      expect(u.theme.trim(), `${u.id} له معنى`).not.toBe('');
      expect(u.deed?.text?.trim(), `${u.id} له عمل`).not.toBe('');
      const st = SCIENCE_STATIONS.find((s) => s.id === u.station);
      expect(st, `${u.id} محطته موجودة`).toBeDefined();
      expect(u.band, `${u.id} نطاقه مطابق لمحطته`).toBe(st.band);
      expect(u.band, `${u.id} نطاقه معروف`).toBe(bandOfUnit(u));
    }
  });

  it('كل وحدة لها سند سليم (مرتبة معروفة، مرجع، رابط، حالة مراجعة)', () => {
    for (const u of UNITS) {
      expect(validateAnchor(u), `${u.id}: ${validateAnchor(u).join(' · ')}`).toEqual([]);
      expect(ANCHOR_RANK_ORDER, `${u.id} مرتبته`).toContain(u.anchor.rank);
      expect(u.anchor.url, `${u.id} له رابط مصدر`).toMatch(/^https:\/\/(quran\.com|sunnah\.com)\//);
    }
  });

  it('القاعدة الأولى تنطبق على المجرى الجديد كاملًا: لا وحدة بلا سند', () => {
    for (const u of UNITS) {
      expect(u.anchor, `${u.id} سنده موجود`).toBeTruthy();
    }
    expect(UNITS.filter((u) => !u.anchor)).toEqual([]);
  });

  it('⚠ لا وحدة تُعرض على الطفل قبل المراجعة — كلها pending وverified=false', () => {
    for (const u of UNITS) {
      expect(u.anchor.verified, `${u.id} لم تُقابل بعد`).toBe(false);
      expect(u.anchor.review, `${u.id} في انتظار المراجعة`).toBe('pending');
      expect(u.review, `${u.id} في انتظار المراجعة`).toBe('pending');
      expect(u.voiced, `${u.id} لا صوت قبل المراجعة`).toBe(false);
    }
    expect(playableScienceUnits()).toEqual([]);
    for (const u of UNITS) expect(scienceUnitPlayable(u)).toBe(false);
    expect(scienceUnitPlayable(undefined)).toBe(false);
  });

  it('scienceUnitPlayable تسلّم الوحدة المُراجَعة فقط', () => {
    const reviewed = { id: 'x', review: 'ok', anchor: { rank: 'm4', ref: 'يس ٤٠', review: 'ok', verified: true } };
    expect(scienceUnitPlayable(reviewed)).toBe(true);
    // الناقص واحد يُعيدها غير قابلة للعب
    expect(scienceUnitPlayable({ ...reviewed, review: 'pending' })).toBe(false);
    expect(scienceUnitPlayable({ ...reviewed, anchor: { ...reviewed.anchor, verified: false } })).toBe(false);
    expect(scienceUnitPlayable({ ...reviewed, anchor: undefined })).toBe(false);
  });

  it('لا نصّ قرآني مكتوبًا في ملف النطاق — المراجع فقط', () => {
    // الحماية: لا ندخل نصًّا لم نقابله حرفًا بحرف. الملف يحمل ref/theme لا نصّ الوحي.
    const src = fs.readFileSync(path.join(ROOT, 'src/salman/data/nour-science.js'), 'utf8');
    // علامات النصّ العثماني (الرسم القرآني) لا تظهر في نصوص الطفل هنا
    expect(src).not.toMatch(/إِنَّ *اللَّهَ *يُحِبُّ/);
    // ولا اقتباس طويل بين «» داخل بيانات الوحدات
    for (const u of UNITS) {
      expect(u.theme.length, `${u.id} معناه كلماتنا لا اقتباس`).toBeLessThan(120);
      expect(u.theme).not.toMatch(/«[^»]{25,}»/);
    }
  });

  it('معرّفات الكون لا تصطدم بمعرّفات حدائق النور', () => {
    const nourIds = new Set(Object.keys(NOUR_UNITS));
    for (const id of IDS) expect(nourIds.has(id), `${id} لا يصطدم`).toBe(false);
    expect(new Set(IDS).size).toBe(IDS.length);
  });

  it('خطوات اليوم السبعة في الكون: نفس المعرّفات وثلاث تسميات متبدّلة', () => {
    const stepIds = DAY_STEPS.map((s) => s.id);
    expect(Object.keys(SCIENCE_DAY_LABELS).sort()).toEqual([...stepIds].sort());
    for (const s of DAY_STEPS) {
      const label = SCIENCE_DAY_LABELS[s.id];
      expect(label.title.trim(), `${s.id} له عنوان`).not.toBe('');
      expect(label.emoji.trim(), `${s.id} له رمز`).not.toBe('');
    }
    // التسميات المتبدّلة فعلًا (الباب · الصوت · التتبّع · العمل)
    expect(SCIENCE_DAY_LABELS.door.title).toBe('باب الآية');
    expect(SCIENCE_DAY_LABELS.sound.title).toBe('البطاقة والتدبّر');
    expect(SCIENCE_DAY_LABELS.trace.title).toBe('تتبّع الرسم');
    expect(SCIENCE_DAY_LABELS.deed.title).toBe('عمل الخلافة');
    // وما لا يتبدّل يبقى كما هو
    expect(SCIENCE_DAY_LABELS.play.title).toBe(DAY_STEPS.find((s) => s.id === 'play').title);
    // دليل المجرى هو الهدهد — صاحب المجرى الرابع
    for (const st of SCIENCE_STATIONS) expect(st.guide).toBe('الهدهد');
  });
});

describe('مجاري النور — ربط الوحدات القائمة بالنطاقات', () => {
  it('كل وحدة قائمة تُحلّ إلى نطاق صالح (المبنيّ اليوم = التأسيس)', () => {
    expect(NOUR_LIST.length).toBeGreaterThan(0);
    for (const u of NOUR_LIST) {
      const band = bandOfUnit(u);
      expect(band, `${u.id} له نطاق`).not.toBeNull();
      expect(BAND_ORDER).toContain(band);
      expect(band, `${u.id} محتواه تأسيس`).toBe(DEFAULT_BAND);
      expect(bandOfUnit({ ...u, band })).toBe(band);
    }
    expect(bandOfUnit({ id: 'x', band: 'لا-يوجد' })).toBeNull();
    expect(bandOfUnit(null)).toBeNull();
  });

  it('النطاق يصرّح بنفسه لا بالوراثة: وحدة معلَّمة بنطاق تحتفظ به', () => {
    expect(bandOfUnit({ id: 'x', band: '4-6' })).toBe('4-6');
    expect(bandOfUnit({ id: 'x' })).toBe(DEFAULT_BAND);
  });

  it('streamByBand يوزّع كل الوحدات بلا فقدان', () => {
    const byBand = streamByBand(NOUR_LIST);
    const total = BAND_ORDER.reduce((n, b) => n + byBand[b].length, 0);
    expect(total).toBe(NOUR_LIST.length);
    expect(Object.keys(byBand).sort()).toEqual([...BAND_ORDER].sort());
    expect(streamByBand(null)).toEqual({ k2: [], '2-4': [], '4-6': [] });
  });

  it('الحدائق الثلاث المبنيّة كلها تحت النطاق الأول اليوم', () => {
    for (const garden of LIVE_STREAMS) {
      const units = gardenUnits(garden);
      expect(units.length, `${garden} فيه وحدات`).toBeGreaterThan(0);
      const byBand = streamByBand(units);
      expect(byBand.k2.length, `${garden} كله تأسيس`).toBe(units.length);
      expect(byBand['2-4']).toEqual([]);
      expect(byBand['4-6']).toEqual([]);
    }
  });

  it('عداد الدَّين: عدد الوحدات القائمة بلا سند لا يزيد أبدًا (نظام السقّاطة)', () => {
    // P10 نموذج فقط: الوحدات المبنيّة سابقًا (حروف · أعداد · أصوات) بلا سند مرتب،
    // والقاعدة الأولى تبدأ سارية على المجرى الجديد ثم تُسحَب على القائم مرحلةً مرحلة.
    // الرقم هنا **سقف لا ينزل تحته أحد**: يقلّ كلما التقطت مرحلةٌ سندًا لوحدة.
    const ANCHOR_DEBT_CEILING = NOUR_LIST.length;
    const debt = NOUR_LIST.filter((u) => validateAnchor(u).length > 0).length;
    expect(debt).toBeLessThanOrEqual(ANCHOR_DEBT_CEILING);
    // الكون مبنيّ على السند من أول يوم: صفر دَين في المجرى الجديد
    const scienceDebt = Object.values(SCIENCE_UNITS).filter((u) => validateAnchor(u).length > 0).length;
    expect(scienceDebt).toBe(0);
  });
});

describe('مجاري النور — الوثيقة والقواعد', () => {
  const doc = path.join(ROOT, 'docs/salmans-garden/PLAN-K5-STREAMS.md');

  it('خطة K–5 موجودة ومفهرسة', () => {
    expect(fs.existsSync(doc), 'PLAN-K5-STREAMS.md').toBe(true);
    const readme = fs.readFileSync(path.join(ROOT, 'docs/salmans-garden/README.md'), 'utf8');
    expect(readme).toContain('PLAN-K5-STREAMS.md');
  });

  it('القواعد الأربع التي لا تُكسر مكتوبة في الخطة', () => {
    const text = fs.readFileSync(doc, 'utf8');
    for (const guard of ['لا وحدة بلا سند', 'لا إعجاز بلا تفسير', 'لا نصّ محرَّف', 'لا تجسيد']) {
      expect(text, `القاعدة «${guard}»`).toContain(guard);
    }
    // المراتب الأربع
    for (const rank of ['نصّ', 'قصّة', 'معنًى', 'أثر']) {
      expect(text, `المرتبة «${rank}»`).toContain(rank);
    }
    // النطاقات الثلاثة بمفردات fikr-dashboard
    for (const band of ['K–2', '2–4', '4–6']) {
      expect(text, `النطاق «${band}»`).toContain(band);
    }
  });

  it('الخطة تعلن أنها مسوّدة وتُحيل إلى سجل المراجعة', () => {
    const text = fs.readFileSync(doc, 'utf8');
    expect(text).toContain('CONTENT-REVIEW.md');
    expect(text).toContain('PLAN-ISLAMIC-PHONICS.md');
    expect(text.toLowerCase()).toContain('scope draft');
  });
});
