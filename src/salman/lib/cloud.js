// النسخ الاحتياطي والمزامنة عبر Supabase (اختياري): ولي الأمر يدخل بحساب Google من «ولي الأمر».
// بدون دخول يعمل التطبيق محليًا وأوفلاين كما هو. صف واحد لكل عائلة في public.family_progress،
// محمي بـ RLS: كل حساب يرى صفّه فقط. المفتاح هنا «publishable» (عام بطبيعته)، والحماية من RLS.
// مكتبة Supabase تُحمَّل عند الحاجة فقط (import ديناميكي) حتى لا تكبر الصفحة الأولى.

import { STORAGE_KEY } from './gamify.js';

export const SUPABASE_URL = 'https://dsjazywixcqzwwjnhzzf.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_d0kPuzODleNRC3VjaD-xVQ_CduFxpzZ';
export const QURAN_KEY = 'quran-garden-family-v1';
const LAST_SYNC_KEY = 'salman-cloud-last-sync';

let clientPromise = null;
export function getClient() {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    );
  }
  return clientPromise;
}

// مقدار التقدّم في حالة الغابة (لاختيار النسخة الأغنى عند أول ربط بين جهازين)
export function progressScore(salman) {
  if (!salman || typeof salman !== 'object') return 0;
  const stars = Number(salman.stars) || 0;
  const done =
    salman.doneStories && typeof salman.doneStories === 'object' ? Object.keys(salman.doneStories).length : 0;
  const days = salman.nour && typeof salman.nour === 'object' ? Object.keys(salman.nour).length : 0;
  return stars + done + days;
}

// أول مزامنة: إن لم يوجد صف في السحابة نرفع المحلي. وإن وُجد نأخذ الأكثر تقدّمًا
// (لا نسأل الطفل، ولا نخلط حالتين). بعد ذلك تصبح المزامنة رفعًا تلقائيًا بعد كل تغيير.
export function chooseSide(local, remote) {
  if (!remote) return 'upload';
  return progressScore(remote.salman) > progressScore(local.salman) ? 'download' : 'upload';
}

function readLocal(storage = globalThis.localStorage) {
  const parse = (k) => {
    try {
      return JSON.parse(storage.getItem(k) || '{}');
    } catch {
      return {};
    }
  };
  return { salman: parse(STORAGE_KEY), quran: parse(QURAN_KEY) };
}

// فحص سريع بلا شبكة وبلا تحميل المكتبة: هل يوجد دخول محفوظ على هذا الجهاز؟
export function hasSession(storage = globalThis.localStorage) {
  try {
    return !!storage.getItem(`sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`);
  } catch {
    return false;
  }
}

export async function currentUser() {
  const sb = await getClient();
  const { data } = await sb.auth.getSession();
  return data.session?.user || null;
}

export async function signInWithGoogle() {
  const sb = await getClient();
  // نرجع إلى صفحة ولي الأمر بعد الدخول
  return sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${location.origin}/#/parent` },
  });
}

export async function signOut() {
  const sb = await getClient();
  return sb.auth.signOut();
}

export async function upload(storage = globalThis.localStorage) {
  const sb = await getClient();
  const user = await currentUser();
  if (!user) return { ok: false, reason: 'signed-out' };
  const { salman, quran } = readLocal(storage);
  const { error } = await sb.from('family_progress').upsert({ user_id: user.id, salman, quran });
  if (error) return { ok: false, reason: error.message };
  storage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  return { ok: true };
}

// المزامنة الأولى بعد الدخول. تُرجع 'download' إن استُبدلت البيانات المحلية (فيُعاد تحميل الصفحة).
export async function syncNow(storage = globalThis.localStorage) {
  const sb = await getClient();
  const user = await currentUser();
  if (!user) return { ok: false, reason: 'signed-out' };
  const { data, error } = await sb
    .from('family_progress')
    .select('salman, quran, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return { ok: false, reason: error.message };
  const side = chooseSide(readLocal(storage), data);
  if (side === 'download') {
    storage.setItem(STORAGE_KEY, JSON.stringify(data.salman));
    if (data.quran && Object.keys(data.quran).length) storage.setItem(QURAN_KEY, JSON.stringify(data.quran));
    storage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return { ok: true, side };
  }
  const r = await upload(storage);
  return { ...r, side };
}

export function lastSync(storage = globalThis.localStorage) {
  try {
    return storage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}
