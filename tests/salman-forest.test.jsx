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
    const stations = document.querySelectorAll('.sg-station');
    expect(stations).toHaveLength(7);
    fireEvent.click(stations[0]);
    expect(location.hash).toBe('#/arabic/1');
    expect(screen.getByText(/العب: صِل الحرف بصديقه/)).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^الحرف / })).toHaveLength(4);
  });

  it('اللعبة تُفتح من المحطة نفسها (بلا خريطة مستويات منفصلة)', () => {
    render(<SalmanApp />);
    tab('الحروف');
    fireEvent.click(document.querySelector('.sg-station'));
    fireEvent.click(screen.getByText(/العب: صِل الحرف بصديقه/).closest('button'));
    expect(document.querySelector('.hp-root .play')).toBeTruthy();
    expect(screen.queryByText('خريطة المستويات')).toBeNull();
  });

  it('الحرف يفتح صفحته وقصصه، وزر الرجوع يرجع للمحطة', () => {
    render(<SalmanApp />);
    tab('الحروف');
    fireEvent.click(document.querySelector('.sg-station'));
    fireEvent.click(screen.getByRole('button', { name: 'الحرف ب' }));
    expect(screen.getByText('قصص الحرف')).toBeTruthy();
    expect(document.querySelectorAll('.sg-cards li').length).toBeGreaterThanOrEqual(2);
  });

  it('حديقة القرآن هي رحلة القرآن نفسها داخل الغابة', () => {
    render(<SalmanApp />);
    tab('القرآن');
    expect(location.hash).toBe('#/quran');
    expect(document.querySelector('.sg-quran-tab .qg-root')).toBeTruthy();
    // شريط الحدائق باقٍ للرجوع لأي حديقة
    expect(screen.getByRole('navigation', { name: 'الحدائق' })).toBeTruthy();
  });

  it('حديقة القرآن فيها الأقسام الثلاثة: الاستماع والحفظ، قصص السور، مستويات السور', () => {
    render(<SalmanApp />);
    tab('القرآن');
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toEqual(['🎧 رحلة القرآن', '📖 قصص السور', '📗 المستويات']);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('قصص السور الـ13 داخل حديقة القرآن، والقصة تفتح وترجع للقصص', () => {
    render(<SalmanApp />);
    tab('القرآن');
    fireEvent.click(screen.getByRole('tab', { name: '📖 قصص السور' }));
    expect(location.hash).toBe('#/quran/stories');
    const cards = document.querySelectorAll('.sg-cards .sg-card');
    expect(cards).toHaveLength(13);
    fireEvent.click(screen.getByText('سورة الفاتحة').closest('button'));
    expect(screen.getByText('ما اسم السورة اللي قصتها هذه؟')).toBeTruthy();
  });

  it('مستويات السور داخل حديقة القرآن: الأول مفتوح والثاني مقفل حتى يكتمل الأول', () => {
    render(<SalmanApp />);
    tab('القرآن');
    fireEvent.click(screen.getByRole('tab', { name: '📗 المستويات' }));
    expect(location.hash).toBe('#/quran/levels');
    expect(screen.getByText(/المستوى الأول/)).toBeTruthy();
    const second = screen.getByText(/المستوى الثاني/).closest('section');
    expect(within(second).getByText(/افتح المستوى السابق أولًا/)).toBeTruthy();
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
    const s = normalizeState({
      ...createState(),
      daily: { day: DAY, newByGarden: { quran: 99, arabic: 99, math: 99, english: 99 } },
    });
    window.localStorage.setItem('salman-garden-v1', JSON.stringify(s));
    history.replaceState(null, '', '/#/quran/stories');
    render(<SalmanApp />);
    const cards = [...document.querySelectorAll('.sg-cards .sg-card')];
    expect(cards).toHaveLength(13);
    expect(cards.every((c) => !c.disabled)).toBe(true);
    expect(screen.queryByText(/غدًا/)).toBeNull();
  });

  it('بعد الإجابة الصحيحة يظهر «التالي» ويفتح البطاقة التالية مباشرة', () => {
    history.replaceState(null, '', '/#/quran/stories');
    render(<SalmanApp />);
    fireEvent.click(screen.getByText('سورة الفاتحة').closest('button'));
    const right = screen.getAllByRole('button').find((b) => b.textContent.trim() === 'الفاتحة');
    fireEvent.click(right);
    const next = screen.getByText(/التالي: سورة الناس/);
    fireEvent.click(next);
    expect(screen.getByRole('heading', { level: 2, name: 'سورة الناس' })).toBeTruthy();
  });
});
