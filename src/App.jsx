import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PointsBar from './components/PointsBar';
import Home from './screens/Home';
import CharacterDetail from './screens/CharacterDetail';
import TapGame from './screens/TapGame';
import Ranking from './screens/Ranking';

export default function App() {
  // 상태 (localStorage 자동 동기화)
  const [points, setPoints] = useLocalStorage('casoshi:points', 0);
  const [supports, setSupports] = useLocalStorage('casoshi:supports', {}); // { [charId]: points }
  const [lastCheckin, setLastCheckin] = useLocalStorage('casoshi:lastCheckin', null);

  // 간단한 화면 라우팅 (Phase 1: react-router 없이)
  // screen: { name: 'home' | 'character' | 'tap' | 'ranking', params?: { id } }
  const [screen, setScreen] = useState({ name: 'home' });

  const handleReset = () => {
    if (!window.confirm('全データをリセットしますか？\nこの操作は取り消せません。')) return;
    setPoints(0);
    setSupports({});
    setLastCheckin(null);
    setScreen({ name: 'home' });
  };

  return (
    <div className="min-h-screen bg-oshi-bg">
      <PointsBar points={points} onReset={handleReset} />

      {screen.name === 'home' && (
        <Home
          points={points} setPoints={setPoints}
          supports={supports}
          lastCheckin={lastCheckin} setLastCheckin={setLastCheckin}
          onSelectCharacter={(id) => setScreen({ name: 'character', params: { id } })}
          onOpenTapGame={() => setScreen({ name: 'tap' })}
          onOpenRanking={() => setScreen({ name: 'ranking' })}
        />
      )}

      {screen.name === 'character' && (
        <CharacterDetail
          characterId={screen.params.id}
          points={points} setPoints={setPoints}
          supports={supports} setSupports={setSupports}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'tap' && (
        <TapGame
          points={points} setPoints={setPoints}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'ranking' && (
        <Ranking
          supports={supports}
          onBack={() => setScreen({ name: 'home' })}
          onSelectCharacter={(id) => setScreen({ name: 'character', params: { id } })}
        />
      )}
    </div>
  );
}
