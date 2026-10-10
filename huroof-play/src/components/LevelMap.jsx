import React from 'react';
import { LEVEL_DATA } from '../data/index.js';
import { isLevelUnlocked } from '../game/logic.js';

export default function LevelMap({ playerName, completed, results, onPlay, onBack }) {
  const completedIds = Object.keys(completed)
    .filter((id) => completed[id])
    .map(Number);
  const totalStars = Object.values(results).reduce((sum, r) => sum + (r?.stars ?? 0), 0);
  return (
    <main className="screen map" aria-labelledby="map-title">
      <header className="topbar">
        <button type="button" className="btn ghost" onClick={onBack}>
          → رجوع
        </button>
        <h1 id="map-title">خريطة المستويات</h1>
        <span className="pill" aria-label={`نجوم ${totalStars}`}>
          ⭐ {totalStars}
        </span>
      </header>
      <p className="hello">يلا يا {playerName}! اختار مستوى.</p>
      <ol className="level-list">
        {LEVEL_DATA.map((level) => {
          const unlocked = isLevelUnlocked(level.id, completedIds);
          const done = completedIds.includes(level.id);
          const stars = results[level.id]?.stars ?? 0;
          return (
            <li key={level.id}>
              <button
                type="button"
                className={`level-card${done ? ' done' : ''}${unlocked ? '' : ' locked'}`}
                disabled={!unlocked}
                onClick={() => onPlay(level.id)}
                aria-label={`المستوى ${level.id}: ${level.title}. ${
                  !unlocked ? 'مقفول' : done ? `مكتمل، ${stars} من ${level.letters.length} نجوم` : 'متاح'
                }`}
              >
                <span className="level-num">{level.id}</span>
                <span className="level-body">
                  <strong>{level.title}</strong>
                  <span className="level-goal">{level.goal}</span>
                </span>
                <span className="level-state" aria-hidden="true">
                  {!unlocked ? '🔒' : done ? `⭐ ${stars}/${level.letters.length}` : '▶'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
