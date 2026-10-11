// المزامنة السحابية (اختيارية): اختيار النسخة الأغنى عند أول ربط، وفحص الدخول بلا شبكة
import { describe, it, expect } from 'vitest';
import { chooseSide, progressScore, hasSession, SUPABASE_KEY } from '../src/salman/lib/cloud.js';

const mem = (obj = {}) => ({ getItem: (k) => (k in obj ? obj[k] : null), setItem: (k, v) => (obj[k] = v) });

describe('cloud sync', () => {
  it('progressScore يجمع النجوم والقصص المنجزة وأيام الوحدات', () => {
    expect(progressScore(null)).toBe(0);
    expect(progressScore({ stars: 5, doneStories: { a: 1, b: 1 }, nour: { x: {} } })).toBe(8);
  });

  it('أول ربط: لا صف في السحابة ← نرفع المحلي', () => {
    expect(chooseSide({ salman: { stars: 3 } }, null)).toBe('upload');
  });

  it('السحابة أغنى (جهاز جديد) ← نحمّل، والمحلي أغنى ← نرفع', () => {
    expect(chooseSide({ salman: {} }, { salman: { stars: 10 } })).toBe('download');
    expect(chooseSide({ salman: { stars: 10 } }, { salman: { stars: 2 } })).toBe('upload');
  });

  it('hasSession يقرأ مفتاح الجلسة المحلي بلا شبكة', () => {
    expect(hasSession(mem())).toBe(false);
    expect(hasSession(mem({ 'sb-dsjazywixcqzwwjnhzzf-auth-token': '{}' }))).toBe(true);
  });

  it('المفتاح في الكود هو المفتاح العام (publishable) فقط، لا مفتاح الخدمة', () => {
    expect(SUPABASE_KEY.startsWith('sb_publishable_')).toBe(true);
  });
});
