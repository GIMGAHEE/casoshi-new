import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLivers } from './hooks/useLivers';
import PointsBar from './components/PointsBar';
import Home from './screens/Home';
import CharacterDetail from './screens/CharacterDetail';
import TapGame from './screens/TapGame';
import RhythmGame from './screens/RhythmGame';
import CraneGame from './screens/CraneGame';
import Ranking from './screens/Ranking';
import MyOshiBuilder from './screens/MyOshiBuilder';
import ProfileEditor from './screens/ProfileEditor';
import MiniHome from './screens/MiniHome';
import RoomEditor from './screens/RoomEditor';
import AdminLogin from './screens/AdminLogin';
import AdminDashboard from './screens/AdminDashboard';
import LiverLogin from './screens/LiverLogin';
import LiverDashboard from './screens/LiverDashboard';
import GachaHome from './screens/Gacha/GachaHome';
import BottomNav from './components/BottomNav';
import { getSession } from './auth/session';
import { getUserId } from './auth/userIdentity';
import { saveMyOshi as saveMyOshiRemote, deleteMyOshi as deleteMyOshiRemote } from './data/myOshiRepository';

export default function App() {
  const [points, setPoints] = useLocalStorage('casoshi:points', 0);
  const [supports, setSupports] = useLocalStorage('casoshi:supports', {});
  const [lastCheckin, setLastCheckin] = useLocalStorage('casoshi:lastCheckin', null);
  const [myOshi, setMyOshi] = useLocalStorage('casoshi:myOshi', null);
  // rooms: { [characterId]: { items: [...] } }
  const [rooms, setRooms] = useLocalStorage('casoshi:rooms', {});

  // Firestore 라이버 실시간 구독 (RoomEditor 의 character 결정에 필요)
  const livers = useLivers();

  // MyOshi 가 변할 때마다 Firestore 에도 sync (랭킹에서 다른 유저들이 볼 수 있게)
  useEffect(() => {
    if (myOshi) {
      saveMyOshiRemote(getUserId(), myOshi).catch(err => {
        console.warn('[myOshi sync] failed', err);
      });
    }
  }, [myOshi]);

  // 라이버 세션 (null 또는 { liverId, username, ... })
  const [liverSession, setLiverSession] = useState(() => {
    const s = getSession();
    return s?.type === 'liver' ? s : null;
  });

  // screen: home | character | tap | rhythm | crane | ranking | builder | minihome | roomEditor
  //         | adminLogin | adminDashboard | liverLogin | liverDashboard
  const [screen, setScreen] = useState(() => {
    // URL ?admin=1 → 운영자 플로우
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') {
      const s = getSession();
      if (s?.type === 'admin') return { name: 'adminDashboard' };
      return { name: 'adminLogin' };
    }
    // 라이버 세션이 있어도 홈으로 진입 (대시보드는 버튼으로 접근)
    return { name: 'home' };
  });

  // 운영/로그인 화면에선 PointsBar 숨김 (홈은 라이버 로그인 상태여도 표시)
  const hidePointsBar = ['adminLogin', 'adminDashboard', 'liverLogin', 'liverDashboard'].includes(screen.name);
  // 하단 네비: 메인 흐름 (home/ranking/minihome/characterDetail 등) 에서만 표시.
  // 게임/빌더/에디터/운영/로그인 중엔 숨겨서 집중하게.
  const hideBottomNav = [
    'adminLogin', 'adminDashboard',
    'liverLogin', 'liverDashboard',
    'builder', 'roomEditor',
    'tapGame', 'craneGame', 'rhythmGame',
    'gacha',
    'myOshiProfileEditor', 'liverProfileEditor',
    'character',
  ].includes(screen.name);

  // 현재 화면으로부터 활성 탭 결정
  const activeTab = (() => {
    if (screen.name === 'ranking') return 'ranking';
    if (screen.name === 'minihome' && screen.params?.id === 'my_oshi') return 'myoshi';
    if (screen.name === 'builder') return 'myoshi';
    return 'home'; // 기타 화면은 home 트리로 간주
  })();

  const handleNav = (tabId) => {
    switch (tabId) {
      case 'home':
        setScreen({ name: 'home' });
        break;
      case 'ranking':
      case 'support':
        setScreen({ name: 'ranking' });
        break;
      case 'myoshi':
        // MyOshi 있으면 미니홈, 없으면 빌더
        if (myOshi) {
          setScreen({ name: 'minihome', params: { id: 'my_oshi' } });
        } else {
          setScreen({ name: 'builder' });
        }
        break;
    }
  };

  const handleReset = () => {
    if (!window.confirm('全データをリセットしますか？\nマイ推しも削除されます。この操作は取り消せません。')) return;
    // Firestore 의 MyOshi 문서 먼저 삭제 (localStorage 초기화하면 userId 도 사라져서 참조 불가)
    const uid = getUserId();
    deleteMyOshiRemote(uid).catch(err => {
      console.warn('[myOshi reset] delete failed', err);
    });
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
    <div className={`min-h-screen ${hideBottomNav ? '' : 'pb-16'}`}>
      {!hidePointsBar && <PointsBar points={points} onReset={handleReset} />}

      {screen.name === 'home' && (
        <Home
          points={points} setPoints={setPoints}
          supports={supports}
          myOshi={myOshi}
          liverSession={liverSession}
          lastCheckin={lastCheckin} setLastCheckin={setLastCheckin}
          onSelectCharacter={(id) => setScreen({ name: 'minihome', params: { id } })}
          onOpenTapGame={() => setScreen({ name: 'tap' })}
          onOpenRhythmGame={() => setScreen({ name: 'rhythm' })}
          onOpenCraneGame={() => setScreen({ name: 'crane' })}
          onOpenGacha={() => setScreen({ name: 'gacha' })}
          onOpenRanking={() => setScreen({ name: 'ranking' })}
          onOpenBuilder={() => setScreen({ name: 'builder' })}
          onOpenLiverLogin={() => setScreen({ name: 'liverLogin' })}
          onOpenLiverDashboard={() =>
            setScreen({ name: 'liverDashboard', params: { liverId: liverSession?.liverId } })
          }
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
          onEditProfile={() => setScreen({ name: 'myOshiProfileEditor' })}
        />
      )}

      {screen.name === 'character' && (
        <CharacterDetail
          characterId={screen.params.id}
          myOshi={myOshi}
          liverSession={liverSession}
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

      {screen.name === 'gacha' && (
        <GachaHome
          userId={getUserId()}
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

      {screen.name === 'myOshiProfileEditor' && myOshi && (
        <ProfileEditor
          title={`${myOshi.name}のプロフィール`}
          initialBio={myOshi.bio || ''}
          initialDialogues={myOshi.dialogues || []}
          bioPlaceholder={`${myOshi.name}は、あなただけのために生まれた推しです…`}
          dialoguePlaceholders={{
            1: 'よろしくね！私は' + myOshi.name + 'だよ♪',
            2: 'えへへ、また会えたね！',
            3: 'あなたのおかげで、元気が出るよ！',
            5: 'ずっと応援してくれて、本当にありがとう。',
            10: '私の一番の推し活仲間、それはあなただよ！',
          }}
          onSave={(result) => {
            setMyOshi({ ...myOshi, bio: result.bio, dialogues: result.dialogues });
            setScreen({ name: 'minihome', params: { id: 'my_oshi' } });
          }}
          onCancel={() => setScreen({ name: 'minihome', params: { id: 'my_oshi' } })}
        />
      )}

      {screen.name === 'roomEditor' && (
        <RoomEditor
          character={findCharacterForRoom(screen.params.id, myOshi, livers)}
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
          onSuccess={(session) => {
            setLiverSession(session);
            setScreen({ name: 'home' });   // 로그인 후 홈으로
          }}
          onCancel={() => setScreen({ name: 'home' })}
        />
      )}

      {screen.name === 'liverDashboard' && (
        <LiverDashboard
          liverId={screen.params.liverId}
          onBack={() => setScreen({ name: 'home' })}
          onLogout={() => {
            setLiverSession(null);
            setScreen({ name: 'home' });
          }}
        />
      )}

      {!hideBottomNav && <BottomNav active={activeTab} onNavigate={handleNav} />}
    </div>
  );
}

// RoomEditor에 character 정보 넘기는 헬퍼 (배경 결정용)
import { findCharacter } from './data/characters';
function findCharacterForRoom(id, myOshi, livers) {
  return findCharacter(myOshi, id, livers);
}
