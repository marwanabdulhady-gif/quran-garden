// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { render, fireEvent, cleanup, act, within } from '@testing-library/react';
import Play from '../src/huroof/components/Play.jsx';
import { LEVEL_DATA } from '../src/huroof/data/index.js';

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});
afterEach(() => cleanup());

const level1 = LEVEL_DATA[0];
const letterBtn = (c, letter) => c.container.querySelector(`[data-letter="${letter}"]`);
const targetBtn = (c, target) => c.container.querySelector(`[data-target="${target}"]`);

describe('Play — لعبة المستوى', () => {
  it('الضغط: اختيار حرف ثم حيوانه بيحط الحرف ويدّي نجمة', () => {
    const c = render(<Play level={level1} onExit={() => {}} />);
    fireEvent.click(letterBtn(c, 'ب'));
    expect(letterBtn(c, 'ب').getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(targetBtn(c, 'ب'));
    expect(letterBtn(c, 'ب').disabled).toBe(true);
    expect(targetBtn(c, 'ب').disabled).toBe(true);
    expect(c.container.querySelector('.pill').textContent).toContain('1');
  });

  it('الغلطة بتعرض رسالة مشجعة بدون ما تكشف الإجابة', () => {
    const c = render(<Play level={level1} onExit={() => {}} />);
    fireEvent.click(letterBtn(c, 'ث'));
    fireEvent.click(targetBtn(c, 'أ'));
    const live = c.container.querySelector('[role="status"]');
    expect(live.textContent).toContain('لا بأس');
    expect(letterBtn(c, 'ث').disabled).toBe(false);
  });

  it('السحب بالمؤشر: pointerdown ثم pointerup على الحيوان الصح بيحط الحرف', () => {
    const c = render(<Play level={level1} onExit={() => {}} />);
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => targetBtn(c, 'ت');
    try {
      const letter = letterBtn(c, 'ت');
      fireEvent.pointerDown(letter, { clientX: 100, clientY: 100, button: 0 });
      act(() => {
        window.dispatchEvent(new MouseEvent('pointermove', { clientX: 200, clientY: 300 }));
      });
      expect(c.container.querySelector('.drag-ghost')).not.toBeNull();
      act(() => {
        window.dispatchEvent(new MouseEvent('pointerup', { clientX: 200, clientY: 300 }));
      });
      expect(letterBtn(c, 'ت').disabled).toBe(true);
      expect(c.container.querySelector('.drag-ghost')).toBeNull();
    } finally {
      document.elementFromPoint = originalElementFromPoint;
    }
  });

  it('السحب لمكان فاضي ما بيحطش حاجة', () => {
    const c = render(<Play level={level1} onExit={() => {}} />);
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = () => document.body;
    try {
      fireEvent.pointerDown(letterBtn(c, 'ث'), { clientX: 10, clientY: 10, button: 0 });
      act(() => {
        window.dispatchEvent(new MouseEvent('pointermove', { clientX: 90, clientY: 90 }));
        window.dispatchEvent(new MouseEvent('pointerup', { clientX: 90, clientY: 90 }));
      });
      expect(letterBtn(c, 'ث').disabled).toBe(false);
    } finally {
      document.elementFromPoint = originalElementFromPoint;
    }
  });

  it('لما المستوى يخلص: الحوار يظهر وonLevelComplete بيتنده بالنجوم', () => {
    const onLevelComplete = vi.fn();
    const onNext = vi.fn();
    const c = render(<Play level={level1} onExit={() => {}} onLevelComplete={onLevelComplete} onNext={onNext} />);
    level1.pairs.forEach((p) => {
      fireEvent.click(letterBtn(c, p.letter));
      fireEvent.click(targetBtn(c, p.letter));
    });
    const dialog = c.getByRole('dialog');
    expect(within(dialog).getByText(/أكملت/)).toBeTruthy();
    expect(onLevelComplete).toHaveBeenCalledTimes(1);
    expect(onLevelComplete).toHaveBeenCalledWith(1, 4);
    fireEvent.click(within(dialog).getByText(/المستوى التالي/));
    expect(onNext).toHaveBeenCalled();
  });

  it('مفتاح Escape بيلغي اختيار الحرف', () => {
    const c = render(<Play level={level1} onExit={() => {}} />);
    fireEvent.click(letterBtn(c, 'أ'));
    expect(letterBtn(c, 'أ').getAttribute('aria-pressed')).toBe('true');
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(letterBtn(c, 'أ').getAttribute('aria-pressed')).toBe('false');
  });
});
