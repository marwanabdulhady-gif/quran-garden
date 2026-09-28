// بطاقة تقدم قابلة للمشاركة (P5-33): PNG يرسمها الكانفس — اسم الطفل، النجوم، الأوسمة، الكلمات، السلسلة.
import { BADGES, WORDS, WORDS_R2 } from './data.js';
import { streakOf, discoveredCount } from './store.js';

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

/** يجمع أرقام التقدم في كائن بسيط (قابل للاختبار بدون كانفس). */
export function collectShareStats(child, d = new Date()) {
  const earned = child.badges || [];
  const earnedIds = new Set(earned.map((b) => b.id));
  const emojis = Object.entries(BADGES)
    .filter(([id]) => earnedIds.has(id))
    .map(([, b]) => b.emoji);
  return {
    name: child.name || '',
    stars: child.stars || 0,
    badgesEarned: earned.length,
    badgesTotal: Object.keys(BADGES).length,
    words: discoveredCount(child),
    wordsTotal: WORDS.length + (WORDS_R2 ? WORDS_R2.length : 0),
    streak: streakOf(child),
    listeningMin: Math.round((child.stats?.seconds || 0) / 60),
    badgeEmojis: emojis,
    dateStr: `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  };
}

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

const loadImg = (src) =>
  new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

/** يرسم بطاقة 600×760 وبيعيدها { blob, url }. */
export async function renderShareCard(child, d = new Date()) {
  const st = collectShareStats(child, d);
  const W = 600;
  const H = 760;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');

  // نضمن تحميل الخطوط المحفوظة قبل الرسم
  try {
    if (document.fonts && document.fonts.load) {
      await Promise.all(
        ['900 42px Cairo', '700 22px Cairo', '400 44px Lalezar', '700 26px Amiri'].map((f) =>
          document.fonts.load(f).catch(() => {})
        )
      );
    }
  } catch (e) {
    /* الخطوط غير الجاهزة — نكمل بالخط الاحتياطي */
  }

  // الخلفية
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#ecfdf5');
  g.addColorStop(0.55, '#fffbeb');
  g.addColorStop(1, '#fef3c7');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // حافة زخرفية
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 10;
  roundRect(ctx, 12, 12, W - 24, H - 24, 26);
  ctx.stroke();

  // الترويسة
  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = '400 44px Lalezar, Cairo, sans-serif';
  ctx.fillText('🌿 حديقة القرآن 🌿', W / 2, 84);
  ctx.fillStyle = '#64748b';
  ctx.font = '700 20px Cairo, sans-serif';
  ctx.fillText(st.dateStr, W / 2, 118);

  // الصورة الشخصية أو زينة
  const ax = W / 2;
  const ay = 218;
  const r = 84;
  const img = await loadImg(child.avatar);
  ctx.save();
  ctx.beginPath();
  ctx.arc(ax, ay, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (img) {
    const s = Math.max((2 * r) / img.width, (2 * r) / img.height);
    ctx.drawImage(img, ax - (img.width * s) / 2, ay - (img.height * s) / 2, img.width * s, img.height * s);
  } else {
    ctx.fillStyle = '#d1fae5';
    ctx.fillRect(ax - r, ay - r, r * 2, r * 2);
    ctx.font = '80px sans-serif';
    ctx.fillText('🧒', ax, ay + 28);
  }
  ctx.restore();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(ax, ay, r, 0, Math.PI * 2);
  ctx.stroke();

  // الاسم
  ctx.fillStyle = '#065f46';
  ctx.font = '900 42px Cairo, sans-serif';
  ctx.fillText(st.name, W / 2, 356);

  // شريط الكلمات
  const bx = 60;
  const bw = W - 120;
  const by = 392;
  ctx.textAlign = 'start';
  ctx.fillStyle = '#64748b';
  ctx.font = '700 20px Cairo, sans-serif';
  ctx.fillText('🌱 الكلمات المكتشفة', bx, by);
  ctx.textAlign = 'end';
  ctx.fillStyle = '#065f46';
  ctx.font = '900 22px Cairo, sans-serif';
  ctx.fillText(`${st.words} / ${st.wordsTotal}`, W - bx, by);
  ctx.textAlign = 'center';
  roundRect(ctx, bx, by + 14, bw, 22, 11);
  ctx.fillStyle = '#d1fae5';
  ctx.fill();
  const frac = st.wordsTotal ? st.words / st.wordsTotal : 0;
  if (frac > 0) {
    roundRect(ctx, bx, by + 14, Math.max(22, bw * frac), 22, 11);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  }

  // خانات الأرقام
  const cells = [
    { emoji: '⭐', num: st.stars, lbl: 'نجوم' },
    { emoji: '🏅', num: `${st.badgesEarned}/${st.badgesTotal}`, lbl: 'أوسمة' },
    { emoji: '🔥', num: st.streak, lbl: 'أيام متتالية' },
    { emoji: '🎧', num: st.listeningMin, lbl: 'دقيقة استماع' },
  ];
  const cw = (W - 120 - 3 * 12) / 4;
  cells.forEach((c, i) => {
    const x = 60 + i * (cw + 12);
    const y = 452;
    roundRect(ctx, x, y, cw, 104, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#a7f3d0';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = '34px sans-serif';
    ctx.fillText(c.emoji, x + cw / 2, y + 44);
    ctx.fillStyle = '#065f46';
    ctx.font = '900 26px Cairo, sans-serif';
    ctx.fillText(String(c.num), x + cw / 2, y + 76);
    ctx.fillStyle = '#64748b';
    ctx.font = '700 15px Cairo, sans-serif';
    ctx.fillText(c.lbl, x + cw / 2, y + 96);
  });

  // صف أوسمة متحصل عليها
  if (st.badgeEmojis.length) {
    ctx.fillStyle = '#065f46';
    ctx.font = '700 20px Cairo, sans-serif';
    ctx.fillText('أوسمتي', W / 2, 612);
    ctx.font = '40px sans-serif';
    const rowCap = 10;
    st.badgeEmojis.slice(0, 20).forEach((e, i) => {
      const row = Math.floor(i / rowCap);
      const col = i % rowCap;
      const n = row === 0 ? st.badgeEmojis.slice(0, rowCap).length : Math.min(rowCap, st.badgeEmojis.length - rowCap);
      const startX = W / 2 - ((n - 1) * 48) / 2;
      ctx.fillText(e, startX + col * 48, 662 + row * 50);
    });
  }

  // التذييل
  ctx.fillStyle = '#92400e';
  ctx.font = '700 20px Amiri, Cairo, serif';
  ctx.fillText('رحلةٌ قرآنيةٌ صغيرة تكبر معي 🌱', W / 2, H - 64);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 14px Cairo, sans-serif';
  ctx.fillText('حديقة القرآن · نسخة للمشاركة', W / 2, H - 34);

  const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
  return { blob, url: URL.createObjectURL(blob), width: W, height: H };
}
