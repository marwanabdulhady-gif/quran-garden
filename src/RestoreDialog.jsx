import React, { useMemo, useState } from 'react';
import {
  useGarden,
  sanitizeFamily,
  hasProgress,
  discoveredCount,
  pairChildren,
  restoreWithDecisions,
  restoreFamily,
} from './store.js';
import { Modal } from './Shared.jsx';
import { sfx } from './sound.js';

const progressLine = (c) => {
  const words = discoveredCount(c);
  const surahs = Object.values(c.listening || {}).filter((l) => (l?.heard || 0) > 0).length;
  return `⭐ ${c.stars}${words ? ` · 🌱 ${words} كلمة` : ''}${surahs ? ` · 🎧 ${surahs} سورة` : ''}`;
};

// مودال الاسترجاع العائلي: بيعرض تقدّم "هذا الجهاز" مقابل "الرابط" لكل طفل،
// ومايستبدل أي شيء تلقائيًا — المستخدم يحسم: احتفظ / خذ / ادمج.
export default function RestoreDialog({ family, onClose, onApplied }) {
  const s = useGarden();
  const clean = useMemo(() => sanitizeFamily(family), [family]);
  const { pairs, extra } = useMemo(
    () => (clean ? pairChildren(s.children, clean.children) : { pairs: [], extra: [] }),
    [clean, s.children]
  );
  const [decisions, setDecisions] = useState(() => {
    const d = {};
    for (const p of pairs) if (p.conflict) d[p.local.id] = 'local';
    return d;
  });

  if (!clean) {
    return (
      <Modal title="رابط غير صالح" onClose={onClose}>
        <p style={{ fontWeight: 700, lineHeight: 2, fontSize: 14 }}>
          الرابط ده مش صالح أو ناقص. تأكد إنه منسوخ كله من أوله لآخره.
        </p>
        <div className="step-actions">
          <button className="btn" onClick={onClose}>
            حاضر
          </button>
        </div>
      </Modal>
    );
  }

  const anyConflict = pairs.some((p) => p.conflict);
  const localHasProgress = s.children.some(hasProgress);
  const incomingNames = clean.children.map((c) => c.name).join('، ');

  const apply = (mode) => {
    const ok = mode === 'all' ? restoreFamily(clean) : restoreWithDecisions(clean, decisions);
    if (ok) {
      try {
        history.replaceState(null, '', location.pathname);
      } catch (e) {
        /* ما يهمش */
      }
      onApplied?.(mode === 'all' ? 'اتفتحت حديقة الرابط كاملة 🌳' : 'تم استرجاع الحديقة بنجاح 🌟');
    } else {
      onApplied?.('تعذّر استرجاع البيانات من هذا الرابط');
    }
    onClose();
  };

  return (
    <Modal title="استرجاع حديقة أسرتك 🔑" onClose={onClose} wide>
      <p style={{ fontWeight: 700, lineHeight: 2, fontSize: 14 }}>
        وصلك رابط حديقة لأطفال: <b>{incomingNames}</b>.
      </p>

      {!anyConflict && !localHasProgress ? (
        <p style={{ fontWeight: 700, lineHeight: 2, fontSize: 14 }}>
          هذا الجهاز لسه ما فيهش تقدم، فهنفتح حديقتك من الرابط مباشرة — مفيش حاجة هنا هتتفقد.
        </p>
      ) : (
        <div className="conflict-list">
          {pairs.map((p) => {
            if (!p.inc) {
              return (
                <div key={p.local.id} className="conflict-row keep">
                  <b>{p.local.name}</b>
                  <span className="muted">موجود هنا فقط — هيفضل كما هو ✓</span>
                </div>
              );
            }
            if (!p.conflict) {
              const takeLink = !hasProgress(p.local);
              return (
                <div key={p.local.id} className="conflict-row">
                  <b>{p.local.name}</b>
                  <span className="muted">
                    {takeLink
                      ? `هذا الجهاز: بلا تقدم → سنأخذ التقدم من الرابط (${progressLine(p.inc)}) ✓`
                      : `الرابط: بلا تقدم → نحتفظ بتقدم هذا الجهاز (${progressLine(p.local)}) ✓`}
                  </span>
                </div>
              );
            }
            return (
              <div key={p.local.id} className="conflict-row conflict">
                <b>⚠️ {p.local.name} — يوجد تقدم مختلف على الجهازين</b>
                <div className="conflict-compare">
                  <span className="c-side">🖥 هذا الجهاز: {progressLine(p.local)}</span>
                  <span className="c-vs" aria-hidden>
                    ⇄
                  </span>
                  <span className="c-side">🔗 الرابط: {progressLine(p.inc)}</span>
                </div>
                <div className="conflict-opts">
                  <button
                    className={'mini-btn' + (decisions[p.local.id] === 'local' ? ' on' : '')}
                    onClick={() => setDecisions((d) => ({ ...d, [p.local.id]: 'local' }))}
                  >
                    🖥 احتفظ بهذا الجهاز
                  </button>
                  <button
                    className={'mini-btn' + (decisions[p.local.id] === 'link' ? ' on' : '')}
                    onClick={() => setDecisions((d) => ({ ...d, [p.local.id]: 'link' }))}
                  >
                    📥 خذ من الرابط
                  </button>
                  <button
                    className={'mini-btn warm' + (decisions[p.local.id] === 'merge' ? ' on' : '')}
                    onClick={() => setDecisions((d) => ({ ...d, [p.local.id]: 'merge' }))}
                  >
                    🔗 ادمج الاثنين (الأحسن)
                  </button>
                </div>
                <p className="hint" style={{ marginTop: 4 }}>
                  الدمج ياخد: الأكبر عددًا من النجوم، كل الأوسمة، كل الكلمات المكتشفة، وأعلى تقدم سماع لكل سورة. الصور
                  تبقى من هذا الجهاز.
                </p>
              </div>
            );
          })}
          {extra.length > 0 && (
            <div className="conflict-row">
              <b>أطفال إضافيون في الرابط</b>
              <span className="muted">{extra.map((c) => c.name).join('، ')} — هيتضافوا لحديقتك هنا</span>
            </div>
          )}
        </div>
      )}

      <p className="hint" style={{ marginTop: 10 }}>
        ملاحظة: الرابط يحمل التقدم فقط — الصور تبقى على كل جهاز.
      </p>

      <div className="step-actions">
        <button
          className="btn"
          onClick={() => {
            sfx.ok();
            apply('decisions');
          }}
        >
          💾 طبّق الاسترجاع
        </button>
        <button
          className="btn warm"
          onClick={() => {
            sfx.tap();
            apply('all');
          }}
        >
          📥 افتح حديقة الرابط كاملة (استبدال كل شيء)
        </button>
        <button className="btn ghost" onClick={onClose}>
          إلغاء — أبقى في حديقة هذا الجهاز
        </button>
      </div>
    </Modal>
  );
}
