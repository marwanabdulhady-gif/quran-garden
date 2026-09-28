import React, { useState } from 'react';
import { useGarden, streakOf } from './store.js';
import { BADGES } from './data.js';
import { renderShareCard } from './shareCard.js';
import { sfx } from './sound.js';

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const fmtDate = (ts) => {
  if (!ts || !Number.isFinite(Number(ts))) return '';
  const d = new Date(Number(ts));
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// جدار الأوسمة: كل وسام بحالته (متحصل عليه + التاريخ / مقفل + طريقة الوصول إليه)
export default function Badges({ go, childId }) {
  const s = useGarden();
  const child =
    s.children.find((c) => c.id === childId) || s.children.find((c) => c.id === s.activeChildId) || s.children[0];
  const earned = new Map((child.badges || []).map((b) => [b.id, b.at]));
  const total = Object.keys(BADGES).length;
  const n = earned.size;
  const streak = streakOf(child);
  const [shareMsg, setShareMsg] = useState('');

  const share = async () => {
    sfx.tap();
    try {
      const { blob, url } = await renderShareCard(child);
      const fileName = `quran-garden-${child.name || 'traveler'}.png`;
      // لو المشاركة مضمّنة بالمتصفح — بنشارك ملف الصورة
      if (navigator.share && blob) {
        try {
          const file = new File([blob], fileName, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'تقدمي في حديقة القرآن' });
            setShareMsg('شاركنا بطاقتك! 📸');
            return;
          }
        } catch (e) {
          /* المستخدم قلل — بننزل الصورة بدل كده */
        }
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setShareMsg('نزلنا لك بطاقتك 📸 — حطها على السوشيال!');
    } catch (e) {
      setShareMsg('ما قدرناش نعمل البطاقة دلوقتي — جرب تاني');
    }
    setTimeout(() => setShareMsg(''), 3200);
  };

  return (
    <div className="screen badges-screen">
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
        <div className="title">🏅 أوسمتي — {child.name}</div>
        <span className="chip">
          {n} / {total}
        </span>
      </div>

      <div className="badges-head">
        <h1>جدار الأوسمة 🏆</h1>
        <p>كل وسام بيتفتح بجزء صغير من رحلتك. الوسامات الرمادية لسه ما اتفتحتش — قراء طريقة الوصول تحت كل وسام!</p>
        {streak >= 2 && <span className="chip streak-chip">🔥 {streak} أيام متتالية</span>}
      </div>

      <div className="badges-grid">
        {Object.entries(BADGES).map(([id, b], i) => {
          const at = earned.get(id);
          const fresh = at && Date.now() - at < 24 * 3600 * 1000;
          return (
            <div
              key={id}
              className={'badge-card' + (at ? ' earned' : ' locked') + (fresh ? ' fresh' : '')}
              style={{ '--i': i }}
            >
              {fresh && <span className="fresh-tag">جديد!</span>}
              <div className="b-emoji" aria-hidden>
                {at ? b.emoji : '🔒'}
              </div>
              <div className="b-name">{b.name}</div>
              <div className="b-date">{at ? `حصلت عليه ${fmtDate(at)}` : b.hint}</div>
            </div>
          );
        })}
      </div>

      {shareMsg && (
        <p className="share-msg" role="status">
          {shareMsg}
        </p>
      )}

      <div className="step-actions" style={{ justifyContent: 'center', maxWidth: 460, margin: '18px auto 24px' }}>
        <button className="btn warm" onClick={share}>
          📸 شارك بطاقتك
        </button>
        <button
          className="btn"
          onClick={() => {
            sfx.tap();
            go('bridge');
          }}
        >
          🌉 اعبر الجسر واكسب أوسمة
        </button>
        <button className="btn ghost" onClick={() => go('garden')}>
          🌳 العودة للحديقة
        </button>
      </div>
    </div>
  );
}
