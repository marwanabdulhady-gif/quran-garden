// @vitest-environment happy-dom
// اختبار واجهة حديقة سلمان: الغابة، زيارة اليوم، الخطأ لا يعاقب، والإجابة الصحيحة تحفظ النجوم
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { CATALOG, visitPlan } from '../src/salman/lib/catalog.js';
import { STORAGE_KEY } from '../src/salman/lib/gamify.js';

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

function choiceButton(label) {
  return screen.getAllByRole('button').find((b) => b.textContent.trim() === label);
}

describe('حديقة سلمان — الواجهة', () => {
  it('الغابة تعرض الحدائق الأربع وزر زيارة اليوم', () => {
    render(<SalmanApp />);
    expect(screen.getByText('حديقة الحروف')).toBeTruthy();
    expect(screen.getByText('حديقة القرآن')).toBeTruthy();
    expect(screen.getByText('حديقة الأرقام')).toBeTruthy();
    expect(screen.getByText('حديقة الإنجليزية')).toBeTruthy();
    expect(screen.getByText(/زيارة اليوم/)).toBeTruthy();
  });

  it('زيارة اليوم تبدأ بقصة العربية، وفيها سؤال من خيارين فقط', () => {
    render(<SalmanApp />);
    fireEvent.click(screen.getByText(/زيارة اليوم/));
    expect(screen.getByText(/زيارة اليوم · ١ \/ ٤/)).toBeTruthy();
    const first = visitPlan({})[0];
    const choices = first.question.choices;
    expect(choices).toHaveLength(2);
    for (const c of choices) {
      expect(choiceButton(c)).toBeTruthy();
    }
  });

  it('الخيار الخاطئ لا يعطي نجمة ولا يعاقب، والصحيح يعطي نجمتين ويحفظ الحالة', () => {
    render(<SalmanApp />);
    fireEvent.click(screen.getByText(/زيارة اليوم/));
    const first = visitPlan({})[0];
    const wrong = first.question.choices.find((c) => c !== first.question.answer);

    fireEvent.click(choiceButton(wrong));
    expect(screen.getByText(/قريب! جرّب مرة ثانية/)).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).stars).toBe(0);

    fireEvent.click(choiceButton(first.question.answer));
    expect(screen.getByText('أحسنت! ⭐')).toBeTruthy();
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    // الإجابة الصحيحة بعد خطأ واحد = نجمة (المكافأة المضاعفة لأول محاولة فقط)
    expect(saved.stars).toBe(1);
    expect(saved.doneStories[first.id]).toBe(true);
    expect(saved.gardens.arabic).toBe(1);
  });

  it('فتح مستويات القرآن يعرض المستوى الأول مفتوحًا والثاني مقفلًا', () => {
    render(<SalmanApp />);
    fireEvent.click(screen.getByText('📗 مستويات السور'));
    expect(screen.getByText(/المستوى الأول/)).toBeTruthy();
    const second = screen.getByText(/المستوى الثاني/).closest('section');
    expect(within(second).getByText(/افتح المستوى السابق أولًا/)).toBeTruthy();
  });

  it('عدد الأسئلة في كل حديقة مطابق للكتالوج', () => {
    expect(CATALOG.arabic.length).toBeGreaterThanOrEqual(28);
    expect(CATALOG.quran.length).toBe(13);
  });
});
