import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PointsBar from './components/PointsBar';
import Home from './screens/Home';
import CharacterDetail from './screens/CharacterDetail';
import TapGame from './screens/TapGame';
import CraneGame from './screens/CraneGame';
import Ranking from './screens/Ranking';
import MyOshiBuilder from './screens/MyOshiBuilder';
import MiniHome from './screens/MiniHome';
import RoomEditor from './screens/RoomEditor';

export default function App() {
  const [points, setPoints] = useLocalStorage('casoshi:points', 0);
  const [supports, setSupports] = useLocalStorage('casoshi:supports', {});
  const [lastCheckin, setLastCheckin] = useLocalStorage('casoshi:lastCheckin', null);
  const [myOshi, setMyOshi] = useLocalStorage('casoshi:myOshi', null);
  // rooms: { [characterId]: { items: [...] } }
  const [rooms, setRooms] = useLocalStorage('casoshi:rooms', {});

  // screen: home | character | tap | ranking | builder | minihome | roomEditor
  const [screen, setScreen] = useState({ name: 'home' });

  const handleReset = () => {
    if (!window.confirm('全データをリセットしますか？\nマイ推しも削除されます。この操作は取り消せません。')) return;
    setPoints(0);
    setSupports({});
    setLastCheckin(null);
    setMyOshi(null);
    setRooms({});
    setScreen({ name: 'home' });
  };

  const handleSaveMyOshi = (data) => {
    setMyOshi(data);
    setScreen({ name: 'minihome', params: { id: 'my_oshi' } });
  };

  const handleSaveRoom = (characterId, roomData) => {
    setRooms({ ...rooms, [characterId]: roomData });
    setScreen({ name: 'minihome', params: { id: characterId } });
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
          onSelectCharacter={(id) => setScreen({ name: 'minihome', params: { id } })}
          onOpenTapGame={() => setScreen({ name: 'tap' })}
          onOpenCraneGame={() => setScreen({ name: 'crane' })}
          onOpenRanking={() => setScreen({ name: 'ranking' })}
          onOpenBuilder={() => setScreen({ name: 'builder' })}
        />
      )}

      {screen.name === 'minihome' && (
        <MiniHome
          characterId={screen.params.id}
          myOshi={myOshi}
          supports={supports}
          room={rooms[screen.params.id]}
          onBack={() => setScreen({ name: 'home' })}
          onOpenDetail={(id) => setScreen({ name: 'character', params: { id } })}
          onEditRoom={() => setScreen({ name: 'roomEditor', params: screen.params })}
        />
      )}

      {screen.name === 'character' && (
        <CharacterDetail
          characterId={screen.params.id}
          myOshi={myOshi}
          points={points} setPoints={setPoints}
          supports={supports} setSupports={setSupports}
          onBack={() => setScreen({ name: 'minihome', params: screen.params })}
          onEditMyOshi={() => setScreen({ name: 'builder' })}
          onOpenMiniHome={() => setScreen({ name: 'minihome', params: screen.params })}
        />
      )}

      {screen.name === 'tap' && (
        <TapGame
          points={points} setPoints={setPoints}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'crane' && (
        <CraneGame
          points={points} setPoints={setPoints}
          onBack={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'ranking' && (
        <Ranking
          myOshi={myOshi}
          supports={supports}
          onBack={() => setScreen({ name: 'home' })}
          onSelectCharacter={(id) => setScreen({ name: 'minihome', params: { id } })}
        />
      )}

      {screen.name === 'builder' && (
        <MyOshiBuilder
          initialOshi={myOshi}
          onSave={handleSaveMyOshi}
          onCancel={() => setScreen({ name: myOshi ? 'minihome' : 'home', params: myOshi ? { id: 'my_oshi' } : undefined })}
        />
      )}

      {screen.name === 'roomEditor' && (
        <RoomEditor
          character={findCharacterForRoom(screen.params.id, myOshi)}
          initialRoom={rooms[screen.params.id]}
          supportPoints={supports[screen.params.id] || 0}
          onSave={(roomData) => handleSaveRoom(screen.params.id, roomData)}
          onCancel={() => setScreen({ name: 'minihome', params: screen.params })}
        />
      )}
    </div>
  );
}

// RoomEditor에 character 정보 넘기는 헬퍼 (배경 결정용)
import { findCharacter } from './data/characters';
function findCharacterForRoom(id, myOshi) {
  return findCharacter(myOshi, id);
}
