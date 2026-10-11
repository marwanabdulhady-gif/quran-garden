// @vitest-environment happy-dom
// اختبار واجهة ولي الأمر في حديقة سلمان: ضبط الرمز، والرمز الخاطئ، وحدّ الزيارة، وساعات الهدوء.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { STORAGE_KEY, createState, dayKeyFrom } from '../src/salman/lib/gamify.js';
import { makePinRecord, PARENT_DEFAULTS } from '../src/salman/lib/parent.js';
import { toArabicNumeral } from '../src/salman/lib/catalog.js';

// 10:00 بتوقيت الرياض: نهار، فلا تتدخل ساعات الهدوء
const DAYTIME = new Date('2026-10-11T07:00:00Z');
// 23:00 بتوقيت الرياض: ساعات الهدوء
const NIGHT = new Date('2026-10-11T20:00:00Z');

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(DAYTIME);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.localStorage.clear();
});

const saved = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY));

function typePin(str) {
  for (const d of str) {
    fireEvent.click(screen.getByRole('button', { name: toArabicNumeral(Number(d)) }));
  }
}

const openParent = () => fireEvent.click(screen.getByRole('button', { name: /ولي الأمر/ }));

describe('ولي الأمر — ضبط الرمز والدخول', () => {
  it('أول مرة بلا رمز: تظهر شاشة الضبط، ويُحفظ الرمز كتجزئة فقط بعد التأكيد', () => {
    render(<SalmanApp />);
    openParent();
    expect(screen.getByText('أدخل رمزًا جديدًا من 4 أرقام')).toBeTruthy();

    typePin('1234');
    expect(screen.getByText('أعد إدخال الرمز للتأكيد')).toBeTruthy();
    typePin('1234');

    expect(screen.getByText(/الزيارات اليومية/)).toBeTruthy();
    const p = saved().parent;
    expect(p.pinHash).toMatch(/^[0-9a-f]{8}$/);
    expect(p.pinSalt).toBeTruthy();
    expect(JSON.stringify(saved())).not.toContain('"1234"');
  });

  it('تأكيد لا يطابق: يبدأ من جديد ولا يُحفظ شيء', () => {
    render(<SalmanApp />);
    openParent();
    typePin('1234');
    typePin('4321');
    expect(screen.getByText(/الرمزان غير متطابقين/)).toBeTruthy();
    expect(saved().parent.pinHash).toBeNull();
  });

  it('رمز خاطئ يظهر رسالة لطيفة، والرمز الصحيح يفتح الإعدادات', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...createState(), parent: { ...PARENT_DEFAULTS, ...makePinRecord('5678', 'salt') } })
    );
    render(<SalmanApp />);
    openParent();
    expect(screen.getByText('أدخل رمز ولي الأمر')).toBeTruthy();

    typePin('1111');
    expect(screen.getByText(/الرمز غير صحيح/)).toBeTruthy();

    typePin('5678');
    expect(screen.getByText(/الزيارات اليومية/)).toBeTruthy();
  });
});

describe('ولي الأمر — الزيارة وساعات الهدوء على الغابة', () => {
  it('بعد استنفاد حدّ اليوم يختفي زر الزيارة ويظهر سبب لطيف بلا عدّاد', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...createState(), visitLog: { day: dayKeyFrom(DAYTIME), count: 1 } })
    );
    render(<SalmanApp />);
    expect(screen.queryByText(/زيارة اليوم \(/)).toBeNull();
    expect(screen.getByText(/خلصت زيارة اليوم/)).toBeTruthy();
  });

  it('ساعات الهدوء تُظهر رسالة النوم بدل زر الزيارة', () => {
    vi.setSystemTime(NIGHT);
    render(<SalmanApp />);
    expect(screen.queryByText(/زيارة اليوم \(/)).toBeNull();
    expect(screen.getByText(/الغابة نايمة الآن/)).toBeTruthy();
  });

  it('بدء الزيارة يسجّل عدّاد اليوم، والزيارة الثانية في نفس اليوم تُمنع', () => {
    render(<SalmanApp />);
    fireEvent.click(screen.getByText(/زيارة اليوم \(/));
    expect(saved().visitLog).toEqual({ day: dayKeyFrom(DAYTIME), count: 1 });
  });
});
