// منطق اللعبة النقي (بدون React أو DOM) — مختبر بالكامل في tests/logic.test.js

export const HINT_AFTER_MISSES = 2; // بعد كام غلطة على نفس الحرف يظهر تلميح الهدف الصح
export const FIRST_TRY_STAR = 1; // نجمة لكل حرف اتحط صح من أول محاولة

// أول حرف من اسم الحيوان — هو اللي بيحدد الهدف الصح
export function initialLetter(word) {
  return typeof word === 'string' && word.length > 0 ? Array.from(word)[0] : '';
}

export function isCorrectMatch(letter, pair) {
  return Boolean(pair) && pair.letter === letter && initialLetter(pair.word) === letter;
}

// خلط Fisher–Yates بـ rng قابل للحقن (للاختبار)
export function shuffle(items, rng = Math.random) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function createLevelState(level, rng = Math.random) {
  const pairs = {};
  level.pairs.forEach((p) => {
    pairs[p.letter] = p;
  });
  return {
    levelId: level.id,
    pairs,
    letters: shuffle(
      level.pairs.map((p) => p.letter),
      rng
    ),
    targets: shuffle(
      level.pairs.map((p) => p.letter),
      rng
    ),
    placements: {}, // letter -> target (letter of the animal it was placed on)
    mistakes: {}, // letter -> عدد الغلطات
    firstTry: {}, // letter -> true لو اتحط صح من أول مرة
    selected: null, // الحرف المختار بالضغط (بديل السحب)
    feedback: null, // { kind: 'correct' | 'wrong', letter, target, id }
    hintLetter: null,
    complete: false,
  };
}

export function starsEarned(state) {
  return Object.values(state.firstTry).filter(Boolean).length * FIRST_TRY_STAR;
}

export function placedCount(state) {
  return Object.keys(state.placements).length;
}

export function occupiedTargets(state) {
  return new Set(Object.values(state.placements));
}

// الهدف الذي يُعرض عليه التلميح الآن (أو null)
export function hintTarget(state) {
  if (!state.hintLetter || state.placements[state.hintLetter] !== undefined) return null;
  return state.hintLetter;
}

let feedbackSeq = 0;
function feedback(kind, letter, target) {
  feedbackSeq += 1;
  return { kind, letter, target, id: feedbackSeq };
}

export function levelReducer(state, action) {
  switch (action.type) {
    case 'clear':
      return state.selected === null ? state : { ...state, selected: null };
    case 'select': {
      const { letter } = action;
      if (!state.pairs[letter] || state.placements[letter] !== undefined) return state;
      return { ...state, selected: state.selected === letter ? null : letter };
    }
    case 'place': {
      const letter = action.letter ?? state.selected;
      const target = action.target;
      if (!letter || !state.pairs[letter] || !state.pairs[target]) return state;
      if (state.placements[letter] !== undefined) return state;
      if (occupiedTargets(state).has(target)) return state;

      if (isCorrectMatch(letter, state.pairs[target])) {
        const placements = { ...state.placements, [letter]: target };
        const firstTry = { ...state.firstTry, [letter]: (state.mistakes[letter] ?? 0) === 0 };
        const hintLetter = state.hintLetter === letter ? null : state.hintLetter;
        return {
          ...state,
          placements,
          firstTry,
          hintLetter,
          selected: null,
          feedback: feedback('correct', letter, target),
          complete: Object.keys(placements).length === Object.keys(state.pairs).length,
        };
      }

      const misses = (state.mistakes[letter] ?? 0) + 1;
      return {
        ...state,
        mistakes: { ...state.mistakes, [letter]: misses },
        hintLetter: misses >= HINT_AFTER_MISSES ? letter : state.hintLetter,
        feedback: feedback('wrong', letter, target),
      };
    }
    default:
      return state;
  }
}

export function isLevelUnlocked(levelId, completedIds) {
  return levelId === 1 || completedIds.includes(levelId - 1);
}
