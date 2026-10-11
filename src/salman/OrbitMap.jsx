import React from 'react';
import { toArabicNumeral } from './lib/catalog.js';

// خريطة الكواكب: كل محطة كوكب، وعناصرها (حروف أو سور) تدور حوله في مدار.
// الكواكب متصلة بطريق منقّط، والدليل يقف عند أول محطة لم تكتمل بعد.
// station: { id, title, color, items: [{ key, label, done }], onOpen }
export default function OrbitMap({ stations, onItem, guideArt, label }) {
  const current = stations.findIndex((s) => s.items.some((it) => !it.done));
  return (
    <ol className="sg-orbit-map" aria-label={label}>
      {stations.map((st, i) => {
        const done = st.items.filter((it) => it.done).length;
        const side = i % 2 === 0 ? 'is-start' : 'is-end';
        const n = st.items.length;
        return (
          <li key={st.id} className={`sg-orbit-row ${side}`}>
            {i > 0 && (
              <svg className="sg-orbit-link" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                <path d={i % 2 === 0 ? 'M80 0 C 80 25, 20 15, 20 40' : 'M20 0 C 20 25, 80 15, 80 40'} />
              </svg>
            )}
            <div className="sg-orbit" style={{ '--p': st.color }}>
              <span className="sg-orbit-ring" aria-hidden="true" />
              <button
                type="button"
                className="sg-planet"
                onClick={st.onOpen}
                aria-label={`${st.title} · ${toArabicNumeral(done)} من ${toArabicNumeral(n)}`}
              >
                <span className="sg-planet-num">{done === n ? '✓' : toArabicNumeral(i + 1)}</span>
              </button>
              {st.items.map((it, k) => {
                // توزيع العناصر على المدار بالتساوي، بدءًا من الأعلى
                const angle = (360 / n) * k - 90;
                return (
                  <button
                    key={it.key}
                    type="button"
                    className={it.done ? 'sg-moon is-done' : 'sg-moon'}
                    style={{ '--a': `${angle}deg` }}
                    onClick={() => onItem(st, it)}
                    aria-label={`${it.label}${it.done ? ' · مكتمل' : ''}`}
                  >
                    <span className="sg-moon-inner">
                      <span className="sg-moon-label">{it.label}</span>
                      {it.done && (
                        <span className="sg-moon-medal" aria-hidden="true">
                          ⭐
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
              {i === current && guideArt && <img className="sg-orbit-guide" src={guideArt} alt="" />}
            </div>
            <button type="button" className="sg-orbit-caption" onClick={st.onOpen}>
              <strong>{st.title}</strong>
              <span>
                ⭐ {toArabicNumeral(done)} / {toArabicNumeral(n)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
