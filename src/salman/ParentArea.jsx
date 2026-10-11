// شاشة ولي الأمر لحديقة سلمان: قفل بـ PIN، وحدّ الزيارات، وساعات الهدوء، وتقرير الحدائق.
// منفصلة عن الطفل: لا تُفتح إلا برمز، وتُقفل تلقائيًا عند الخروج من الشاشة.
import React, { useState } from 'react';
import { GARDENS } from './data/gardens.js';
import { CATALOG, toArabicNumeral } from './lib/catalog.js';
import {
  MAX_VISITS_MAX,
  MAX_VISITS_MIN,
  STATUS_LABEL,
  gardenReport,
  hasPin,
  makePinRecord,
  verifyPin,
  visitsToday,
} from './lib/parent.js';
import { dayKeyFrom } from './lib/gamify.js';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
const VISIT_LABEL = { 1: 'زيارة واحدة', 2: 'زيارتان', 3: 'ثلاث زيارات' };
const HOURS = Array.from({ length: 24 }, (_, h) => h);

function PinPad({ value, onChange, label }) {
  const press = (k) => {
    if (k === '⌫') return onChange(value.slice(0, -1));
    if (value.length < 4) onChange(value + k);
  };
  return (
    <div className="sg-pin">
      <p className="sg-sub" role="status">
        {label}
      </p>
      <div className="sg-pin-dots" aria-label={`أدخلت ${toArabicNumeral(value.length)} من ٤ أرقام`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < value.length ? 'sg-dot is-on' : 'sg-dot'} />
        ))}
      </div>
      <div className="sg-pin-pad">
        {KEYS.map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              className="sg-pin-key"
              onClick={() => press(k)}
              aria-label={k === '⌫' ? 'مسح' : toArabicNumeral(Number(k))}
            >
              {k === '⌫' ? '⌫' : toArabicNumeral(Number(k))}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function ParentArea({ state, setState, onBack }) {
  const [mode, setMode] = useState(hasPin(state.parent) ? 'locked' : 'setup');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState(null);
  const [error, setError] = useState('');

  const parent = state.parent;
  const update = (patch) => setState((s) => ({ ...s, parent: { ...s.parent, ...patch } }));

  const startChangePin = () => {
    setPin('');
    setFirstPin(null);
    setError('');
    setMode('setup');
  };

  const onPin = (next) => {
    setPin(next);
    setError('');
    if (next.length < 4) return;

    if (mode === 'locked') {
      setPin('');
      if (verifyPin(parent, next)) setMode('open');
      else setError('الرمز غير صحيح. جرّب مرة أخرى.');
      return;
    }

    // ضبط رمز جديد: إدخال، ثم تأكيد
    if (firstPin === null) {
      setFirstPin(next);
      setPin('');
      return;
    }
    if (next === firstPin) {
      setState((s) => ({ ...s, parent: { ...s.parent, ...makePinRecord(next) } }));
      setFirstPin(null);
      setPin('');
      setMode('open');
    } else {
      setFirstPin(null);
      setPin('');
      setError('الرمزان غير متطابقين. ابدأ من جديد.');
    }
  };

  if (mode === 'locked' || mode === 'setup') {
    const setupLabel = firstPin === null ? 'أدخل رمزًا جديدًا من 4 أرقام' : 'أعد إدخال الرمز للتأكيد';
    return (
      <main className="sg-app" dir="rtl">
        <h1 className="sg-title">🔒 ولي الأمر</h1>
        <PinPad value={pin} onChange={onPin} label={mode === 'locked' ? 'أدخل رمز ولي الأمر' : setupLabel} />
        {error && (
          <p className="sg-gate" role="alert">
            {error}
          </p>
        )}
        {mode === 'setup' && hasPin(parent) && (
          <button type="button" className="sg-btn sg-btn-soft" onClick={() => setMode('open')}>
            إلغاء
          </button>
        )}
        {mode === 'locked' && (
          <button type="button" className="sg-btn sg-btn-soft" onClick={onBack}>
            ⬅ رجوع للغابة
          </button>
        )}
        {mode === 'setup' && !hasPin(parent) && (
          <p className="sg-sub">بعد ضبط الرمز ستظهر إعدادات الزيارات والتقرير.</p>
        )}
      </main>
    );
  }

  const report = gardenReport(state, CATALOG);
  const todayCount = visitsToday(state, dayKeyFrom());

  return (
    <main className="sg-app" dir="rtl">
      <h1 className="sg-title">🔓 ولي الأمر</h1>

      <section className="sg-level">
        <h2 className="sg-level-title">حدود الوقت</h2>
        <p className="sg-sub">
          {parent.limits
            ? 'مفعّلة: عدد زيارات اليوم وساعات الهدوء أدناه.'
            : 'الغابة مفتوحة دائمًا: سلمان ينتقل من نشاط إلى التالي متى شاء.'}
        </p>
        <button
          type="button"
          className={parent.limits ? 'sg-chip is-on' : 'sg-chip'}
          aria-pressed={parent.limits}
          onClick={() => update({ limits: !parent.limits })}
        >
          {parent.limits ? '✓ الحدود مفعّلة' : 'تفعيل حدود الوقت'}
        </button>
      </section>

      {parent.limits && (
        <>
          <section className="sg-level">
            <h2 className="sg-level-title">الزيارات اليومية</h2>
            <p className="sg-sub">
              اليوم: {toArabicNumeral(todayCount)} من {toArabicNumeral(parent.maxVisits)}
            </p>
            <div className="sg-parent-row" role="group" aria-label="عدد الزيارات في اليوم">
              {[MAX_VISITS_MIN, 2, MAX_VISITS_MAX].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={parent.maxVisits === n ? 'sg-chip is-on' : 'sg-chip'}
                  aria-pressed={parent.maxVisits === n}
                  onClick={() => update({ maxVisits: n })}
                >
                  {VISIT_LABEL[n]}
                </button>
              ))}
            </div>
          </section>

          <section className="sg-level">
            <h2 className="sg-level-title">ساعات الهدوء</h2>
            <p className="sg-sub">لا تبدأ زيارة جديدة داخل هذه الساعات (توقيت الرياض).</p>
            <div className="sg-parent-row">
              <label className="sg-field">
                من
                <select value={parent.quietFrom} onChange={(e) => update({ quietFrom: Number(e.target.value) })}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {toArabicNumeral(h)}:٠٠
                    </option>
                  ))}
                </select>
              </label>
              <label className="sg-field">
                إلى
                <select value={parent.quietTo} onChange={(e) => update({ quietTo: Number(e.target.value) })}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {toArabicNumeral(h)}:٠٠
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        </>
      )}

      <section className="sg-level">
        <h2 className="sg-level-title">تقرير الحدائق</h2>
        {report.map((r) => (
          <div key={r.garden} className={`sg-report-row is-${r.status}`}>
            <strong>
              {GARDENS[r.garden].emoji} {GARDENS[r.garden].name}
            </strong>
            <span className="sg-report-status">{STATUS_LABEL[r.status]}</span>
            <span className="sg-sub">
              ⭐ {toArabicNumeral(r.stars)} · متقن {toArabicNumeral(r.mastered)} · يتعلّم {toArabicNumeral(r.learning)}{' '}
              · من {toArabicNumeral(r.total)}
            </span>
          </div>
        ))}
      </section>

      <div className="sg-row-buttons">
        <button type="button" className="sg-btn sg-btn-soft" onClick={startChangePin}>
          🔑 تغيير الرمز
        </button>
        <button
          type="button"
          className="sg-btn sg-btn-soft"
          onClick={() => {
            setMode('locked');
            setPin('');
          }}
        >
          🔒 قفل
        </button>
      </div>
      <button type="button" className="sg-btn sg-btn-main" onClick={onBack}>
        ⬅ رجوع للغابة
      </button>
    </main>
  );
}
