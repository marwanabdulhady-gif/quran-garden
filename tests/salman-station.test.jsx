// @vitest-environment happy-dom
// مسح كامل للمحطة الأولى: نلعب «يوم الوحدة» للوحدات الاثنتي عشرة كلها من أول خطوة إلى
// «عمل اليوم»، ونتأكد أن كل وحدة تُحفظ مكتملة وأن النجوم تُمنح مرة واحدة.
// هذا هو الفحص الذي يقوم مقام «جولة يد في التطبيق» قبل بوابة الطفل.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { NOUR_UNITS, NOUR_ORDER } from '../src/salman/data/nour.js';
import { scramble } from '../src/salman/lib/letterday.js';
import { STORAGE_KEY } from '../src/salman/lib/gamify.js';

const DAYTIME = new Date('2026-10-11T07:00:00Z');
const UNITS = Object.values(NOUR_ORDER)
  .flat()
  .map((id) => NOUR_UNITS[id]);

beforeEach(() => {
  window.localStorage.clear();
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

// يلعب وحدة كاملة ويعيد حالة التخزين في النهاية
function playUnit(unit) {
  history.replaceState(null, '', `/#/nour/${unit.garden}/${encodeURIComponent(unit.id)}`);
  render(<SalmanApp />);

  fireEvent.click(btn('التالي')); // الباب → القصة
  fireEvent.click(btn('التالي')); // القصة → الصوت
  fireEvent.click(btn('التالي')); // الصوت → الصيد

  // الصيد: ننقر كل البطاقات (الصحيح يُحتسب، والمشتّت يشرح ويعود)
  for (const item of unit.hunt.items) {
    const span = screen.getAllByText(item.label)[0];
    fireEvent.click(span);
  }
  fireEvent.click(btn('التالي')); // الصيد → التتبّع
  fireEvent.click(btn('رسمتها ✓'));
  fireEvent.click(btn('التالي')); // التتبّع → اللعب

  // اللعب: ننقر البلاطات بترتيب الحلّ، مع تحويل ترتيب العرض المبعثر
  const round = unit.play === 'boxes' ? unit.boxes : unit.train;
  const display = scramble(round.tiles);
  const tiles = document.querySelectorAll('.sg-order-tiles button');
  expect(tiles.length, `${unit.id}: عدد البلاطات`).toBe(round.tiles.length);
  for (let k = 0; k < round.tiles.length; k += 1) {
    fireEvent.click(tiles[display.indexOf(k)]);
  }
  fireEvent.click(btn('التالي')); // اللعب → عمل اليوم
  fireEvent.click(btn('فعلناه'));

  const state = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  cleanup();
  return state;
}

describe('الوصول إلى يوم الوحدة من داخل التطبيق', () => {
  it('حديقة الأرقام: تبويب الأرقام ثم «أيام الأرقام» تفتح يوم الوحدة', () => {
    history.replaceState(null, '', '/');
    render(<SalmanApp />);
    fireEvent.click(screen.getByText('الأرقام')); // التبويب
    expect(screen.getByText('أيام الأرقام · ١–٤')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /١\s*أَحَد/ }));
    expect(document.querySelector('.sg-day-title strong').textContent).toContain('١');
  });

  it('شاشة الحرف: زر «ابدأ يوم الحرف» يفتح اليوم، ويتغيّر إلى «راجعه» بعد الإكمال', () => {
    history.replaceState(null, '', `/#/arabic/letter/${encodeURIComponent('أ')}`);
    render(<SalmanApp />);
    fireEvent.click(btn('ابدأ يوم الحرف'));
    expect(document.querySelector('.sg-day-title strong').textContent).toContain('أ');
    cleanup();

    // بعد إكمال الوحدة يصير الزر «يوم الحرف (راجعه)»
    playUnit(NOUR_UNITS['ar-أ']);
    history.replaceState(null, '', `/#/arabic/letter/${encodeURIComponent('أ')}`);
    render(<SalmanApp />);
    expect(btn('يوم الحرف (راجعه)')).toBeTruthy();
  });

  it('الحديقة الإنجليزية: «Letter Days» تفتح يوم الصوت', () => {
    history.replaceState(null, '', '/');
    render(<SalmanApp />);
    fireEvent.click(screen.getByText('English'));
    expect(screen.getByText('Letter Days · s a t i')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /s\s*sun/ }));
    const head = document.querySelector('.sg-day-title strong');
    expect(head.textContent).toContain('s');
    expect(head.getAttribute('lang')).toBe('en');
  });
});

describe('رمز الوحدة في الواجهة', () => {
  it('ترويسة اليوم تعرض الرمز (لا undefined) في الحدائق الثلاث', () => {
    const cases = [
      ['ar-أ', 'أ'],
      ['num-1', '١'],
      ['en-s', 's'],
    ];
    for (const [id, glyph] of cases) {
      const unit = NOUR_UNITS[id];
      history.replaceState(null, '', `/#/nour/${unit.garden}/${encodeURIComponent(id)}`);
      render(<SalmanApp />);
      const head = document.querySelector('.sg-day-title strong');
      expect(head.textContent, id).toContain(glyph);
      expect(head.textContent, id).not.toContain('undefined');
      cleanup();
    }
  });
});

describe('المحطة الأولى — مسح كامل للوحدات الاثنتي عشرة', () => {
  it('كل وحدة تُكمَل من الباب إلى عمل اليوم وتُحفظ', () => {
    let state = null;
    for (const unit of UNITS) {
      state = playUnit(unit);
      expect(state.nour[unit.id], `${unit.id} لم تُحفظ`).toMatchObject({ day: '2026-10-11', completed: true });
      expect(state.nour[unit.id].done.length, `${unit.id}: الخطوات`).toBeGreaterThanOrEqual(5);
    }
    expect(Object.keys(state.nour)).toHaveLength(16);
  });

  it('النجوم: نجمتان لكل وحدة مكتملة، موزّعة على الحدائق الثلاث', () => {
    let state = null;
    for (const unit of UNITS) state = playUnit(unit);
    expect(state.gardens).toMatchObject({ arabic: 16, math: 8, english: 8 });
    expect(state.stars).toBe(32);
    expect(state.streak.current).toBe(1);
  });

  it('إعادة الوحدة نفسها لا تمنح نجومًا جديدة', () => {
    const unit = NOUR_UNITS['ar-أ'];
    playUnit(unit);
    const again = playUnit(unit);
    expect(again.stars).toBe(2);
    expect(again.gardens.arabic).toBe(2);
  });
});
