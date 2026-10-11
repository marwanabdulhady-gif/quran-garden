import React, { useCallback, useMemo, useState } from 'react';
import LevelMap from '../huroof/components/LevelMap.jsx';
import Play from '../huroof/components/Play.jsx';
import { LEVEL_DATA } from '../huroof/data/index.js';
import '../huroof/huroof.css';

// «مغامرة الحروف» داخل حديقة الحروف: اسحب الحرف إلى الحيوان الذي يبدأ به.
// التقدّم (أفضل نجوم لكل مستوى) يُحفظ في حالة سلمان، والنجوم تُضاف لحديقة الحروف.
export default function HuroofGame({ name, best, onLevelComplete, onExit }) {
  const [levelId, setLevelId] = useState(null);
  const levelById = useMemo(() => Object.fromEntries(LEVEL_DATA.map((l) => [l.id, l])), []);

  const completed = useMemo(() => Object.fromEntries(Object.keys(best).map((id) => [id, true])), [best]);
  const results = useMemo(() => Object.fromEntries(Object.entries(best).map(([id, stars]) => [id, { stars }])), [best]);

  const finish = useCallback((id, stars) => onLevelComplete(id, stars), [onLevelComplete]);

  const level = levelId ? levelById[levelId] : null;
  return (
    <div className="hp-root" dir="rtl">
      {level ? (
        <Play
          key={level.id}
          level={level}
          onExit={() => setLevelId(null)}
          onLevelComplete={finish}
          onNext={levelById[level.id + 1] ? () => setLevelId(level.id + 1) : undefined}
        />
      ) : (
        <LevelMap playerName={name} completed={completed} results={results} onPlay={setLevelId} onBack={onExit} />
      )}
    </div>
  );
}
