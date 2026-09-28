import React, { useEffect, useRef, useState } from 'react';
import { useGarden, activeChild, setChild, addChild, removeChild, updateChild, progressSummary } from './store.js';
import { Modal, starLabel, Logo } from './Shared.jsx';
import { sfx } from './sound.js';

function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { icon: '☀️', text: 'صباح الخير', night: false };
  if (h >= 12 && h < 17) return { icon: '☀️', text: 'طاب يومك', night: false };
  if (h >= 17 && h < 22) return { icon: '🌇', text: 'مساء الخير', night: false };
  return { icon: '🌙', text: 'مساء هادئ', night: true };
}

// تصغير الصورة مع الحفاظ على الشفافية
function fileToDataUrl(file, max = 420) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('read'));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/png'));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

const PROMPT_STAND = `حوّل صورة طفلي المرفقة إلى شخصية أطفال كرتونية ثلاثية الأبعاد شبه واقعية، بأسلوب فيلم رسوم متحركة عائلي فاخر: رأس أكبر قليلًا بنسب طفولية لطيفة، وجه مستدير وملامح ناعمة، عينان كبيرتان معبرّتان، ابتسامة دافئة، وشعر مجسّم مرتب. حافظ بدقة على هوية الطفل وملامحه ولون بشرته وشكل شعره وملابسه المحتشمة، واقفًا بوضع مرح وهادئ، يظهر جسمه كاملًا من الرأس إلى القدمين، في منتصف الصورة مع مساحة حوله، وبخلفية شفافة PNG حقيقية.`;

const PROMPT_READ = `استخدم نفس شخصية طفلي الكرتونية، واجعله جالسًا باحترام وهدوء يقرأ القرآن من مصحف مفتوح أنيق، مع تعبير مطمئن وسعيد، وظهور الشخصية كاملة والمصحف بوضوح في المنتصف، دون كتابة يمكن قراءتها داخل صفحات المصحف، وبخلفية شفافة PNG حقيقية.`;

export function PromptBox() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);
  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };
  return (
    <div className="mt-10">
      <button type="button" className="mini-btn" onClick={() => setOpen(!open)}>
        {open ? '▲' : '▼'} أعمل الصورتين في برنامج الذكاء الاصطناعي ✨
      </button>
      {open && (
        <div style={{ background: '#f8fafc', borderRadius: 16, padding: 12, marginTop: 8 }}>
          <p className="hint">
            هذه الصور تبقى في متصفحك فقط ولا تُرفع لأي خادم. لو حابب شخصية كرتونية لطفلك، انسخ الطلب وارفع صورة طفلك في
            أي أداة صور بالذكاء الاصطناعي، ثم نزّل النتيجة كملف PNG بخلفية شفافة وارفعها هنا.
          </p>
          <div className="field" style={{ marginBottom: 8 }}>
            <label>١ · طلب صورة الرحلة (واقف بكامل الجسم)</label>
            <textarea
              rows={5}
              readOnly
              value={PROMPT_STAND}
              style={{
                width: '100%',
                borderRadius: 12,
                border: '2px solid #d1fae5',
                padding: 10,
                fontSize: 12,
                background: '#fff',
              }}
            />
            <button type="button" className="btn small ghost" onClick={() => copy(PROMPT_STAND, 1)}>
              {copied === 1 ? 'تم نسخ الطلب ✓' : 'نسخ الطلب'}
            </button>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>٢ · طلب صورة القراءة (جالس بالمصحف)</label>
            <textarea
              rows={4}
              readOnly
              value={PROMPT_READ}
              style={{
                width: '100%',
                borderRadius: 12,
                border: '2px solid #d1fae5',
                padding: 10,
                fontSize: 12,
                background: '#fff',
              }}
            />
            <button type="button" className="btn small ghost" onClick={() => copy(PROMPT_READ, 2)}>
              {copied === 2 ? 'تم نسخ الطلب ✓' : 'نسخ الطلب'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChildForm({ title, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [standing, setStanding] = useState(initial?.avatar || null);
  const [reading, setReading] = useState(initial?.avatarReading || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const pick = async (file, setter) => {
    setErr(null);
    if (!file) return;
    setBusy(true);
    try {
      const url = await fileToDataUrl(file);
      setter(url);
    } catch (e) {
      setErr('تعذّر فتح الصورة. جرّب ملف تاني.');
    } finally {
      setBusy(false);
    }
  };

  const slot = (label, val, setter, ph) => (
    <div
      className="photo-slot"
      onClick={() => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/png,image/jpeg,image/webp';
        inp.onchange = () => pick(inp.files[0], setter);
        inp.click();
      }}
    >
      <div className="preview">{val ? <img src={val} alt="" /> : <span style={{ fontSize: 40 }}>{ph}</span>}</div>
      <div className="label">{busy ? 'جارٍ التجهيز…' : label}</div>
      {val && (
        <button
          className="clear"
          onClick={(e) => {
            e.stopPropagation();
            setter(null);
          }}
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <Modal title={title} onClose={onClose}>
      <div className="field">
        <label>اسم البطل أو البطلة</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسم طفلك هنا..."
          maxLength={20}
        />
      </div>
      <div className="photo-slots">
        {slot('صورة الواجهة والخريطة', standing, setStanding, '🧒')}
        {slot('صورة قراءة القرآن', reading, setReading, '📖')}
      </div>
      {err && <div className="err-box mt-10">{err}</div>}
      {(standing?.length || 0) + (reading?.length || 0) > 800000 && (
        <div className="err-box mt-10" style={{ background: '#fffbeb', borderColor: '#fde68a', color: '#92400e' }}>
          ⚠️ الصور كبيرة — قد تملأ مساحة التخزين مع وقت. جرّب صورًا أصغر.
        </div>
      )}
      <p className="hint mt-10">
        الصور بتتحفظ داخل المتصفح ده فقط، ومش بتترفع لسيرفر الموقع. لو الشخصية بدون خلفية شفافة، هتظهر بخلفيتها.
      </p>
      <PromptBox />
      <div className="step-actions">
        <button
          className="btn"
          disabled={!name.trim() || busy}
          onClick={() => {
            sfx.ok();
            onSave({ name: name.trim(), avatar: standing, avatarReading: reading });
          }}
        >
          حفظ شخصية طفلي
        </button>
        <button className="btn ghost" onClick={onClose}>
          إلغاء
        </button>
      </div>
    </Modal>
  );
}

export default function Home({ go }) {
  const s = useGarden();
  const g = greeting();
  const [form, setForm] = useState(null); // 'add' | childId
  const [delId, setDelId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const lastUpd = useRef(s.updatedAt);

  useEffect(() => {
    if (s.updatedAt !== lastUpd.current) {
      lastUpd.current = s.updatedAt;
      setSaving(true);
      const t = setTimeout(() => setSaving(false), 900);
      return () => clearTimeout(t);
    }
  }, [s.updatedAt]);

  const toastMsg = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const resync = () => {
    sfx.tap();
    toastMsg('بياناتك محدّثة على هذا الجهاز ✓');
  };

  const toggleSound = () => {
    const c = activeChild(s);
    updateChild(c.id, { sound: !c.sound });
  };

  const soundOn = activeChild(s).sound;

  return (
    <div className={'home' + (g.night ? ' night' : '')}>
      <div className="home-deco" aria-hidden="true">
        <span className="hd hd1">🍃</span>
        <span className="hd hd2">🌸</span>
        <span className="hd hd3">✨</span>
        <span className="hd hd4">🦋</span>
      </div>
      <div className="home-head">
        <span className="chip">
          {g.icon} {g.text}
        </span>
        <div style={{ height: 10 }} />
        <Logo />
        <div className="home-hello">أهلاً بكم — مَن بطل رحلتنا اليوم؟</div>
        <div className="home-sub">لكل طفل حديقته، ونجومه، ورحلته الخاصة.</div>
      </div>

      <div className="children-grid">
        {s.children.map((c) => (
          <div className="child-card" key={c.id}>
            <div className="child-avatar ring-wrap" title="النجوم نحو العشرية الجاية">
              <svg className="level-ring" viewBox="0 0 100 100" aria-hidden="true">
                <circle className="ring-bg" cx="50" cy="50" r="45" />
                <circle
                  className="ring-fg"
                  cx="50"
                  cy="50"
                  r="45"
                  strokeDasharray={`${(c.stars === 0 ? 0 : (((c.stars - 1) % 10) + 1) / 10) * 282.7} 282.7`}
                />
              </svg>
              <img src={c.avatar || '/assets/hero-standing-t.png'} alt={c.name} />
            </div>
            <div className="child-name">{c.name}</div>
            <button
              className="child-stars"
              onClick={() => {
                sfx.tap();
                go('badges', { childId: c.id });
              }}
              aria-label={`أوسمة ${c.name}`}
            >
              ⭐ {c.stars} {starLabel(c.stars)} · 🏅 {c.badges?.length || 0}
            </button>
            <div className="child-status">{progressSummary(c)}</div>
            <div className="child-actions">
              <button
                className="mini-btn"
                onClick={() => {
                  sfx.tap();
                  setForm(c.id);
                }}
              >
                ✏️ تغيير الاسم
              </button>
              <button
                className="mini-btn"
                onClick={() => {
                  sfx.tap();
                  setForm(c.id);
                }}
              >
                🖼 صورة الطفل
              </button>
              <button
                className="mini-btn red"
                onClick={() => {
                  sfx.tap();
                  setDelId(c.id);
                }}
              >
                🗑 حذف
              </button>
            </div>
            <button
              className="btn big"
              style={{ width: '100%' }}
              onClick={() => {
                sfx.ok();
                setChild(c.id);
                go('garden');
              }}
            >
              انطلق للحديقة يا {c.name} 🌿
            </button>
          </div>
        ))}
        <button
          className="add-child"
          onClick={() => {
            sfx.tap();
            setForm('add');
          }}
        >
          <span>
            <span className="plus">＋</span>
            إضافة طفل جديد
            <br />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#047857' }}>باسمه وصورته ورحلة مستقلة</span>
          </span>
        </button>
      </div>

      <div className="home-footer">
        <div className={'sync-pill' + (saving ? ' saving' : '')}>
          {saving ? '☁️ جارٍ حفظ التقدم…' : '📱 محفوظ على الجهاز'}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sound-toggle" onClick={resync}>
            🔄 إعادة المزامنة
          </button>
          <button className={'sound-toggle' + (soundOn ? '' : ' off')} onClick={toggleSound}>
            {soundOn ? '🔊 الصوت الخفيف' : '🔇 الصوت مكتوم'}
          </button>
        </div>
      </div>

      {form && (
        <ChildForm
          title={form === 'add' ? 'إضافة طفل جديد' : 'تعديل اسم وصور طفلي'}
          initial={form === 'add' ? null : s.children.find((c) => c.id === form)}
          onClose={() => setForm(null)}
          onSave={(data) => {
            if (form === 'add') addChild(data.name, data);
            else updateChild(form, data);
            setForm(null);
            toastMsg(form === 'add' ? 'اتحفظت شخصية طفلك على المتصفح ده 🌟' : 'تم حفظ التغييرات 🌟');
          }}
        />
      )}

      {delId && (
        <Modal title="حذف الطفل" onClose={() => setDelId(null)}>
          <p className="center" style={{ fontWeight: 700, lineHeight: 2 }}>
            متأكد إنك عايز تحذف <b>{s.children.find((c) => c.id === delId)?.name}</b>؟
            <br />
            هيتحذف تقدمه ونجومه من هذا المتصفح.
          </p>
          <div className="step-actions">
            <button
              className="btn danger"
              onClick={() => {
                removeChild(delId);
                setDelId(null);
              }}
            >
              نعم، احذف
            </button>
            <button className="btn ghost" onClick={() => setDelId(null)}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 84,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#065f46',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            padding: '10px 20px',
            borderRadius: 999,
            zIndex: 80,
            animation: 'pop 0.25s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
