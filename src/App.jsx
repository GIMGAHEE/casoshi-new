import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PointsBar from './components/PointsBar';
import Home from './screens/Home';
import CharacterDetail from './screens/CharacterDetail';
import TapGame from './screens/TapGame';
import Ranking from './screens/Ranking';
import MyOshiBuilder from './screens/MyOshiBuilder';

export default function App() {
  const [points, setPoints] = useLocalStorage('casoshi:points', 0);
  const [supports, setSupports] = useLocalStorage('casoshi:supports', {});
  const [lastCheckin, setLastCheckin] = useLocalStorage('casoshi:lastCheckin', null);
  const [myOshi, setMyOshi] = useLocalStorage('casoshi:myOshi', null);

  // screen: { name: 'home' | 'character' | 'tap' | 'ranking' | 'builder', params?: { id } }
  const [screen, setScreen] = useState({ name: 'home' });

  const handleReset = () => {
    if (!window.confirm('全データをリセットしますか？\nマイ推しも削除されます。この操作は取り消せません。')) return;
    setPoints(0);
    setSupports({});
    setLastCheckin(null);
    setMyOshi(null);
    setScreen({ name: 'home' });
  };

  const handleSaveMyOshi = (data) => {
    setMyOshi(data);
    setScreen({ name: 'character', params: { id: 'my_oshi' } });
  };

  return (
    <div className="min-h-screen bg-oshi-bg">
      <PointsBar points={points} onReset={handleReset} />

      {screen.name === 'home' && (
        <Home
          points={points} setPoints={setPoints}
          supports={supports}
          myOshi={myOshi}
          lastCheckin={lastCheckin} setLastCheckin={setLastCheckin}
          onSelectCharacter={(id) => setScreen({ name: 'character', params: { id } })}
          onOpenTapGame={() => setScreen({ name: 'tap' })}
          onOpenRanking={() => setScreen({ name: 'ranking' })}
          onOpenBuilder={() => setScreen({ name: 'builder' })}
        />
      )}

      {screen.name === 'character' && (
        <CharacterDetail
          characterId={screen.params.id}
          myOshi={myOshi}
          points={points} setPoints={setPoints}
          supports={supports} setSupports={setSupports}
          onBack={() => setScreen({ name: 'home' })}
          onEditMyOshi={() => setScreen({ name: 'builder' })}
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
          myOshi={myOshi}
          supports={supports}
          onBack={() => setScreen({ name: 'home' })}
          onSelectCharacter={(id) => setScreen({ name: 'character', params: { id } })}
        />
      )}

      {screen.name === 'builder' && (
        <MyOshiBuilder
          initialOshi={myOshi}
          onSave={handleSaveMyOshi}
          onCancel={() => setScreen({ name: myOshi ? 'character' : 'home', params: myOshi ? { id: 'my_oshi' } : undefined })}
        />
      )}
    </div>
  );
}
