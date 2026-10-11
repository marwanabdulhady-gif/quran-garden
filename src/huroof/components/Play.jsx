import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createLevelState, hintTarget, levelReducer, placedCount, starsEarned } from '../game/logic.js';
import AnimalArt from './AnimalArt.jsx';
import { playClip } from '../lib/audio.js';

const DRAG_THRESHOLD_PX = 8;
// بعد السحب المتحرك، المتصفح ممكن يبعت click على عنصر تاني — نفلتر ده لفترة قصيرة بس
const CLICK_SUPPRESS_MS = 350;

// الشاشة الأساسية: الحروف على اليمين، الحيوانات على اليسار (RTL).
// ثلاث طرق للعب بنفس المنطق: السحب بالمؤشر، الضغط (اختَر حرف ثم حيوان)، ولوحة المفاتيح (Tab + Enter).
export default function Play({ level, onExit, onLevelComplete, onNext }) {
  const [state, dispatch] = useReducer(levelReducer, level, (lv) => createLevelState(lv));
  const [drag, setDrag] = useState(null); // { letter, x, y }
  const [announce, setAnnounce] = useState('');
  const suppressClick = useRef(false);
  const suppressTimer = useRef(null);
  const doneReported = useRef(false);
  const correctCount = useRef(0);

  const hint = hintTarget(state);
  const lastHint = useRef(null);
  useEffect(() => {
    if (hint && hint !== lastHint.current) playClip('hint');
    lastHint.current = hint;
  }, [hint]);
  const placed = placedCount(state);
  const total = level.pairs.length;
  const stars = starsEarned(state);
  const pairFor = useCallback((letter) => level.pairs.find((p) => p.letter === letter), [level.pairs]);

  // نتيجة كل محاولة: نص للقارئ الشاشة + نطق الكلمة عند الصح
  useEffect(() => {
    if (!state.feedback) return;
    const { kind, letter, target } = state.feedback;
    if (kind === 'correct') {
      const pair = pairFor(target);
      setAnnounce(`أحسنت! ${letter} مع ${pair?.word}`);
      // بالتبادل: اسم الحيوان بعد كل صح، ومقطع تشجيع مختلف
      playClip(correctCount.current % 2 === 0 ? 'correct1' : 'correct2');
      correctCount.current += 1;
    } else {
      setAnnounce('لا بأس، جرّب حيوان تاني');
      playClip('retry');
    }
  }, [state.feedback, pairFor]);

  // إبلاغ الأب بالنتيجة مرة واحدة عند الاكتمال
  useEffect(() => {
    if (state.complete && !doneReported.current) {
      doneReported.current = true;
      playClip('levelComplete');
      onLevelComplete?.(level.id, stars);
    }
  }, [state.complete, stars, level.id, onLevelComplete]);

  // Escape يلغي اختيار الحرف
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') dispatch({ type: 'clear' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // تنظيف مؤقت الكليك عند الخروج
  useEffect(() => () => clearTimeout(suppressTimer.current), []);

  const armClickSuppression = () => {
    suppressClick.current = true;
    clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => {
      suppressClick.current = false;
    }, CLICK_SUPPRESS_MS);
  };

  // ---- السحب بالمؤشر (ماوس/لمس/قلم) ----
  const startDrag = (letter, e) => {
    if (state.placements[letter] !== undefined || e.button > 0) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    setDrag({ letter, x: startX, y: startY });

    const onMove = (ev) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) > DRAG_THRESHOLD_PX) moved = true;
      setDrag({ letter, x: ev.clientX, y: ev.clientY });
    };
    const finish = (ev, cancelled) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      setDrag(null);
      if (!moved) return; // ضغطة بسيطة: onClick هيتعامل معاها
      armClickSuppression();
      if (cancelled) return;
      const zone = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('[data-target]');
      if (zone) dispatch({ type: 'place', letter, target: zone.dataset.target });
    };
    const onUp = (ev) => finish(ev, false);
    const onCancel = (ev) => finish(ev, true);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  // click الناتج عن الكيبورد عنده detail=0 — بنفلتر بس الـ click اللي جاي من مؤشر بعد السحب
  const isStaleDragClick = (e) => suppressClick.current && e.detail > 0;

  const onLetterClick = (e, letter) => {
    if (isStaleDragClick(e)) return;
    dispatch({ type: 'select', letter });
    playClip('select');
  };

  const onTargetClick = (e, target) => {
    if (isStaleDragClick(e)) return;
    dispatch({ type: 'place', target });
  };

  const lastWrong = state.feedback?.kind === 'wrong' ? state.feedback : null;
  const lastRightTarget = state.feedback?.kind === 'correct' ? state.feedback.target : null;

  return (
    <main className="screen play" aria-labelledby="play-title">
      <header className="topbar">
        <button type="button" className="btn ghost" onClick={onExit}>
          → الخريطة
        </button>
        <div className="play-title">
          <h1 id="play-title">{level.title}</h1>
          <span className="sub">{level.goal}</span>
        </div>
        <span className="pill" aria-label={`نجوم ${stars}`}>
          ⭐ {stars}
        </span>
      </header>

      <p className="instruction" aria-live="off">
        {state.selected
          ? `اخترت حرف ${state.selected}. دلوقتي اسحبه أو اضغط على الحيوان اللي بيبدأ بيه.`
          : 'اختَر حرفًا ثم اسحبه إلى صديقه — أو اضغط على الحرف ثم على الحيوان.'}
      </p>

      <div className="board">
        <section className="column letters" aria-label="الحروف">
          {state.letters.map((letter) => {
            const done = state.placements[letter] !== undefined;
            const isSelected = state.selected === letter;
            const wrongNow = lastWrong?.letter === letter;
            return (
              <button
                key={letter}
                type="button"
                className={`tile letter${done ? ' placed' : ''}${isSelected ? ' selected' : ''}${
                  drag?.letter === letter ? ' dragging' : ''
                }`}
                data-letter={letter}
                disabled={done}
                aria-pressed={isSelected}
                aria-label={`حرف ${letter}${done ? '، تم وضعه' : ''}`}
                onPointerDown={(e) => startDrag(letter, e)}
                onClick={(e) => onLetterClick(e, letter)}
              >
                {/* المفتاح بيتغير مع كل غلطة عشان الاهتزازة تتكرر */}
                <span key={wrongNow ? lastWrong.id : 'calm'} className={`glyph${wrongNow ? ' wobble' : ''}`}>
                  {letter}
                </span>
              </button>
            );
          })}
        </section>

        <section className="column animals" aria-label="الحيوانات">
          {state.targets.map((target) => {
            const pair = pairFor(target);
            const filledBy = Object.keys(state.placements).find((l) => state.placements[l] === target);
            const isHint = hint === target;
            const justRight = lastRightTarget === target;
            return (
              <button
                key={target}
                type="button"
                className={`tile animal${filledBy ? ' filled' : ''}${isHint ? ' hint' : ''}${
                  justRight ? ' celebrate' : ''
                }${drag && !filledBy ? ' droppable' : ''}`}
                data-target={target}
                disabled={Boolean(filledBy)}
                aria-label={`${pair.word}${filledBy ? `، فيه حرف ${filledBy} في مكانه` : ''}`}
                onClick={(e) => onTargetClick(e, target)}
              >
                <AnimalArt pair={pair} />
                <span className="word">{pair.word}</span>
                {filledBy && <span className="filled-letter">{filledBy}</span>}
              </button>
            );
          })}
        </section>
      </div>

      <p className="progress" aria-hidden="true">
        {placed} / {total}
      </p>
      <div className="sr-only" role="status" aria-live="polite">
        {announce}
      </div>

      {drag && (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {drag.letter}
        </div>
      )}

      {state.complete && (
        <div className="overlay">
          <div className="done-card" role="dialog" aria-modal="true" aria-labelledby="done-title">
            <div className="done-emoji" aria-hidden="true">
              🎉
            </div>
            <h2 id="done-title">أحسنت! أكملت {level.title}</h2>
            <p>
              كسبت <strong>{stars}</strong> من {total} نجوم من أول محاولة.
            </p>
            <div className="done-actions">
              {onNext && (
                <button type="button" className="btn primary big" onClick={onNext}>
                  المستوى التالي ←
                </button>
              )}
              <button type="button" className="btn ghost" onClick={onExit}>
                خريطة المستويات
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
