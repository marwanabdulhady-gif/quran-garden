import React, { useEffect, useMemo, useState } from 'react';
import { useGarden, activeChild, updateChild, discoveredCount, streakOf } from './store.js';
import { GATES, SURAH_META, SURAH_NAMES_FALLBACK, JOURNEY_TOTAL_AYAHS } from './data.js';
import { getSurahs } from './api.js';
import { cleanAyah, downloadJson } from './Shared.jsx';
import { sfx } from './sound.js';

const ALL_SURAHS = Object.keys(SURAH_META)
  .map(Number)
  .sort((a, b) => a - b);

function childSurah(listening) {
  for (const n of ALL_SURAHS) {
    const p = listening[n];
    if (p?.heard && !p.completed) return n;
  }
  for (const n of ALL_SURAHS) if (!listening[n]?.completed) return n;
  return 77;
}

function GateSection({ gate, listening, go }) {
  const [armed, setArmed] = useState(false);
  const rows = ALL_SURAHS.filter((n) => n >= gate.from && n <= gate.to).map((n) => ({
    number: n,
    name: SURAH_NAMES_FALLBACK[n],
    numberOfAyahs: SURAH_META[n],
  }));
  const done = rows.filter((x) => listening[x.number]?.completed).length;

  const onEnter = () => {
    if (!armed) {
      sfx.tap();
      setArmed(true);
      setTimeout(() => setArmed(false), 3000);
    } else {
      sfx.ok();
      go('gate', { gate: gate.id });
    }
  };

  return (
    <div className="map-gate">
      <div className="map-gate-head">
        <div>
          <div style={{ fontWeight: 900, fontSize: 16 }}>{gate.title}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            {done} من {rows.length} سورة اكتملت
          </div>
        </div>
        <button className={'btn small ' + (armed ? 'warm' : 'ghost')} onClick={onEnter}>
          {armed ? 'اضغط مرة أخرى للدخول' : 'ادخل البوابة'}
        </button>
      </div>
      <div className="map-progress">
        <i style={{ width: (done / rows.length) * 100 + '%' }} />
      </div>
    </div>
  );
}

export default function JourneyMap({ go }) {
  const s = useGarden();
  const child = activeChild(s);
  const [surahs, setSurahs] = useState(null);
  const [q, setQ] = useState('');
  const [jumpTo, setJumpTo] = useState('');

  useEffect(() => {
    getSurahs()
      .then(setSurahs)
      .catch(() => {});
  }, []);

  const nameOf = (n) => surahs?.find((x) => x.number === n)?.name || SURAH_NAMES_FALLBACK[n] || 'سورة ' + n;
  const countOf = (n) => surahs?.find((x) => x.number === n)?.numberOfAyahs || SURAH_META[n] || 0;

  const listening = child.listening || {};
  const current = childSurah(listening);
  const doneSurahs = ALL_SURAHS.filter((n) => listening[n]?.completed).length;
  const heardTotal = ALL_SURAHS.reduce((a, n) => a + (listening[n]?.heard || 0), 0);
  const disc = discoveredCount(child);

  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    return ALL_SURAHS.filter((n) => cleanAyah(nameOf(n)).includes(q.trim()) || String(n) === q.trim()).slice(0, 6);
    // eslint-disable-next-line
  }, [q, surahs]);

  const jump = (n) => {
    sfx.ok();
    setQ('');
    setJumpTo('');
    const gate = n <= 66 ? GATES[1] : GATES[0];
    go('player', { gate: gate.id, surah: n });
  };

  return (
    <div className="screen gate-screen">
      <div className="topbar">
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('garden');
          }}
          aria-label="العودة"
        >
          ←
        </button>
        <div className="title">🗺️ رحلة حفظ القرآن</div>
        <span className="chip star-count">⭐ {child.stars}</span>
        {streakOf(child) >= 2 && <span className="chip streak-chip">🔥 {streakOf(child)}</span>}
      </div>

      <div className="journey-head" style={{ paddingTop: 4 }}>
        <span className="kicker">حفظ رحلة {child.name}</span>
        <p style={{ marginTop: 10 }}>
          التقدّم بيتحفظ تلقائيًا في المتصفح ده. نزّل نسخة تحتفظ بيها أو تنقلها لجهاز تاني.
        </p>
      </div>

      <div className="journey-stats">
        <div className="stat-card">
          <div className="num">
            {doneSurahs} / {ALL_SURAHS.length}
          </div>
          <div className="lbl">🎧 سور مكتملة</div>
        </div>
        <div className="stat-card">
          <div className="num">
            {heardTotal} / {JOURNEY_TOTAL_AYAHS}
          </div>
          <div className="lbl">📖 آيات سمعت</div>
        </div>
        <div className="stat-card">
          <div className="num">{disc} / ٣٠</div>
          <div className="lbl">🌉 كلمات الجسر</div>
        </div>
      </div>

      <div className="map-card">
        <div className="map-row">
          <div>
            <div style={{ fontWeight: 900, fontSize: 14 }}>🔍 انتقال سريع</div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              اكتب اسم السورة أو رقمها
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', maxWidth: 220 }}>
            <input
              className="map-search"
              placeholder="🔍 انتقال سريع..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {suggestions.length > 0 && (
              <div className="map-suggest">
                {suggestions.map((n) => (
                  <button key={n} onClick={() => jump(n)}>
                    {cleanAyah(nameOf(n))} · {n}
                  </button>
                ))}
              </div>
            )}
          </div>
          <select
            value={jumpTo}
            onChange={(e) => {
              setJumpTo(e.target.value);
              if (e.target.value) jump(+e.target.value);
            }}
          >
            <option value="">الانتقال إلى سورة…</option>
            {ALL_SURAHS.map((n) => (
              <option key={n} value={n}>
                {cleanAyah(nameOf(n))} · {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* المسار */}
      <div className="map-path">
        <div className="map-path-line" />
        {ALL_SURAHS.map((n) => {
          const p = listening[n] || {};
          const prog = p.heard ? Math.min(1, p.heard / countOf(n)) : 0;
          const isCurrent = n === current;
          const gate = n <= 66 ? 'qadsama' : 'tabarak';
          return (
            <React.Fragment key={n}>
              {n === 67 && (
                <div className="map-sep">
                  <GateSection gate={GATES[0]} listening={listening} go={go} />
                </div>
              )}
              {n === 58 && (
                <div className="map-sep">
                  <GateSection gate={GATES[1]} listening={listening} go={go} />
                </div>
              )}
              <button
                className={'map-node' + (p.completed ? ' done' : '') + (isCurrent ? ' current' : '')}
                onClick={() => {
                  sfx.tap();
                  jump(n);
                }}
              >
                <span className="map-dot">
                  {p.completed ? '✓' : n}
                  <i style={{ transform: `rotate(${prog * 360}deg)` }} />
                </span>
                <span className="map-info">
                  <b>{cleanAyah(nameOf(n))}</b>
                  <small>
                    {countOf(n)} آية{p.heard ? ` · ${p.heard} سمعت` : ''}
                    {p.completed ? ' · تمّت ✓' : ''}
                  </small>
                </span>
                {isCurrent && (
                  <span className="map-hero">
                    <img
                      src={child.avatar || '/assets/hero-standing-t.png'}
                      alt={`مكان ${child.name} عند السورة المختارة`}
                    />
                    <span className="map-you">بطلك هنا</span>
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <div className="step-actions" style={{ maxWidth: 560, margin: '8px auto 0', padding: '0 14px' }}>
        <button
          className="btn warm"
          onClick={() => {
            sfx.tap();
            go('daily');
          }}
        >
          🤍 كل يوم: آية جديدة
        </button>
        <button
          className="btn ghost"
          onClick={() =>
            downloadJson(`quran-garden-${child.name}-${new Date().toISOString().slice(0, 10)}.json`, {
              app: 'quran-garden',
              version: 1,
              childId: child.id,
              name: child.name,
              exportedAt: new Date().toISOString(),
              data: child,
            })
          }
        >
          ⬇️ تنزيل نسخة
        </button>
        <button className="btn ghost" onClick={() => go('settings')}>
          ⚙️ الإعدادات الكاملة
        </button>
      </div>
    </div>
  );
}
