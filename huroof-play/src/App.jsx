import React, { useCallback, useMemo, useState } from 'react';
import Welcome from './components/Welcome.jsx';
import LevelMap from './components/LevelMap.jsx';
import Play from './components/Play.jsx';
import { LEVEL_DATA } from './data/index.js';

// حالة التطبيق في الذاكرة في Phase 1 — التخزين الدائم وملفات اللاعبين تُضاف في Phase 3.
export default function App() {
  const [screen, setScreen] = useState({ name: 'welcome' });
  const [playerName, setPlayerName] = useState('');
  const [results, setResults] = useState({}); // levelId -> { stars }
  const [completed, setCompleted] = useState({}); // levelId -> true

  const levelById = useMemo(() => Object.fromEntries(LEVEL_DATA.map((l) => [l.id, l])), []);

  const onStart = (name) => {
    setPlayerName(name);
    setScreen({ name: 'map' });
  };

  const onLevelComplete = useCallback((levelId, stars) => {
    setCompleted((c) => ({ ...c, [levelId]: true }));
    setResults((r) => ({ ...r, [levelId]: { stars: Math.max(stars, r[levelId]?.stars ?? 0) } }));
  }, []);

  if (screen.name === 'welcome') {
    return <Welcome initialName={playerName} onStart={onStart} />;
  }
  if (screen.name === 'map') {
    return (
      <LevelMap
        playerName={playerName}
        completed={completed}
        results={results}
        onPlay={(id) => setScreen({ name: 'play', levelId: id })}
        onBack={() => setScreen({ name: 'welcome' })}
      />
    );
  }
  const level = levelById[screen.levelId];
  const nextId = level.id + 1;
  return (
    <Play
      key={level.id}
      level={level}
      onExit={() => setScreen({ name: 'map' })}
      onLevelComplete={onLevelComplete}
      onNext={levelById[nextId] ? () => setScreen({ name: 'play', levelId: nextId }) : undefined}
    />
  );
}
