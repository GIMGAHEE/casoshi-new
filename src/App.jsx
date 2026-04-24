import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PointsBar from './components/PointsBar';
import Home from './screens/Home';
import CharacterDetail from './screens/CharacterDetail';
import TapGame from './screens/TapGame';
import RhythmGame from './screens/RhythmGame';
import CraneGame from './screens/CraneGame';
import Ranking from './screens/Ranking';
import MyOshiBuilder from './screens/MyOshiBuilder';
import MiniHome from './screens/MiniHome';
import RoomEditor from './screens/RoomEditor';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import LiverLogin from './screens/LiverLogin';
import LiverDashboard from './screens/LiverDashboard';
import { getSession } from './auth/session';

export default function App() {
  const [points, setPoints] = useLocalStorage('casoshi:points', 0);
  const [supports, setSupports] = useLocalStorage('casoshi:supports', {});
  const [lastCheckin, setLastCheckin] = useLocalStorage('casoshi:lastCheckin', null);
  const [myOshi, setMyOshi] = useLocalStorage('casoshi:myOshi', null);
  // rooms: { [characterId]: { items: [...] } }
  const [rooms, setRooms] = useLocalStorage('casoshi:rooms', {});

  // screen: home | character | tap | rhythm | crane | ranking | builder | minihome | roomEditor
  //         | adminLogin | adminDashboard | liverLogin | liverDashboard
  const [screen, setScreen] = useState(() => {
    // ① URL ?admin=1 → 운영자 플로우 진입점
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      const s = getSession();
      if (s?.type === 'admin') return { name: 'adminDashboard' };
      return { name: 'adminLogin' };
    }
    // ② 기존 라이버 세션 있으면 대시보드로 직행
    const s = getSession();
    if (s?.type === 'liver' && s.liverId) {
      return { name: 'liverDashboard', params: { liverId: s.liverId } };
    }
    // ③ 기본: 홈
    return { name: 'home' };
  });

  // 운영/라이버 화면에선 PointsBar 숨김
  const hidePointsBar = ['adminLogin', 'adminDashboard', 'liverLogin', 'liverDashboard'].includes(screen.name);

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
      {!hidePointsBar && <PointsBar points={points} onReset={handleReset} />}

      {screen.name === 'home' && (
        <Home
          points={points} setPoints={setPoints}
          supports={supports}
          myOshi={myOshi}
          lastCheckin={lastCheckin} setLastCheckin={setLastCheckin}
          onSelectCharacter={(id) => setScreen({ name: 'minihome', params: { id } })}
          onOpenTapGame={() => setScreen({ name: 'tap' })}
          onOpenRhythmGame={() => setScreen({ name: 'rhythm' })}
          onOpenCraneGame={() => setScreen({ name: 'crane' })}
          onOpenRanking={() => setScreen({ name: 'ranking' })}
          onOpenBuilder={() => setScreen({ name: 'builder' })}
          onOpenLiverLogin={() => setScreen({ name: 'liverLogin' })}
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

      {screen.name === 'rhythm' && (
        <RhythmGame
          points={points} setPoints={setPoints}
          myOshi={myOshi}
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

      {/* ===== 인증/관리 화면 ===== */}
      {screen.name === 'adminLogin' && (
        <AdminLogin
          onSuccess={() => setScreen({ name: 'adminDashboard' })}
          onCancel={() => {
            // URL 파라미터 제거하면서 홈으로
            window.history.replaceState({}, '', window.location.pathname);
            setScreen({ name: 'home' });
          }}
        />
      )}

      {screen.name === 'adminDashboard' && (
        <AdminDashboard
          onLogout={() => {
            window.history.replaceState({}, '', window.location.pathname);
            setScreen({ name: 'home' });
          }}
        />
      )}

      {screen.name === 'liverLogin' && (
        <LiverLogin
          onSuccess={(_session, liver) =>
            setScreen({ name: 'liverDashboard', params: { liverId: liver.id } })
          }
          onCancel={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'liverDashboard' && (
        <LiverDashboard
          liverId={screen.params.liverId}
          onLogout={() => setScreen({ name: 'home' })}
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
