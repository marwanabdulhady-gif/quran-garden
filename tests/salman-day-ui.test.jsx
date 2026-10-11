// @vitest-environment happy-dom
// واجهة «يوم الحرف» (حدائق النور): الخطوات السبع، صيد الصوت، التتبّع، اللعب، والحفظ في الحالة.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { STORAGE_KEY } from '../src/salman/lib/gamify.js';

const DAYTIME = new Date('2026-10-11T07:00:00Z');

beforeEach(() => {
  window.localStorage.clear();
  history.replaceState(null, '', '/#/nour/arabic/ar-%D8%A3');
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(DAYTIME);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.localStorage.clear();
  history.replaceState(null, '', '/');
});

const btn = (label) => screen.getAllByRole('button').find((b) => b.textContent.includes(label));

function stored() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
}

describe('يوم الحرف (حدائق النور)', () => {
  it('يفتح على مسار #/nour ويعرض خطوات اليوم السبع', () => {
    render(<SalmanApp />);
    expect(screen.getByText(/حروف النور/)).toBeTruthy();
    for (const title of ['باب القصة', 'القصة', 'الصوت والحركة', 'صيد الصوت', 'التتبّع', 'اللعب', 'عمل اليوم']) {
      expect(screen.getByText(title), title).toBeTruthy();
    }
    // البداية عند باب القصة
    expect(btn('التالي')).toBeTruthy();
  });

  it('صيد الصوت: النقر على الصحيح يقدّم، وعلى المشتّت يشرح ويرجع', () => {
    render(<SalmanApp />);
    fireEvent.click(btn('التالي')); // القصة
    fireEvent.click(btn('التالي')); // الصوت
    fireEvent.click(btn('التالي')); // صيد الصوت
    fireEvent.click(screen.getByText('أَسَد'));
    expect(screen.getByText('أحسنت! 🎯')).toBeTruthy();
    fireEvent.click(screen.getByText('أَرْنَب'));
    fireEvent.click(screen.getByText('بَاب'));
    expect(screen.getByText(/لا يبدأ بالصوت/)).toBeTruthy();
    fireEvent.click(screen.getByText('أُحُد'));
    expect(btn('التالي')).toBeTruthy(); // اكتمل الصيد
  });

  it('القطار: الترتيب الصحيح يُقبل ويُظهر الكلمة', () => {
    render(<SalmanApp />);
    for (let i = 0; i < 3; i += 1) fireEvent.click(btn('التالي')); // قصة → صوت → صيد
    for (const w of ['أُحُد', 'أَسَد', 'أَرْنَب']) fireEvent.click(screen.getByText(w));
    fireEvent.click(btn('التالي')); // التتبّع
    fireEvent.click(btn('رسمتها ✓'));
    fireEvent.click(btn('التالي')); // اللعب
    expect(screen.getByText('رَكِّبِ الكَلِمَةَ بِالتَّرْتِيب')).toBeTruthy();
    fireEvent.click(screen.getByText('أَ'));
    fireEvent.click(screen.getByText('بَ'));
    expect(screen.getByText('🎉 أحسنت!')).toBeTruthy();
  });

  it('إكمال اليوم يحفظ الوحدة ويعطي نجمتين مرّة واحدة', () => {
    render(<SalmanApp />);
    for (let i = 0; i < 3; i += 1) fireEvent.click(btn('التالي')); // قصة → صوت → صيد
    for (const w of ['أُحُد', 'أَسَد', 'أَرْنَب']) fireEvent.click(screen.getByText(w));
    fireEvent.click(btn('التالي')); // التتبّع
    fireEvent.click(btn('رسمتها ✓'));
    fireEvent.click(btn('التالي')); // اللعب
    fireEvent.click(screen.getByText('أَ'));
    fireEvent.click(screen.getByText('بَ'));
    fireEvent.click(btn('التالي')); // عمل اليوم
    expect(screen.getAllByText('عمل اليوم').length).toBeGreaterThan(0);
    fireEvent.click(btn('فعلناه'));
    const s = stored();
    expect(s.nour['ar-أ']).toMatchObject({ completed: true, day: '2026-10-11' });
    expect(s.gardens.arabic).toBe(2);
    expect(s.gardens.math).toBe(0);
  });

  it('الإنجليزية تُعرض LTR داخل شاشة RTL (والعربية RTL)', () => {
    history.replaceState(null, '', '/#/nour/english/en-s');
    const { unmount } = render(<SalmanApp />);
    fireEvent.click(btn('التالي')); // إلى القصة
    const enText = document.querySelector('.sg-story-text');
    expect(enText.getAttribute('lang')).toBe('en');
    expect(enText.getAttribute('dir')).toBe('ltr');
    unmount();

    history.replaceState(null, '', '/#/nour/arabic/ar-%D8%A3');
    render(<SalmanApp />);
    fireEvent.click(btn('التالي'));
    const arText = document.querySelector('.sg-story-text');
    expect(arText.getAttribute('lang')).toBe('ar');
    expect(arText.getAttribute('dir')).toBe('rtl');
  });

  it('الكلمة المفتاحية داخل نص القصة مُبرَزة بلون الحديقة', () => {
    render(<SalmanApp />);
    fireEvent.click(btn('التالي'));
    const marks = document.querySelectorAll('.sg-story-text mark');
    expect(marks.length).toBeGreaterThan(0);
    expect(marks[0].textContent).toBe('أُحُد');
  });
});
