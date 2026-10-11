import React from 'react';
import { toArabicNumeral } from './lib/catalog.js';
import { assetUrl } from './lib/voice.js';

// خريطة الحديقة: طريق متعرّج، كل محطة شجرة تنمو مع التقدّم، وعناصرها (حروف · أعداد · أصوات · سور)
// أزهار حولها بحلقة تقدّم. نفس الخريطة للحدائق الأربع، بلون كل حديقة.
// station: { id, title (نص أو عنصر)، name? (نص للقارئ الصوتي)، onOpen, items: [{ key, label, done, progress (0..1), gems?: [{ icon, on }], lang? }] }

const pct = (x) => Math.round(Math.max(0, Math.min(1, x || 0)) * 100);

// مرحلة الشجرة من نسبة التقدّم: بذرة ← شتلة ← شجرة ← شجرة مزهرة ← بستان
export function treeStage(ratio) {
  if (ratio >= 1) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.3) return 3;
  if (ratio > 0) return 2;
  return 1;
}

const itemRatio = (it) => (it.done ? 1 : Math.max(0, Math.min(1, it.progress || 0)));

export function stationRatio(items) {
  if (!items.length) return 0;
  return items.reduce((n, it) => n + itemRatio(it), 0) / items.length;
}

export default function GardenMap({ stations, onItem, guideArt, label, color }) {
  const current = stations.findIndex((s) => s.items.some((it) => !it.done));
  return (
    <ol className="sg-gmap" aria-label={label} style={color ? { '--g': color } : undefined}>
      {stations.map((st, i) => {
        const done = st.items.filter((it) => it.done).length;
        const n = st.items.length;
        const ratio = stationRatio(st.items);
        const side = i % 2 === 0 ? 'is-start' : 'is-end';
        const here = i === current;
        const nextKey = here ? st.items.find((it) => !it.done)?.key : null;
        const cls = ['sg-gstop', side, here ? 'is-current' : '', done === n ? 'is-done' : ''].filter(Boolean).join(' ');
        return (
          <li key={st.id} className={cls}>
            {i > 0 && (
              <svg className="sg-gpath" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                <path d={i % 2 === 0 ? 'M78 0 C 78 26, 22 14, 22 40' : 'M22 0 C 22 26, 78 14, 78 40'} />
              </svg>
            )}
            <div className="sg-gstop-head">
              <button
                type="button"
                className="sg-gtree"
                onClick={st.onOpen}
                aria-label={`${st.name || st.title} · ${toArabicNumeral(done)} من ${toArabicNumeral(n)}`}
              >
                <img src={assetUrl(`salman/art/growth-${treeStage(ratio)}.png`)} alt="" loading="lazy" />
                <span className="sg-gtree-num">{done === n ? '✓' : toArabicNumeral(i + 1)}</span>
              </button>
              {here && guideArt && <img className="sg-gguide" src={guideArt} alt="" />}
              <button type="button" className="sg-gsign" onClick={st.onOpen}>
                <strong>{st.title}</strong>
                <span className="sg-gbar" aria-hidden="true">
                  <span style={{ width: `${pct(ratio)}%` }} />
                </span>
                <span className="sg-gsign-count">
                  ⭐ {toArabicNumeral(done)} من {toArabicNumeral(n)} — {toArabicNumeral(pct(ratio))}٪
                </span>
              </button>
            </div>
            <ul className="sg-gblooms">
              {st.items.map((it) => {
                const r = itemRatio(it);
                const bcls = [
                  'sg-bloom',
                  String(it.label).length > 2 ? 'is-word' : '',
                  it.done ? 'is-done' : '',
                  it.key === nextKey ? 'is-next' : '',
                ]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={it.key}>
                    <button
                      type="button"
                      className={bcls}
                      style={{ '--p': `${pct(r)}%` }}
                      onClick={() => onItem(st, it)}
                      aria-label={`${it.label} · ${it.done ? 'مكتمل' : `${toArabicNumeral(pct(r))}٪`}`}
                    >
                      <span className="sg-bloom-ring">
                        <span className="sg-bloom-label" lang={it.lang}>
                          {it.label}
                        </span>
                      </span>
                      {it.done && (
                        <span className="sg-bloom-star" aria-hidden="true">
                          ⭐
                        </span>
                      )}
                      {it.gems && (
                        <span className="sg-bloom-gems" aria-hidden="true">
                          {it.gems.map((g) => (
                            <span key={g.icon} className={g.on ? 'sg-gem is-on' : 'sg-gem'}>
                              {g.icon}
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
