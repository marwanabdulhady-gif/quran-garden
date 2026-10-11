// @vitest-environment happy-dom
// الموقع الموحّد: الحدائق الأربع تعمل معًا — شبكة الحروف، لعبة «مغامرة الحروف» داخل حديقة الحروف،
// ورحلة القرآن الكاملة من حديقة القرآن.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { createState, normalizeState, recordHuroofLevel, STORAGE_KEY } from '../src/salman/lib/gamify.js';

const DAYTIME = new Date('2026-10-11T07:00:00Z');
const DAY = '2026-10-11';

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

const openGarden = (name) => fireEvent.click(screen.getByText(name).closest('button'));

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
  it('حديقة الحروف تعرض شبكة الحروف الـ28، والحرف يفتح قصصه', () => {
    render(<SalmanApp />);
    openGarden('حديقة الحروف');
    expect(screen.getAllByRole('button', { name: /^الحرف / })).toHaveLength(28);
    fireEvent.click(screen.getByRole('button', { name: 'الحرف ب' }));
    expect(screen.getByText(/كل الحروف/)).toBeTruthy();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
  });

  it('لعبة «مغامرة الحروف» تعمل داخل حديقة الحروف وترجع إليها', () => {
    render(<SalmanApp />);
    openGarden('حديقة الحروف');
    fireEvent.click(screen.getByText('مغامرة الحروف').closest('button'));
    expect(screen.getByText('خريطة المستويات')).toBeTruthy();
    expect(document.querySelector('.hp-root')).toBeTruthy();
    fireEvent.click(screen.getByText(/رجوع/));
    expect(screen.getByText(/حديقة الحروف/)).toBeTruthy();
  });

  it('حديقة القرآن تربط برحلة القرآن الكاملة على /quran.html', () => {
    render(<SalmanApp />);
    openGarden('حديقة القرآن');
    expect(screen.getByText('رحلة حديقة القرآن').closest('a').getAttribute('href')).toBe('/quran.html');
  });

  it('حديقة الأرقام تعرض قصص العدّ والأرقام من ١ إلى ٢٠', () => {
    render(<SalmanApp />);
    openGarden('حديقة الأرقام');
    expect(screen.getByText('قصص العدّ')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'العدّ حتى ٢٠' })).toBeTruthy();
  });

  it('حديقة الإنجليزية تعرض قصص الأصوات', () => {
    render(<SalmanApp />);
    openGarden('حديقة الإنجليزية');
    expect(screen.getByText(/Phonics/)).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}')).toBeTruthy();
  });
});
