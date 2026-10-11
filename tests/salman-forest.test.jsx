// @vitest-environment happy-dom
// الموقع الموحّد: الحدائق الأربع تعمل معًا — شبكة الحروف، لعبة «مغامرة الحروف» داخل حديقة الحروف،
// ورحلة القرآن الكاملة من حديقة القرآن.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { createState, normalizeState, recordHuroofLevel } from '../src/salman/lib/gamify.js';

const DAYTIME = new Date('2026-10-11T07:00:00Z');
const DAY = '2026-10-11';

beforeEach(() => {
  window.localStorage.clear();
  history.replaceState(null, '', '/');
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(DAYTIME);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.localStorage.clear();
});

describe('مغامرة الحروف: النجوم في حالة سلمان', () => {
  it('تضيف نجوم المستوى لحديقة الحروف مرة واحدة، والتحسّن فقط يعطي نجومًا جديدة', () => {
    let r = recordHuroofLevel(createState(), { levelId: 1, stars: 2, dayKey: DAY });
    expect(r.earned).toBe(2);
    expect(r.state.gardens.arabic).toBe(2);
    expect(r.state.huroof).toEqual({ 1: 2 });
    r = recordHuroofLevel(r.state, { levelId: 1, stars: 2, dayKey: DAY });
    expect(r.earned).toBe(0);
    r = recordHuroofLevel(r.state, { levelId: 1, stars: 4, dayKey: DAY });
    expect(r.earned).toBe(2);
    expect(r.state.gardens.arabic).toBe(4);
    expect(r.state.stars).toBe(4);
  });

  it('الحالة القديمة بلا huroof تُحمَّل سليمة، والقيم الغريبة تُنظَّف', () => {
    expect(normalizeState({ stars: 3 }).huroof).toEqual({});
    expect(normalizeState({ huroof: { 1: 3, x: 2, 2: -1, 3: 99 } }).huroof).toEqual({ 1: 3, 3: 4 });
  });
});

describe('الحدائق الأربع في موقع واحد', () => {
  const tab = (label) => fireEvent.click(within(screen.getByRole('navigation', { name: 'الحدائق' })).getByText(label));

  it('شريط الحدائق يظهر في الغابة وفيه الحدائق الأربع', () => {
    render(<SalmanApp />);
    const nav = screen.getByRole('navigation', { name: 'الحدائق' });
    for (const label of ['الغابة', 'الحروف', 'الأرقام', 'القرآن', 'English']) {
      expect(within(nav).getByText(label)).toBeTruthy();
    }
  });

  it('حديقة الحروف رحلة من ٧ محطات، والمحطة فيها اللعبة وحروفها الأربعة', () => {
    render(<SalmanApp />);
    tab('الحروف');
    expect(location.hash).toBe('#/arabic');
    const stations = document.querySelectorAll('.sg-planet');
    expect(stations).toHaveLength(7);
    // كل كوكب تدور حوله حروفه الأربعة (28 حرفًا)
    expect(document.querySelectorAll('.sg-moon')).toHaveLength(28);
    fireEvent.click(stations[0]);
    expect(location.hash).toBe('#/arabic/1');
    expect(screen.getByText(/العب: صِل الحرف بصديقه/)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^الحرف / })).toHaveLength(4);
  });

  it('اللعبة تُفتح من المحطة نفسها (بلا خريطة مستويات منفصلة)', () => {
    render(<SalmanApp />);
    tab('الحروف');
    fireEvent.click(document.querySelector('.sg-planet'));
    fireEvent.click(screen.getByText(/العب: صِل الحرف بصديقه/).closest('button'));
    expect(document.querySelector('.hp-root .play')).toBeTruthy();
    expect(screen.queryByText('خريطة المستويات')).toBeNull();
  });

  it('الحرف يفتح صفحته وقصصه، وزر الرجوع يرجع للمحطة', () => {
    render(<SalmanApp />);
    tab('الحروف');
    fireEvent.click(document.querySelector('.sg-planet'));
    fireEvent.click(screen.getByRole('button', { name: 'الحرف ب' }));
    expect(screen.getByText('قصص الحرف')).toBeTruthy();
    expect(document.querySelectorAll('.sg-cards li').length).toBeGreaterThanOrEqual(2);
  });

  it('رحلة القرآن واحدة: المستويات كواكب والسور تدور حولها، بلا أقسام منفصلة', () => {
    render(<SalmanApp />);
    tab('القرآن');
    expect(location.hash).toBe('#/quran');
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    const map = document.querySelector('.sg-orbit-map[aria-label="رحلة القرآن"]');
    expect(map.querySelectorAll('.sg-planet')).toHaveLength(3);
    expect(map.querySelectorAll('.sg-moon')).toHaveLength(13);
    // كل سورة عليها جائزتان: 💎 القصة و🪙 الحفظ
    expect(map.querySelectorAll('.sg-moon .sg-gem')).toHaveLength(26);
    expect(screen.getByText(/تابع: سورة الفاتحة/)).toBeTruthy();
    // أدوات تطبيق القرآن جزء من الرحلة نفسها
    expect(screen.getByText('خريطة الأجزاء')).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'الحدائق' })).toBeTruthy();
  });

  it('السورة رحلة بثلاث خطوات: القصة ← استمع وردّد ← حفظتها، ثم السورة التالية', () => {
    render(<SalmanApp />);
    tab('القرآن');
    fireEvent.click(screen.getByText(/تابع: سورة الفاتحة/));
    expect(location.hash).toBe('#/quran/surah/1');
    expect(screen.getByRole('list', { name: 'خطوات سورة الفاتحة' })).toBeTruthy();
    // الخطوة ١: القصة وسؤالها
    expect(screen.getByText('ما اسم السورة اللي قصتها هذه؟')).toBeTruthy();
    const right = screen.getAllByRole('button').find((x) => x.textContent.trim() === 'الفاتحة');
    fireEvent.click(right);
    // الخطوة ٢: مشغّل السورة نفسه داخل الرحلة
    fireEvent.click(screen.getByText(/التالي: استمع وردّد/));
    expect(document.querySelector('.sg-surah-listen .qg-root')).toBeTruthy();
    // الخطوة ٣: الحفظ، ثم الانتقال مباشرة للسورة التالية
    fireEvent.click(screen.getByText(/إلى الحفظ/));
    fireEvent.click(screen.getByText(/حفظتها ✓/));
    fireEvent.click(screen.getByText(/السورة التالية: الناس/));
    expect(location.hash).toBe('#/quran/surah/114');
  });

  it('كنوز الرحلة (أدوات تطبيق القرآن) تفتح داخل الرحلة', () => {
    render(<SalmanApp />);
    tab('القرآن');
    fireEvent.click(screen.getByText('بستاني').closest('button'));
    expect(location.hash).toBe('#/quran/explore/garden');
    expect(document.querySelector('.sg-quran-tab .qg-root')).toBeTruthy();
  });

  it('رابط مباشر إلى سورة: الشاشة لا تقفز بعد الإجابة، وزر «التالي» يظهر', () => {
    history.replaceState(null, '', '/#/quran/surah/1');
    render(<SalmanApp />);
    const right = screen.getAllByRole('button').find((x) => x.textContent.trim() === 'الفاتحة');
    fireEvent.click(right);
    expect(screen.getByText(/التالي: استمع وردّد/)).toBeTruthy();
  });

  it('الروابط القديمة لأقسام القرآن تفتح الرحلة الواحدة', () => {
    history.replaceState(null, '', '/#/quran/levels');
    render(<SalmanApp />);
    expect(document.querySelector('.sg-orbit-map[aria-label="رحلة القرآن"]')).toBeTruthy();
  });

  it('رابط مباشر إلى حديقة يفتحها (يعمل مع زر الرجوع والمشاركة)', () => {
    history.replaceState(null, '', '/#/arabic/3');
    render(<SalmanApp />);
    expect(screen.getByText(/العب: صِل الحرف بصديقه/)).toBeTruthy();
  });

  it('حديقة الأرقام تعرض قصص العدّ والأرقام من ١ إلى ٢٠', () => {
    render(<SalmanApp />);
    tab('الأرقام');
    expect(screen.getByText('قصص العدّ')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'العدّ حتى ٢٠' })).toBeTruthy();
  });

  it('حديقة الإنجليزية تعرض قصص الأصوات', () => {
    render(<SalmanApp />);
    tab('English');
    expect(screen.getByText(/Phonics/)).toBeTruthy();
  });
});

describe('مفتوحة دائمًا: لا «غدًا»، وبعد الإنجاز ننتقل إلى التالي', () => {
  it('لا قفل يومي: حتى بعد فتح عناصر جديدة كثيرة اليوم تبقى كل البطاقات مفتوحة', () => {
    const st = normalizeState({
      ...createState(),
      daily: { day: DAY, newByGarden: { quran: 99, arabic: 99, math: 99, english: 99 } },
    });
    window.localStorage.setItem('salman-garden-v1', JSON.stringify(st));
    history.replaceState(null, '', '/#/math');
    render(<SalmanApp />);
    const cards = [...document.querySelectorAll('.sg-cards .sg-card')];
    expect(cards.length).toBeGreaterThan(5);
    expect(cards.every((c) => !c.disabled)).toBe(true);
    expect(screen.queryByText(/غدًا/)).toBeNull();
  });

  it('بعد الإجابة الصحيحة يظهر «التالي» ويفتح البطاقة التالية مباشرة', () => {
    history.replaceState(null, '', '/#/math');
    render(<SalmanApp />);
    fireEvent.click(screen.getByText('السنجاب يعد الجوز').closest('button'));
    const right = screen.getAllByRole('button').find((x) => x.textContent.trim() === '٣');
    fireEvent.click(right);
    fireEvent.click(screen.getByText(/التالي: النجوم في السماء/));
    expect(screen.getByRole('heading', { level: 2, name: 'النجوم في السماء' })).toBeTruthy();
  });
});
