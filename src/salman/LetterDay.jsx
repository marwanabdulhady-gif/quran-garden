// «يوم الوحدة» في حدائق النور: سبع خطوات لكل حرف أو رقم أو صوت (الخطة §4).
// تُستخدم للحدائق الثلاث نفسها؛ البيانات (وحدة nour) هي التي تختلف.
import React, { useMemo, useState } from 'react';
import { DAY_STEPS, dayPlan, dayProgress } from './lib/letterday.js';
import { Hunt, TracePad, OrderGame, StoryScene } from './Engines.jsx';
import { MASCOTS, GARDEN_MASCOT } from './data/art.js';
import { assetUrl, playStory } from './lib/voice.js';
import { speak, canSpeak } from './lib/speech.js';
import { sfx } from './lib/sfx.js';
import { toArabicNumeral } from './lib/catalog.js';

// اتجاه النص: العربية RTL والإنجليزية LTR — الشاشة كلها RTL، والنص الإنجليزي يحتاج dir خاصًا
const dirOf = (lang) => (lang === 'en' ? 'ltr' : 'rtl');

// لغة العرض: الإنجليزية LTR، والعربية والأرقام RTL
const unitLang = (unit) => (unit.garden === 'english' ? 'en' : 'ar');

// تشغيل مقطع من المكتبة بمساره العام (public/...): نُجرّده إلى مفتاح playStory
const playAsset = (path) =>
  playStory(
    String(path)
      .replace(/^salman\/audio\//, '')
      .replace(/\.mp3$/, ''),
    ''
  );

// سطر «من أين القصة؟» تحت عنوانها في باب الحكاية
const STORY_FROM = {
  prophet: 'قصة من حياة النبي ﷺ',
  companions: 'قصة من أصحاب النبي ﷺ',
  quran: 'قصة من القرآن',
  hadith: 'قصة من الحديث',
  count: 'قصة عدٍّ من الحديقة',
};

// تمييز الكلمة المفتاحية داخل نص القصة
function highlight(text, keyWord) {
  if (!keyWord) return [text];
  return text.split(keyWord).flatMap((part, i, arr) => (i < arr.length - 1 ? [part, { key: true }] : [part]));
}

export default function LetterDay({
  unit,
  color,
  backdrop,
  mascot,
  dayIndex = 0,
  storyIndex,
  initialDone = [],
  onProgress,
  onDone,
  onExit,
}) {
  const plan = useMemo(() => dayPlan(unit, { dayIndex }), [unit, dayIndex]);
  // نكمل من حيث توقّف الطفل: أول خطوة لم تُنجز بعد
  const [done, setDone] = useState(() => initialDone.filter((id) => plan.some((s) => s.id === id)));
  const [index, setIndex] = useState(() => {
    const i = plan.findIndex((s) => !initialDone.includes(s.id));
    return i < 0 ? 0 : i;
  });
  const [solved, setSolved] = useState(false);
  const [pick, setPick] = useState(storyIndex ?? 0);
  const step = plan[index];
  const progress = dayProgress(done);
  const guide = mascot || GARDEN_MASCOT[unit.garden];

  // كلمة القصة: اليوم الأول قصة النبي ﷺ أو القرآن، والثاني قصة الصحابي (إن وُجدت)
  const story = plan.find((s) => s.id === 'story')?.story;
  const chosen = unit.stories?.[pick] || story;

  const markDone = (id) => {
    if (done.includes(id)) return;
    const nextDone = [...done, id];
    setDone(nextDone);
    if (nextDone.length < plan.length) onProgress?.(nextDone);
  };
  // أبعد خطوة يمكن الرجوع إليها: ما أُنجز وما بعده مباشرة
  const reach = Math.max(index, ...plan.map((s, i) => (done.includes(s.id) ? i + 1 : 0)));

  const next = () => {
    markDone(step.id);
    setSolved(false);
    if (index + 1 >= plan.length) {
      onDone?.([...done, step.id]);
      return;
    }
    setIndex(index + 1);
    sfx('tap');
  };

  const skip = () => {
    setSolved(false);
    if (index + 1 >= plan.length) onDone?.(done);
    else setIndex(index + 1);
  };

  const backStep = () => setIndex((i) => Math.max(0, i - 1));

  const sayStory = () => {
    if (chosen.voiced) playStory(`nour/${chosen.id}`, chosen.text, chosen.lang || 'ar');
    else speak(chosen.text, chosen.lang || 'ar');
  };

  const chantText = unit.chant.text;
  const sayChant = () => {
    if (unit.chant.voiced) playStory(`nour/${unit.clip || unit.id}-chant`, chantText, unit.chant.lang || 'ar');
    else speak(chantText, unit.chant.lang || 'ar');
  };

  const lang = chosen?.lang || unit.chant.lang || 'ar';
  const storyDir = dirOf(lang);

  return (
    <main className="sg-app sg-day" dir="rtl">
      <header className="sg-day-head" style={{ '--g': color }}>
        <button type="button" className="sg-icon-btn" onClick={onExit} aria-label="رجوع">
          ➜
        </button>
        <div className="sg-day-title">
          <strong lang={unitLang(unit)}>
            {unit.glyph} · {unit.keyWord}
          </strong>
          <span>
            {unit.garden === 'arabic' ? 'حروف النور' : unit.garden === 'math' ? 'أرقام النور' : 'Letters of Light'} ·{' '}
            {dayIndex === 0 ? 'اليوم الأول' : 'يوم المراجعة'}
          </span>
        </div>
        <img className="sg-day-mascot" src={assetUrl(MASCOTS[guide])} alt="" />
      </header>

      <nav className="sg-day-path" style={{ '--g': color }} aria-label="خطوات اليوم">
        <p className="sg-day-path-head">
          <span>
            الخطوة {toArabicNumeral(index + 1)} من {toArabicNumeral(plan.length)} — <strong>{step.title}</strong>
          </span>
          <span className="sg-day-path-count">
            ✅ {toArabicNumeral(progress.done)} / {toArabicNumeral(progress.total)}
          </span>
        </p>
        <ol
          className="sg-day-steps"
          style={{ '--n': plan.length, '--fill': plan.length > 1 ? Math.min(1, index / (plan.length - 1)) : 0 }}
        >
          {plan.map((s, i) => {
            const isDone = done.includes(s.id);
            const state = i === index ? 'is-now' : isDone ? 'is-done' : i > reach ? 'is-locked' : '';
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`sg-day-step ${state}`}
                  onClick={() => i <= reach && setIndex(i)}
                  disabled={i > reach}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`${toArabicNumeral(i + 1)}. ${s.title}${isDone ? ' · أُنجزت' : ''}`}
                >
                  <span className="sg-day-stone" aria-hidden="true">
                    <span className="sg-day-emoji">{s.emoji}</span>
                    {isDone && i !== index && <span className="sg-day-check">✓</span>}
                  </span>
                  <span className="sg-day-step-label">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {step.id === 'door' && (
        <section className="sg-day-card">
          <p className="sg-guide-line">
            <img className="sg-mascot" src={assetUrl(MASCOTS[guide])} alt="" />
            <span className="sg-bubble">هيا نفتح كتاب الحكاية 📖</span>
          </p>
          <h2 className="sg-title" lang={lang} dir={storyDir}>
            {chosen.title}
          </h2>
          {unit.stories.length > 1 && (
            <button
              type="button"
              className="sg-btn sg-btn-soft"
              onClick={() => setPick((n) => (n + 1) % unit.stories.length)}
            >
              ↺ القصة الأخرى ({pick + 1} / {unit.stories.length})
            </button>
          )}
          <p className="sg-sub" lang={lang}>
            {STORY_FROM[chosen.from] || 'A story from the Quran'}
          </p>
        </section>
      )}

      {step.id === 'story' && (
        <section className="sg-day-card">
          <StoryScene unit={unit} color={color} backdrop={backdrop} />
          <h2 className="sg-title" lang={lang} dir={storyDir}>
            {chosen.title}
          </h2>
          <p className="sg-story-text" lang={lang} dir={storyDir}>
            {highlight(chosen.text, unit.keyWord).map((part, i) =>
              typeof part === 'string' ? (
                part
              ) : (
                <mark key={i} style={{ background: `${color}33`, color }}>
                  {unit.keyWord}
                </mark>
              )
            )}
          </p>
          {canSpeak() && (
            <button type="button" className="sg-btn sg-btn-soft" onClick={sayStory}>
              🔊 اسمع القصة
            </button>
          )}
          {chosen.ref && (
            <p className="sg-source" lang="ar">
              المصدر: {chosen.ref}
              {chosen.url && (
                <>
                  {' · '}
                  <a href={chosen.url} target="_blank" rel="noreferrer">
                    الرابط
                  </a>
                </>
              )}
              {chosen.review === 'note' && <span className="sg-source-note"> · 🟡 ملاحظة مراجعة</span>}
              {chosen.review === 'pending' && <span className="sg-source-note"> · ⬜ قيد المراجعة</span>}
            </p>
          )}
          {chosen.note && (
            <p className="sg-source-note" lang="ar">
              {chosen.note}
            </p>
          )}
          {unit.related && (
            <p className="sg-related" lang="ar">
              🔗 {unit.related.labelAr}
            </p>
          )}
        </section>
      )}

      {step.id === 'sound' && (
        <section className="sg-day-card">
          <p className="sg-sound-big" style={{ color }} lang={unitLang(unit)}>
            {unit.sound || unit.glyph}
          </p>
          <p className="sg-action-line" lang={lang}>
            <span className="sg-action-emoji" aria-hidden="true">
              {unit.action.emoji}
            </span>
            {unit.action.text}
          </p>
          <ul className="sg-chant">
            {unit.chant.lines.map((line) => (
              <li key={line} lang={lang} dir={dirOf(lang)}>
                {line}
              </li>
            ))}
          </ul>
          {canSpeak() && (
            <button
              type="button"
              className="sg-btn sg-btn-main"
              style={{ background: color, boxShadow: `0 4px 0 ${color}` }}
              onClick={sayChant}
            >
              🎵 اسمع النشيد وردّده
            </button>
          )}
          {unit.letterAudio && (
            <button type="button" className="sg-btn sg-btn-soft" onClick={() => playAsset(unit.letterAudio)}>
              🔤 اسمع الحرف مع صورته
            </button>
          )}
          <p className="sg-sub" lang="ar">
            النشيد بصوت فقط — بلا آلات ولا إيقاع موسيقي، والتصفيق مسموح.
          </p>
        </section>
      )}

      {step.id === 'hunt' && (
        <section className="sg-day-card">
          <Hunt hunt={step.hunt} color={color} lang={lang} onDone={() => setSolved(true)} />
          {solved && (
            <button type="button" className="sg-btn sg-btn-main" style={{ background: color }} onClick={next}>
              التالي ➜
            </button>
          )}
        </section>
      )}

      {step.id === 'trace' && (
        <section className="sg-day-card">
          <TracePad trace={step.trace} color={color} onDone={() => setSolved(true)} />
          {solved && (
            <button type="button" className="sg-btn sg-btn-main" style={{ background: color }} onClick={next}>
              التالي ➜
            </button>
          )}
        </section>
      )}

      {step.id === 'play' && (
        <section className="sg-day-card">
          <OrderGame
            round={step.round}
            variant={step.engine}
            color={color}
            lang={lang}
            onDone={() => setSolved(true)}
          />
          {solved && (
            <button type="button" className="sg-btn sg-btn-main" style={{ background: color }} onClick={next}>
              التالي ➜
            </button>
          )}
        </section>
      )}

      {step.id === 'deed' && (
        <section className="sg-day-card">
          <p className="sg-deed-emoji" aria-hidden="true">
            {unit.deed.emoji}
          </p>
          <h2 className="sg-title" lang="ar">
            عمل اليوم
          </h2>
          <p className="sg-deed-text" lang="ar">
            {unit.deed.text}
          </p>
          <button
            type="button"
            className="sg-btn sg-btn-main"
            style={{ background: color, boxShadow: `0 4px 0 ${color}` }}
            onClick={() => onDone?.([...done, 'deed'])}
          >
            فعلناه ✓ (+⭐⭐)
          </button>
        </section>
      )}

      <footer className="sg-day-foot">
        {index > 0 && (
          <button type="button" className="sg-btn sg-btn-soft" onClick={backStep}>
            ↩️ السابق
          </button>
        )}
        {step.id !== 'deed' && !['hunt', 'trace', 'play'].includes(step.id) && (
          <button
            type="button"
            className="sg-btn sg-btn-main"
            style={{ background: color, boxShadow: `0 4px 0 ${color}` }}
            onClick={next}
          >
            التالي ➜
          </button>
        )}
        {['hunt', 'trace', 'play'].includes(step.id) && !solved && (
          <button type="button" className="sg-btn sg-btn-soft" onClick={skip}>
            تخطّي الآن ➜
          </button>
        )}
      </footer>

      {step.id === 'story' && !canSpeak() && (
        <p className="sg-sub" lang="ar">
          الصوت غير متاح في هذا المتصفح الآن — النص أمامك.
        </p>
      )}
      <p className="sg-sub" aria-hidden="true">
        {' '}
      </p>
    </main>
  );
}
