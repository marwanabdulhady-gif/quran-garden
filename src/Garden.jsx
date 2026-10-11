import React, { useEffect, useRef, useState } from 'react';
import { useGarden, activeChild, updateChild, awardStars, today, touchDaily, streakOf } from './store.js';
import { DECOR } from './data.js';
import { Modal, Confetti, tap } from './Shared.jsx';
import { sfx } from './sound.js';

// الشمس/القمر في ركن الحديقة حسب الوقت
function gardenPhase() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'day';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}
function skyIcon(phase) {
  return { morning: '☀️', day: '🌤️', evening: '🌇', night: '🌙' }[phase] || '☀️';
}

// مشي البطل أول مرة يدخل الحديقة في الجلسة
let heroWalked = false;

// مواقع ثابتة لنجوم الليل (حتى تتطابق كل مرة)
const STARS = [
  { x: 8, y: 8, s: 14, d: 0 },
  { x: 22, y: 14, s: 10, d: 1.2 },
  { x: 37, y: 6, s: 12, d: 0.6 },
  { x: 52, y: 12, s: 9, d: 1.8 },
  { x: 66, y: 7, s: 13, d: 0.3 },
  { x: 80, y: 13, s: 10, d: 2.2 },
  { x: 91, y: 5, s: 12, d: 1.5 },
  { x: 14, y: 24, s: 8, d: 2.6 },
  { x: 74, y: 22, s: 9, d: 0.9 },
];

const SPOTS = {
  slide: { x: 17, y: 38, label: 'زحليقة قوس قزح' },
  swing: { x: 77, y: 44, label: 'مرجيحة الشجرة' },
  bench: { x: 87.5, y: 61, label: 'مقعد الاستراحة' },
  roses: { x: 63, y: 71, label: 'حوض الورد السحري' },
  roses2: { x: 13, y: 79, label: 'حوض الورد السحري' },
};

export default function Garden({ go }) {
  const s = useGarden();
  const child = activeChild(s);
  const [walking, setWalking] = useState(!heroWalked);
  const [bubble, setBubble] = useState(null);
  const [swinging, setSwinging] = useState(false);
  const [wet, setWet] = useState(false);
  const [droplets, setDroplets] = useState([]);
  const [giftOpen, setGiftOpen] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const phase = gardenPhase();

  /* بارالاكس خفيف مع حركة المؤشر (معطّل مع reduced motion) */
  const bgRef = useRef(null);
  const layerRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);
  const onMove = (e) => {
    if (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    target.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    };
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        const { x, y } = target.current;
        if (bgRef.current) bgRef.current.style.transform = `translate(${x * -12}px, ${y * -8}px) scale(1.03)`;
        if (layerRef.current) layerRef.current.style.transform = `translate(${x * 5}px, ${y * 4}px)`;
      });
    }
  };
  useEffect(() => () => cancelAnimationFrame(rafId.current), []);

  useEffect(() => {
    if (!walking) return;
    heroWalked = true;
    const t = setTimeout(() => setWalking(false), 1600);
    return () => clearTimeout(t);
  }, [walking]);

  const say = (text, x, y) => {
    setBubble({ text, x, y });
    setTimeout(() => setBubble(null), 2300);
  };

  const water = () => {
    sfx.water();
    setWet(true);
    setTimeout(() => setWet(false), 1400);
    const d = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      left: 8 + Math.random() * 60,
      delay: Math.random() * 0.25,
    }));
    setDroplets(d);
    setTimeout(() => setDroplets([]), 1300);
    const t = today();
    const first = child.daily.lastWater !== t;
    updateChild(child.id, (c) => ({
      ...c,
      daily: {
        ...touchDaily(c.daily), // سقي الورد نشاط يومي يدخل في سلسلة 🔥
        lastWater: t,
        waterStreak:
          c.daily.lastWater === new Date(Date.now() - 864e5).toISOString().slice(0, 10) ? c.daily.waterStreak + 1 : 1,
      },
    }));
    if (first) {
      awardStars(child.id, 1);
      say('سقوت الحديقة! +1 ⭐', SPOTS.roses.x, SPOTS.roses.y);
    } else {
      say('الحديقة مستوية اليوم 🌿', SPOTS.roses.x, SPOTS.roses.y);
    }
  };

  const openGift = () => {
    sfx.gift();
    setConfetti(true);
    setTimeout(() => setConfetti(false), 4200);
    setGiftOpen(true);
  };

  const claimGift = () => {
    const remaining = DECOR.filter((d) => !child.gifts.decor.includes(d.id));
    const pick = remaining.length ? remaining[Math.floor(Math.random() * remaining.length)] : null;
    updateChild(child.id, (c) => ({
      ...c,
      gifts: {
        pending: c.gifts.pending - 1,
        decor: pick ? [...c.gifts.decor, pick.id] : c.gifts.decor,
      },
      stars: c.stars + (pick ? 2 : 3),
    }));
    setGiftOpen(false);
    if (pick) {
      say(`${pick.emoji} ${pick.name} انضم لحديقتك!`, pick.x, pick.y);
    }
  };

  const unlocked = DECOR.filter((d) => child.gifts.decor.includes(d.id));

  return (
    <div className={'garden ph-' + phase} onMouseMove={onMove}>
      <div className="garden-bg" ref={bgRef} />
      <div className={'garden-tint'} aria-hidden="true" />
      <div className="garden-layer" ref={layerRef}>
        {/* تلميح لحد ما الزينة تبدأ تتجمع */}
        {unlocked.length === 0 && child.gifts.pending === 0 && (
          <div className="decor-hint">🎁 كل رحلة بتكتمل بتيجيك هدية — وبيتنضم لواحدة من زينة حديقتك</div>
        )}

        {/* الزينة */}
        {unlocked.map((d) => (
          <div
            key={d.id}
            className="decor"
            style={{ left: d.x + '%', top: d.y + '%', pointerEvents: 'auto', cursor: 'pointer' }}
            onClick={() => {
              sfx.tap();
              say(`${d.emoji} ${d.name} · ${d.desc}`, d.x, d.y);
            }}
          >
            {d.img ? <img src={d.img} alt={d.name} /> : d.emoji}
          </div>
        ))}

        {/* الزحليقة */}
        <div className="spot" style={{ left: SPOTS.slide.x + '%', top: SPOTS.slide.y + '%' }}>
          <span
            className="emoji"
            onClick={() => {
              sfx.slide();
              say('وووش! 🌈', SPOTS.slide.x, SPOTS.slide.y - 8);
            }}
          >
            🛝
          </span>
        </div>

        {/* المرجيحة */}
        <div className="spot" style={{ left: SPOTS.swing.x + '%', top: SPOTS.swing.y + '%' }}>
          <span
            className={'emoji' + (swinging ? ' swinging' : '')}
            onClick={() => {
              sfx.swing();
              setSwinging(true);
              setTimeout(() => setSwinging(false), 1700);
              say('حلو! مرجيحة على مهل 🌿', SPOTS.swing.x, SPOTS.swing.y - 10);
            }}
          >
            🛝
          </span>
        </div>

        {/* المقعد */}
        <div className="spot" style={{ left: SPOTS.bench.x + '%', top: SPOTS.bench.y + '%' }}>
          <span
            className="emoji"
            onClick={() => {
              sfx.tap();
              say('استرح شوية بعد الحفظ 🌿', SPOTS.bench.x, SPOTS.bench.y - 10);
            }}
          >
            🪑
          </span>
        </div>

        {/* حوض الورد */}
        <div className="spot" style={{ left: SPOTS.roses.x + '%', top: SPOTS.roses.y + '%' }}>
          <div className={'roses' + (wet ? ' wet' : '')} onClick={water} style={{ position: 'relative' }}>
            {['🌷', '🌹', '🌸', '🌷', '🌹'].map((r, i) => (
              <span key={i}>{r}</span>
            ))}
            <div className="droplets">
              {droplets.map((d) => (
                <span key={d.id} className="droplet" style={{ right: d.left + '%', animationDelay: d.delay + 's' }}>
                  💧
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="spot" style={{ left: SPOTS.roses2.x + '%', top: SPOTS.roses2.y + '%' }}>
          <div className={'roses' + (wet ? ' wet' : '')} onClick={water}>
            {['🌹', '🌷', '🌸'].map((r, i) => (
              <span key={i}>{r}</span>
            ))}
          </div>
        </div>

        {/* الهدية */}
        {child.gifts.pending > 0 && (
          <div className="gift" style={{ left: '47%', top: '64%' }} onClick={openGift}>
            <img src="/assets/gift-t.png" alt="هدية" />
            <span className="badge-bubble">{child.gifts.pending}</span>
          </div>
        )}

        {/* الفراشات البيئة */}
        <div className="butterfly b1" aria-hidden="true">
          🦋
        </div>
        <div className="butterfly b2" aria-hidden="true">
          🦋
        </div>

        {/* البطل (يمشي للداخل أول مرة) */}
        <div className={'hero' + (walking ? ' walking' : '')} style={{ left: '47%', top: '84%' }}>
          <img
            src={confetti ? '/assets/hero-celebrate-t.png' : child.avatar || '/assets/hero-standing-t.png'}
            alt={child.name}
          />
        </div>
      </div>

      {/* الشمس/القمر حسب الوقت */}
      <div className="garden-sky" aria-hidden="true">
        {skyIcon(phase)}
        {phase !== 'night' && (
          <div className="garden-clouds" aria-hidden="true">
            <span className="cloud c1" />
            <span className="cloud c2" />
            <span className="cloud c3" />
          </div>
        )}
      </div>

      {/* نجوم متساقطة (ليل) */}
      {phase === 'night' && (
        <div className="garden-shoots" aria-hidden="true">
          <span className="shoot s1" />
          <span className="shoot s2" />
        </div>
      )}

      {/* نجوم الليل */}
      {phase === 'night' && (
        <div className="garden-stars" aria-hidden="true">
          {STARS.map((st, i) => (
            <span
              key={i}
              style={{ left: st.x + '%', top: st.y + '%', fontSize: st.s + 'px', animationDelay: st.d + 's' }}
            >
              ✦
            </span>
          ))}
        </div>
      )}

      {/* الشريط العلوي */}
      <div className="garden-top">
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('home');
          }}
          aria-label="العودة"
        >
          🏠
        </button>
        <div className="who">
          <img src={child.avatar || '/assets/hero-standing-t.png'} alt={child.name} />
          <span>
            أهلًا {child.name}
            <div className="stars star-count">
              ⭐ {child.stars}
              {streakOf(child) >= 2 ? ` · 🔥 ${streakOf(child)}` : ''}
            </div>
          </span>
        </div>
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('badges');
          }}
          aria-label="أوسمتي"
        >
          🏅
        </button>
        <button
          className="icon-btn"
          onClick={() => {
            sfx.tap();
            go('settings');
          }}
          aria-label="إعدادات"
        >
          ⚙️
        </button>
      </div>

      {/* التنقل */}
      <div className="garden-nav">
        <button
          className="nav-pill"
          onClick={() => {
            sfx.tap();
            go('bridge');
          }}
        >
          <span className="ico">🌉</span>
          جسر المعاني
          <span className="sub">الرحلات</span>
        </button>
        <button
          className="nav-pill"
          onClick={() => {
            sfx.tap();
            go('words');
          }}
        >
          <span className="ico">📖</span>
          كلماتي
          <span className="sub">٥٠ كلمة</span>
        </button>
        <button
          className="nav-pill"
          onClick={() => {
            sfx.tap();
            go('journey');
          }}
        >
          <span className="ico">🗺️</span>
          خريطة الرحلة
          <span className="sub">حفظ القرآن</span>
        </button>
        <button
          className="nav-pill"
          onClick={() => {
            sfx.tap();
            go('daily');
          }}
        >
          <span className="ico">🤍</span>
          آية اليوم
          <span className="sub">كل يوم</span>
        </button>
      </div>

      {/* فقاعة الكلام */}
      {bubble && (
        <div
          className="spot-bubble"
          style={{ position: 'fixed', left: bubble.x + '%', top: bubble.y + '%', transform: 'translate(-50%, -100%)' }}
        >
          {bubble.text}
        </div>
      )}

      <Confetti show={confetti} />

      {giftOpen && (
        <Modal title="هدية رائعة! 🎁" onClose={() => setGiftOpen(false)}>
          <div className="center" style={{ padding: '10px 0' }}>
            <img className="gift-hero" src="/assets/hero-gift-t.png" alt={child.name} />
            <p style={{ fontWeight: 800, fontSize: 15, lineHeight: 2, marginTop: 8 }}>
              فتحت الهدية! اتضافت الزينة لحديقتك وهتفضل موجودة دايمًا 🌿
            </p>
          </div>
          <div className="step-actions">
            <button className="btn" onClick={claimGift}>
              أحسنت! استلم الهدية
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
