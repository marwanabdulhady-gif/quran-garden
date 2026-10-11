import React, { useEffect, useState } from 'react';
import { currentUser, lastSync, signInWithGoogle, signOut, syncNow } from './lib/cloud.js';

// قسم «النسخ الاحتياطي» في وضع ولي الأمر: دخول اختياري بحساب Google لحفظ التقدّم ومزامنته بين الأجهزة.
export default function CloudSync() {
  const [user, setUser] = useState(undefined); // undefined = جارٍ التحقق
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [last, setLast] = useState(() => lastSync());

  const run = async (fn) => {
    setBusy(true);
    setMsg('');
    try {
      await fn();
    } catch {
      setMsg('تعذّر الاتصال الآن. التقدّم محفوظ على هذا الجهاز، وسنحاول لاحقًا.');
    } finally {
      setBusy(false);
    }
  };

  const doSync = () =>
    run(async () => {
      const r = await syncNow();
      if (!r.ok) return setMsg('تعذّرت المزامنة. حاول مرة أخرى.');
      setLast(lastSync());
      if (r.side === 'download') {
        setMsg('وجدنا تقدّمًا أكبر في حسابك، وتم تحميله ✓');
        setTimeout(() => location.reload(), 900);
      } else setMsg('تم الحفظ في حسابك ✓');
    });

  useEffect(() => {
    let alive = true;
    currentUser()
      .then((u) => {
        if (!alive) return;
        setUser(u);
        // أول دخول على هذا الجهاز: نربط التقدّم بالحساب مباشرة
        if (u && !lastSync()) doSync();
      })
      .catch(() => alive && setUser(null));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="sg-level">
      <h2 className="sg-level-title">☁️ النسخ الاحتياطي</h2>
      {user === undefined && <p className="sg-sub">جارٍ التحقق…</p>}
      {user === null && (
        <>
          <p className="sg-sub">
            اختياري: ادخل بحساب Google ليُحفظ تقدّم سلمان في حسابك ويظهر على أي جهاز. بدون دخول يبقى كل شيء على هذا
            الجهاز.
          </p>
          <button type="button" className="sg-chip" disabled={busy} onClick={() => run(signInWithGoogle)}>
            🔐 الدخول بحساب Google
          </button>
        </>
      )}
      {user && (
        <>
          <p className="sg-sub">
            متصل: <bdi>{user.email}</bdi>
            {last ? ` · آخر حفظ: ${new Date(last).toLocaleString('ar-SA')}` : ''}
          </p>
          <div className="sg-parent-row">
            <button type="button" className="sg-chip is-on" disabled={busy} onClick={doSync}>
              🔄 مزامنة الآن
            </button>
            <button
              type="button"
              className="sg-chip"
              disabled={busy}
              onClick={() => run(async () => (await signOut(), setUser(null)))}
            >
              تسجيل الخروج
            </button>
          </div>
        </>
      )}
      {msg && (
        <p className="sg-sub" role="status">
          {msg}
        </p>
      )}
    </section>
  );
}
