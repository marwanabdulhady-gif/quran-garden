import React, { useState } from 'react';
import {
  useGarden,
  activeChild,
  updateChild,
  setChild,
  addChild,
  gardenLink,
  parseGardenLink,
  sanitizeChild,
  dayKey,
} from './store.js';
import { RECIERS } from './data.js';
import { ChildForm, PromptBox } from './Home.jsx';
import RestoreDialog from './RestoreDialog.jsx';
import { Modal, downloadJson, readAyah } from './Shared.jsx';
import { sfx } from './sound.js';

function Toggle({ on, onChange, label, icon }) {
  return (
    <div className="toggle-row">
      <span>
        {icon} {label}
      </span>
      <button
        className={'switch ' + (on ? 'on' : '')}
        onClick={() => {
          sfx.tap();
          onChange(!on);
        }}
        aria-label={label}
      />
    </div>
  );
}

const CAP_OPTIONS = [0, 15, 30, 45, 60, 90, 120];
const TIME_OPTIONS = (() => {
  const out = [];
  for (let h = 0; h < 24; h++)
    for (const m of [0, 30]) out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  return out;
})();

// وضع الوالدين (P5-35): PIN + حدّ يومي للاستماع + ساعات سكون
function ParentPanel({ child }) {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');
  const [cap, setCap] = useState(child.parent.dailyCapMin);
  const [qf, setQf] = useState(child.parent.quietFrom || '');
  const [qu, setQu] = useState(child.parent.quietUntil || '');
  const p = child.parent;

  const digits = (v) => v.replace(/\D/g, '').slice(0, 4);
  const save = (patch) => updateChild(child.id, (c) => ({ ...c, parent: { ...c.parent, ...patch } }));

  if (!p.pin) {
    return (
      <div className="set-card">
        <h3>🛡️ وضع الوالدين</h3>
        <p className="about-line" style={{ marginBottom: 10 }}>
          اعرفا الرمز (4 أرقام) عشان يقدروا يظبطوا حدّ الاستماع اليومي وساعات السكون — وما حد تاني يقدر يعدّلهم.
        </p>
        <div className="parent-form">
          <input
            type="password"
            inputMode="numeric"
            placeholder="الرمز الجديد"
            value={pin}
            onChange={(e) => setPin(digits(e.target.value))}
          />
          <input
            type="password"
            inputMode="numeric"
            placeholder="تأكيد الرمز"
            value={pin2}
            onChange={(e) => setPin2(digits(e.target.value))}
          />
          <button
            className="btn small"
            disabled={!(pin.length === 4 && pin === pin2)}
            onClick={() => {
              sfx.ok();
              save({ pin, enabled: true });
              setPin('');
              setPin2('');
            }}
          >
            اعرف الرمز ✓
          </button>
        </div>
        {pin && pin2 && pin !== pin2 && <p className="err-mini">الرمزين مش متطابقين — حاول تاني</p>}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="set-card">
        <h3>🛡️ وضع الوالدين</h3>
        <p className="about-line" style={{ marginBottom: 10 }}>
          وضع الوالدين {p.enabled ? 'شغال' : 'متوقف'}. ادخل الرمز عشان تعدّل الإعدادات.
        </p>
        <div className="parent-form">
          <input
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(digits(e.target.value));
              setErr('');
            }}
          />
          <button
            className="btn small"
            onClick={() => {
              if (pin === p.pin) {
                sfx.ok();
                setErr('');
                setPin('');
                setOpen(true);
              } else {
                sfx.wrong();
                setErr('الرمز غلط — جرب تاني');
              }
            }}
          >
            افتح 🔓
          </button>
        </div>
        {err && <p className="err-mini">{err}</p>}
      </div>
    );
  }

  // اللوحة المفتوحة (للوالدين بس)
  const todayMin = Math.round((child.stats?.days?.[dayKey()] || 0) / 60);
  return (
    <div className="set-card parent-open">
      <h3>🛡️ وضع الوالدين</h3>
      <Toggle
        on={p.enabled}
        onChange={(v) => save({ enabled: v })}
        label={p.enabled ? 'وضع الوالدين شغال — التقييد فعّال' : 'وضع الوالدين متوقف'}
        icon="🛡️"
      />
      <div className="parent-grid">
        <label className="pg-lbl">
          ⏱️ حدّ الاستماع اليومي
          <select
            value={cap}
            onChange={(e) => {
              sfx.tap();
              setCap(Number(e.target.value));
            }}
          >
            {CAP_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m === 0 ? 'بدون حد' : m + ' دقيقة'}
              </option>
            ))}
          </select>
        </label>
        <label className="pg-lbl">
          🌙 السكون من
          <select
            value={qf}
            onChange={(e) => {
              sfx.tap();
              setQf(e.target.value);
            }}
          >
            <option value="">—</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="pg-lbl">
          ☀️ والسكون لحد
          <select
            value={qu}
            onChange={(e) => {
              sfx.tap();
              setQu(e.target.value);
            }}
          >
            <option value="">—</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="step-actions" style={{ justifyContent: 'flex-start' }}>
        <button
          className="btn small"
          onClick={() => {
            sfx.ok();
            save({ dailyCapMin: cap, quietFrom: qf || null, quietUntil: qu || null, enabled: true });
          }}
        >
          احفظ الإعدادات 💾
        </button>
        <button
          className="btn small ghost"
          onClick={() => {
            sfx.tap();
            save({ pin: null, enabled: false, dailyCapMin: 0, quietFrom: null, quietUntil: null });
            setOpen(false);
          }}
        >
          احذف الرمز
        </button>
        <button
          className="btn small ghost"
          onClick={() => {
            sfx.tap();
            setOpen(false);
          }}
        >
          اقفل 🔒
        </button>
      </div>
      <p className="about-line" style={{ marginTop: 8 }}>
        الاستماع النهارده: <b>{todayMin} دقيقة</b>
        {p.dailyCapMin > 0 ? ` من حد ${p.dailyCapMin} دقيقة` : ''}. ساعات السكون بتشتغل لما تكون «من» و«لحد» مع بعض
        مظبوطين.
      </p>
    </div>
  );
}

export default function Settings({ go }) {
  const s = useGarden();
  const child = activeChild(s);
  const [form, setForm] = useState(null); // 'add' | childId
  const [linkInput, setLinkInput] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [toast, setToast] = useState(null);

  const say = (m) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };

  const copyLink = async () => {
    const link = gardenLink();
    try {
      await navigator.clipboard.writeText(link);
      say('تم نسخ الرابط الخاص ✓');
    } catch (e) {
      setLinkInput(link);
      say('انسخ الرابط من الخانة بالأسفل');
    }
  };

  const tryRestoreLink = () => {
    const data = parseGardenLink(linkInput);
    if (!data) {
      say('الرابط غير صالح. تأكد من اكتماله');
      return;
    }
    setConfirmRestore(data);
  };

  const exportBackup = () => {
    downloadJson(`quran-garden-${child.name}-${new Date().toISOString().slice(0, 10)}.json`, {
      app: 'quran-garden',
      version: 1,
      childId: child.id,
      name: child.name,
      exportedAt: new Date().toISOString(),
      data: child,
    });
    say('نزّلت نسخة تقدم ' + child.name + ' ✓');
  };

  const importBackup = (file) => {
    const fr = new FileReader();
    fr.onload = () => {
      try {
        const obj = JSON.parse(fr.result);
        if (obj?.app !== 'quran-garden' || !obj.data) throw new Error('bad');
        const clean = sanitizeChild(obj.data);
        clean.id = child.id; // الاسترجاع لنفس الطفل الحالي
        clean.name = child.name;
        // نزوّل نسخة من التقدم الحالي أولًا
        downloadJson(`quran-garden-backup-before-restore-${Date.now()}.json`, {
          app: 'quran-garden',
          version: 1,
          childId: child.id,
          name: child.name,
          exportedAt: new Date().toISOString(),
          data: child,
        });
        updateChild(child.id, clean);
        say('تم استرجاع رحلتك بنجاح 🌟');
      } catch (e) {
        say('الملف ده مش نسخة صالحة من تقدم حديقة القرآن');
      }
    };
    fr.readAsText(file);
  };

  return (
    <div className="screen settings-screen">
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
        <div className="title">⚙️ إعدادات الرحلة</div>
        <span className="chip star-count">⭐ {child.stars}</span>
      </div>

      <div className="set-section">
        <div className="set-card">
          <h3>👨‍👩‍👧‍🦦 إدارة الأطفال · إضافة وتعديل وتبديل</h3>
          {s.children.map((c) => (
            <div className="toggle-row" key={c.id}>
              <span>
                <img
                  src={c.avatar || '/assets/hero-standing-t.png'}
                  alt=""
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#d1fae5',
                    verticalAlign: 'middle',
                    marginLeft: 8,
                  }}
                />
                {c.name}
                <span className="muted" style={{ marginRight: 8 }}>
                  ⭐ {c.stars}
                </span>
              </span>
              <span style={{ display: 'flex', gap: 6 }}>
                {c.id !== child.id && (
                  <button
                    className="mini-btn"
                    onClick={() => {
                      setChild(c.id);
                      sfx.tap();
                    }}
                  >
                    تبديل
                  </button>
                )}
                <button className="mini-btn" onClick={() => setForm(c.id)}>
                  تعديل
                </button>
              </span>
            </div>
          ))}
          <div className="step-actions">
            <button className="btn small ghost" onClick={() => setForm('add')}>
              ＋ إضافة طفل جديد
            </button>
          </div>
        </div>

        <div className="set-card">
          <h3>🧒 الشخصية</h3>
          <div className="char-opts">
            <div
              className={'char-opt' + (!child.avatar ? ' on' : '')}
              onClick={() => {
                updateChild(child.id, { avatar: null, avatarReading: null });
                sfx.tap();
              }}
            >
              <img src="/assets/hero-standing-t.png" alt="الشخصية الافتراضية" />
              <div>الشخصية الكرتونية الافتراضية</div>
            </div>
            <div className={'char-opt' + (child.avatar ? ' on' : '')} onClick={() => setForm(child.id)}>
              <div style={{ height: 74, display: 'grid', placeItems: 'center', fontSize: 34 }}>
                {child.avatar ? <img src={child.avatar} alt="" style={{ height: 74, objectFit: 'contain' }} /> : '📷'}
              </div>
              <div>صورة طفلك</div>
            </div>
          </div>
          <p className="about-line mt-10">الصور بتتحفظ داخل المتصفح ده فقط، ومش بتترفع لسيرفر الموقع أو تظهر للزوار.</p>
        </div>

        <div className="set-card">
          <h3>🎙️ القارئ</h3>
          <div className="field">
            <select value={child.reciter} onChange={(e) => updateChild(child.id, { reciter: e.target.value })}>
              {RECIERS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="set-card">
          <h3>📖 حجم ووضوح الآيات</h3>
          <p className="about-line" style={{ marginBottom: 10 }}>
            اختار حجم نص الآية اللي يناسب عيني الطفل. «خط واضح» بيكتب الآية بدون تشكيل للقراءة الأولى.
          </p>
          <div className="chip-group light" style={{ marginBottom: 10 }}>
            <span className="chip-lbl">الحجم</span>
            {[
              ['s', 'صغير'],
              ['m', 'متوسط'],
              ['l', 'كبير'],
            ].map(([v, lbl]) => (
              <button
                key={v}
                className={'chip-btn' + ((child.reading?.size || 'm') === v ? ' on' : '')}
                onClick={() => {
                  sfx.tap();
                  updateChild(child.id, (c) => ({ ...c, reading: { size: v, plain: c.reading?.plain ?? false } }));
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
          <Toggle
            on={child.reading?.plain === true}
            icon="🕶️"
            label="خط واضح (بدون تشكيل)"
            onChange={(v) =>
              updateChild(child.id, (c) => ({ ...c, reading: { size: c.reading?.size || 'm', plain: v } }))
            }
          />
          <div className={`quran reading-preview sz-${child.reading?.size || 'm'}`}>
            {readAyah('وَجَعَلْنَا نَوْمَكُمْ سُبَاتًا', child)}
          </div>
        </div>

        <div className="set-card">
          <h3>🔊 الأصوات</h3>
          <Toggle
            on={child.sound}
            icon="🔊"
            label="الصوت الخفيف (أصوات الواجهة)"
            onChange={(v) => updateChild(child.id, { sound: v })}
          />
          <Toggle
            on={child.bridgeSfx}
            icon="🌉"
            label="مؤثرات الجسر"
            onChange={(v) => updateChild(child.id, { bridgeSfx: v })}
          />
        </div>

        <div className="set-card">
          <h3>💾 الحفظ والنسخ الاحتياطي</h3>
          <p className="about-line" style={{ marginBottom: 10 }}>
            التقدّم بيتحفظ تلقائيًا في المتصفح ده. نزّل نسخة تحتفظ بيها أو تنقلها لجهاز تاني. النسخة تخص الطفل الحالي
            فقط.
          </p>
          <div className="step-actions" style={{ justifyContent: 'flex-start' }}>
            <button className="btn small" onClick={exportBackup}>
              ⬇️ تنزيل نسخة احتياطية
            </button>
            <label className="btn small ghost" style={{ cursor: 'pointer' }}>
              ⬆️ استرجاع نسخة
              <input
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && importBackup(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        <div className="set-card">
          <h3>🔑 مفتاح حديقة أسرتك</h3>
          <p className="about-line" style={{ marginBottom: 10 }}>
            هذا الرابط يحمل بيانات أطفالك وتقدمهم. احتفظ به لنفسك، ولو فتحته على جهاز تاني بتفتح حديقتك هناك.
            <br />
            <b>ملاحظة:</b> الرابط يحمل التقدم فقط — الصور تبقى على كل جهاز.
          </p>
          <div className="step-actions" style={{ justifyContent: 'flex-start' }}>
            <button className="btn small warm" onClick={copyLink}>
              📋 انسخ الرابط الخاص
            </button>
          </div>
          <div className="link-box mt-10">
            <input
              placeholder="ألصق رابط الحديقة هنا لاسترجاعها…"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <button className="btn small" onClick={tryRestoreLink}>
              استرجاع
            </button>
          </div>
        </div>

        <ParentPanel child={child} />

        <div className="set-card">
          <h3>ℹ️ كيف نظبط رحلتنا؟</h3>
          <p className="about-line">
            🌉 <b>جسر المعاني</b>: ٣٠ كلمة من جزء عمّ في ٦ رحلات (جولتين). اسمع الآية، اكتشف المعنى، واعبر الجسر.
            <br />
            🎧 <b>بوابات جزء عمّ وتبارك وقد سمع</b>: استمع للسور كاملة بالترتيب مع التكرار والمراجعة.
            <br />
            📖 <b>كلماتي</b>: كل الكلمات ومعانيها ومصادر التفسير.
            <br />
            🤍 <b>آية اليوم</b>: آية من جزء عمّ تتغير كل يوم مع تأمل قصير.
            <br />
            🎁 <b>الهدايا</b>: أكمل رحلة أو سورة وافتح هدية تزيّن حديقتك.
            <br />
            🛡️ <b>وضع الوالدين</b>: بريم (4 أرقام) يقفل عليه حدّ الاستماع اليومي وساعات السكون — من «الإعدادات».
          </p>
          <p className="about-line" style={{ marginTop: 8 }}>
            التلاوات والنصوص من واجهة api.alquran.cloud. المعاني مبسّطة بالاعتماد على فهم التفسير الميسّر.
          </p>
        </div>

        <div className="center" style={{ paddingBottom: 20 }}>
          <button className="btn ghost" onClick={() => go('home')}>
            🏠 اختيار طفل آخر وإدارة الأطفال
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
            say('تم حفظ التغييرات 🌟');
          }}
        />
      )}

      {confirmRestore && (
        <RestoreDialog
          family={confirmRestore}
          onClose={() => setConfirmRestore(null)}
          onApplied={(m) => {
            say(m);
            setLinkInput('');
          }}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
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
