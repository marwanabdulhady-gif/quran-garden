// اختيار جلسة اليوم (زيارة اليوم) — دالة نقية.
// القواعد (docs/salmans-garden/PROPOSAL.md §4 و§1):
//   - الجلسة من 5 إلى 8 عناصر (دقيقة إلى دقيقتين).
//   - الترتيب: العربية ← الرياضيات ← القرآن ← الإنجليزية.
//   - من كل حديقة حتى عنصرين أولًا: المراجعات المستحقة، ثم الجديد (بحدّ 2 جديد لكل حديقة في اليوم).
//   - إن قلّت الجلسة عن 5: تُكمَل بمراجعات أخرى من الحديقة نفسها، ثم بممارسة عناصر متعلَّمة غير مستحقة.
//   - العنصر الذي ظهر اليوم لا يُعاد في الجلسة نفسها.

import { GARDEN_ORDER } from '../data/gardens.js';
import { isDue, DAILY_NEW_CAP } from './leitner.js';
import { newAllowed } from './gamify.js';

export const SESSION_MIN = 5;
export const SESSION_MAX = 8;
const PER_GARDEN_FIRST = 2;
const PER_GARDEN_MAX = 3;

function byDue(a, b) {
  const da = a.rec.due ?? '';
  const db = b.rec.due ?? '';
  return da < db ? -1 : da > db ? 1 : 0;
}

// catalog: { garden: [items] }، وكل عنصر فيه id وgarden
export function pickSession(state, catalog, dayKey, order = GARDEN_ORDER) {
  const queues = {};
  for (const g of order) {
    const items = catalog[g] || [];
    const review = [];
    const fresh = [];
    const practice = [];
    for (const item of items) {
      const rec = state.skills[item.id];
      if (!rec) {
        fresh.push({ item, rec: null });
      } else if (rec.lastSeen === dayKey) {
        continue; // ظهر اليوم
      } else if (isDue(rec, dayKey)) {
        review.push({ item, rec });
      } else {
        practice.push({ item, rec });
      }
    }
    review.sort(byDue);
    practice.sort((a, b) => (a.rec.lastSeen ?? '').localeCompare(b.rec.lastSeen ?? ''));
    const allowance = newAllowed(state, g, dayKey);
    queues[g] = {
      review: review.map((c) => ({ ...c, kind: 'review' })),
      fresh: fresh.slice(0, Math.min(allowance, DAILY_NEW_CAP)).map((c) => ({ ...c, kind: 'new' })),
      practice: practice.map((c) => ({ ...c, kind: 'practice' })),
    };
  }

  const picks = [];
  const count = {};
  for (const g of order) count[g] = 0;

  // نأخذ من الطابور الأول فالأول، لكن لا نتجاوز الحدّ للحديقة (لا مراجعة ثم جديد ثم ممارسة في طابور واحد)
  const takeFrom = (g, kinds) => {
    const q = queues[g];
    for (const kind of kinds) {
      const list = q[kind === 'practice' ? 'practice' : kind === 'new' ? 'fresh' : 'review'];
      if (list.length) {
        const [c] = list.splice(0, 1);
        picks.push({ item: c.item, kind, garden: g });
        count[g] += 1;
        return true;
      }
    }
    return false;
  };

  // 1) حتى عنصرين من كل حديقة: مراجعة ثم جديد
  for (const g of order) {
    while (count[g] < PER_GARDEN_FIRST && takeFrom(g, ['review', 'new'])) {
      // يكمل الحلقة
    }
  }

  // 2) إن قلّت الجلسة: مراجعات وجديد إضافي من الحدائق بالتناوب حتى 3 لكل حديقة
  let progress = true;
  while (picks.length < SESSION_MIN && progress) {
    progress = false;
    for (const g of order) {
      if (picks.length >= SESSION_MIN) break;
      if (count[g] < PER_GARDEN_MAX && takeFrom(g, ['review', 'new'])) progress = true;
    }
  }

  // 3) ما زالت قليلة: ممارسة عناصر متعلَّمة غير مستحقة
  progress = true;
  while (picks.length < SESSION_MIN && progress) {
    progress = false;
    for (const g of order) {
      if (picks.length >= SESSION_MIN) break;
      if (takeFrom(g, ['practice'])) progress = true;
    }
  }

  const rank = new Map(order.map((g, i) => [g, i]));
  return picks
    .slice(0, SESSION_MAX)
    .sort((a, b) => rank.get(a.garden) - rank.get(b.garden))
    .map((p) => ({ ...p.item, kind: p.kind }));
}
