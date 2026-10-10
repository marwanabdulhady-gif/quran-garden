// @vitest-environment happy-dom
// اختبار واجهة حديقة سلمان: الغابة، زيارة اليوم، الخطأ لا يعاقب، والإجابة الصحيحة تحفظ النجوم
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import SalmanApp from '../src/salman/SalmanApp.jsx';
import { CATALOG } from '../src/salman/lib/catalog.js';
import { STORAGE_KEY, createState, dayKeyFrom } from '../src/salman/lib/gamify.js';
import { pickSession } from '../src/salman/lib/session.js';

const firstOfVisit = () => pickSession(createState(), CATALOG, dayKeyFrom())[0];

// وقت نهاري ثابت بتوقيت الرياض (10:00): ساعات الهدوء تمنع الزيارة ليلًا، فلا نعتمد على ساعة الجهاز
const DAYTIME = new Date('2026-10-11T07:00:00Z');

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
    expect(screen.getByText(/زيارة اليوم · ١ \/ ٨/)).toBeTruthy();
    const first = firstOfVisit();
    const choices = first.question.choices;
    expect(choices).toHaveLength(2);
    for (const c of choices) {
      expect(choiceButton(c)).toBeTruthy();
    }
  });

  it('الخيار الخاطئ لا يعطي نجمة ولا يعاقب، والصحيح يعطي نجمتين ويحفظ الحالة', () => {
    render(<SalmanApp />);
    fireEvent.click(screen.getByText(/زيارة اليوم/));
    const first = firstOfVisit();
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

  it('ليلي: الخطأ الأول يُسجَّل في Leitner (صندوق 1) والصحيح بعده يعطي نجمة واحدة', () => {
    render(<SalmanApp />);
    fireEvent.click(screen.getByText(/زيارة اليوم/));
    const first = firstOfVisit();
    const wrong = first.question.choices.find((c) => c !== first.question.answer);
    fireEvent.click(choiceButton(wrong));
    const midway = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(midway.skills[first.id].box).toBe(1);
    expect(midway.skills[first.id].days).toBe(0);
    fireEvent.click(choiceButton(first.question.answer));
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    expect(saved.skills[first.id].box).toBe(1);
    expect(saved.stars).toBe(1);
  });
});
