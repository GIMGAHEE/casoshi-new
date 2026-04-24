import { useState } from 'react';
import { updateLiver, changeLiverPassword } from '../auth/liverRepository';
import { useLivers } from '../hooks/useLivers';
import { logout } from '../auth/session';
import MyOshiBuilder from './MyOshiBuilder';
import RoomEditor from './RoomEditor';
import { asLiverCharacter } from '../data/characters';
import PixelAvatar from '../components/PixelAvatar';

export default function LiverDashboard({ liverId, onBack, onLogout }) {
  const livers = useLivers();
  const liver = livers.find(l => l.id === liverId) || null;
  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [builderMode, setBuilderMode] = useState(false);
  const [roomMode, setRoomMode] = useState(false);

  if (!liver) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="text-sm text-oshi-dark/60 mb-4">アカウント情報が見つかりません</div>
        <button
          onClick={() => { logout(); onLogout(); }}
          className="px-4 py-2 rounded-full bg-oshi-main text-white text-sm"
        >
          再ログイン
        </button>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    onLogout();
  };

  if (editMode) {
    return (
      <EditProfileForm
        liver={liver}
        onCancel={() => setEditMode(false)}
        onSaved={() => {
          // Firestore onSnapshot 이 자동으로 liver 를 업데이트함
          setEditMode(false);
        }}
      />
    );
  }

  if (pwMode) {
    return (
      <ChangePasswordForm
        liver={liver}
        onCancel={() => setPwMode(false)}
        onDone={() => setPwMode(false)}
      />
    );
  }

  // 자기 꾸미기 모드 — MyOshiBuilder 재활용
  if (builderMode) {
    const initial = {
      name: liver.profile.name,  // 표시만, 저장 안 함
      presetId: liver.appearance?.presetId,
      hairstyleId: liver.appearance?.hairstyleId,
      hairOffset: liver.appearance?.hairOffset,
    };
    return (
      <MyOshiBuilder
        initialOshi={initial}
        onCancel={() => setBuilderMode(false)}
        onSave={async ({ presetId, hairstyleId, hairOffset }) => {
          try {
            await updateLiver(liver.id, {
              appearance: { presetId, hairstyleId, hairOffset },
            });
            setBuilderMode(false);
          } catch (err) {
            alert('保存に失敗しました: ' + err.message);
          }
        }}
      />
    );
  }

  // 방 꾸미기 모드 — RoomEditor 재활용
  if (roomMode) {
    const character = asLiverCharacter(liver);
    return (
      <RoomEditor
        character={character}
        initialRoom={liver.room}
        supportPoints={liver.stats?.totalSupport || 0}
        onCancel={() => setRoomMode(false)}
        onSave={async (roomData) => {
          try {
            await updateLiver(liver.id, { room: roomData });
            setRoomMode(false);
          } catch (err) {
            alert('保存に失敗しました: ' + err.message);
          }
        }}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="active:scale-95">
          <img
            src="/icons/back.png"
            alt="戻る"
            className="w-10 h-10 object-contain"
            style={{ imageRendering: 'pixelated' }}
            draggable={false}
          />
        </button>
        <div className="text-center">
          <div className="text-sm font-black text-oshi-dark">🎤 マイページ</div>
          <div className="text-[10px] text-oshi-dark/60">ID: {liver.username}</div>
        </div>
        <button
          onClick={handleLogout}
          className="text-[11px] text-oshi-dark/60 hover:text-oshi-dark underline"
        >
          ログアウト
        </button>
      </div>

      {/* 프로필 카드 */}
      <div
        className="relative rounded-3xl p-5 border-2 shadow-md mb-4 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${liver.profile.themeColor}22, ${liver.profile.bgColor})`,
          borderColor: liver.profile.themeColor + '60',
        }}
      >
        {/* LIVER 뱃지 */}
        <div
          className="absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow"
          style={{ background: liver.profile.themeColor }}
        >
          ★ LIVER
        </div>

        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-white/70 overflow-hidden relative">
            {(() => {
              const liverChar = asLiverCharacter(liver);
              if (liverChar?.sprite && liverChar.spriteSize && !liverChar.hairOverlay) {
                return (
                  <img
                    src={liverChar.sprite}
                    alt=""
                    draggable={false}
                    style={{ height: '90%', width: 'auto', imageRendering: 'pixelated' }}
                  />
                );
              }
              if (liverChar?.sprite) {
                return (
                  <PixelAvatar
                    sprite={liverChar.sprite}
                    size={56}
                    hairOverlay={liverChar.hairOverlay}
                    hairTransform={liverChar.hairTransform}
                  />
                );
              }
              return (
                <>
                  <div className="text-4xl">
                    {liver.profile.gender === 'boy' ? '👦' : '👧'}
                  </div>
                  {/* 꾸미기 힌트 배지 */}
                  <div className="absolute -bottom-1 -right-1 bg-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow border border-oshi-sub text-oshi-main">
                    ✨ NEW
                  </div>
                </>
              );
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-black text-oshi-dark">{liver.profile.name}</div>
            {liver.profile.bio && (
              <div className="text-xs text-oshi-dark/70 mt-1">{liver.profile.bio}</div>
            )}
            {liver.profile.casLiveHandle && (
              <div className="text-[11px] font-bold mt-1" style={{ color: liver.profile.themeColor }}>
                🎥 {liver.profile.casLiveHandle}
              </div>
            )}
            {liver.profile.streamSchedule && (
              <div className="text-[10px] text-oshi-dark/60 mt-0.5">
                📅 {liver.profile.streamSchedule}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 통계 — 이모지 + 그라디언트 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="relative bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 p-3 text-center overflow-hidden">
          <div className="absolute -top-2 -right-2 text-4xl opacity-20 select-none">💖</div>
          <div className="relative">
            <div className="text-[10px] font-bold text-oshi-dark/60">累計応援pt</div>
            <div className="text-3xl font-black text-oshi-main leading-tight">
              {liver.stats?.totalSupport || 0}
            </div>
          </div>
        </div>
        <div className="relative bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl border-2 border-yellow-200 p-3 text-center overflow-hidden">
          <div className="absolute -top-2 -right-2 text-4xl opacity-20 select-none">👥</div>
          <div className="relative">
            <div className="text-[10px] font-bold text-oshi-dark/60">応援者数</div>
            <div className="text-3xl font-black text-orange-500 leading-tight">
              {liver.stats?.supporterCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 액션 — 꾸미기 기능 (2열 feature 카드) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setBuilderMode(true)}
          className="group relative overflow-hidden rounded-3xl shadow-lg active:scale-[0.97] transition aspect-[1/1.1]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-pink-500 to-rose-400" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          <div className="relative flex flex-col items-center justify-center h-full p-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/40 mb-2">
              <div className="text-3xl">✨</div>
            </div>
            <div className="text-white text-base font-black drop-shadow-sm">
              自分を飾る
            </div>
            <div className="text-white/90 text-[10px] font-medium mt-0.5">
              新しい姿に
            </div>
          </div>
        </button>

        <button
          onClick={() => setRoomMode(true)}
          className="group relative overflow-hidden rounded-3xl shadow-lg active:scale-[0.97] transition aspect-[1/1.1]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-fuchsia-400 to-pink-300" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
            }}
          />
          <div className="relative flex flex-col items-center justify-center h-full p-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/40 mb-2">
              <img src="/icons/home.png" alt="" className="w-9 h-9 object-contain" style={{ imageRendering: 'pixelated' }} />
            </div>
            <div className="text-white text-base font-black drop-shadow-sm">
              お部屋を飾る
            </div>
            <div className="text-white/90 text-[10px] font-medium mt-0.5">
              空間を作る
            </div>
          </div>
        </button>
      </div>

      {/* 보조 메뉴 — 2열 작은 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setEditMode(true)}
          className="bg-white rounded-2xl border-2 border-oshi-sub py-3 px-2 text-center active:scale-95 transition hover:border-oshi-main flex flex-col items-center"
        >
          <img src="/icons/note.png" alt="" className="w-6 h-6 mb-0.5 object-contain" style={{ imageRendering: 'pixelated' }} />
          <div className="text-[11px] font-bold text-oshi-dark">プロフィール</div>
        </button>
        <button
          onClick={() => setPwMode(true)}
          className="bg-white rounded-2xl border-2 border-oshi-sub py-3 px-2 text-center active:scale-95 transition hover:border-oshi-main flex flex-col items-center"
        >
          <img src="/icons/lock.png" alt="" className="w-6 h-6 mb-0.5 object-contain" style={{ imageRendering: 'pixelated' }} />
          <div className="text-[11px] font-bold text-oshi-dark">パスワード</div>
        </button>
      </div>

      <div className="mt-4 text-center text-[10px] text-oshi-dark/50">
        登録日: {new Date(liver.createdAt).toLocaleDateString('ja-JP')}
      </div>
    </div>
  );
}

// ===== 프로필 편집 폼 =====
function EditProfileForm({ liver, onCancel, onSaved }) {
  const [form, setForm] = useState({ ...liver.profile });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateLiver(liver.id, { profile: form });
      setLoading(false);
      if (updated) onSaved(updated);
    } catch (err) {
      setLoading(false);
      alert('保存に失敗しました: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onCancel} className="text-sm text-oshi-dark/60">
          ← キャンセル
        </button>
        <div className="text-sm font-black text-oshi-dark">プロフィール編集</div>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="名前">
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub text-sm"
            required
          />
        </Field>
        <Field label="自己紹介">
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub text-sm resize-none"
          />
        </Field>
        <Field label="CasLive ハンドル">
          <input
            type="text"
            value={form.casLiveHandle || ''}
            onChange={e => setForm({ ...form, casLiveHandle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub text-sm"
            placeholder="@nana_live"
          />
        </Field>
        <Field label="配信スケジュール">
          <input
            type="text"
            value={form.streamSchedule || ''}
            onChange={e => setForm({ ...form, streamSchedule: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub text-sm"
            placeholder="金 22:00〜"
          />
        </Field>
        <Field label="テーマカラー">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={form.themeColor}
              onChange={e => setForm({ ...form, themeColor: e.target.value })}
              className="w-12 h-10 rounded-lg border-2 border-oshi-sub cursor-pointer"
            />
            <input
              type="color"
              value={form.bgColor}
              onChange={e => setForm({ ...form, bgColor: e.target.value })}
              className="w-12 h-10 rounded-lg border-2 border-oshi-sub cursor-pointer"
            />
            <span className="text-[10px] text-oshi-dark/60">メイン / 背景</span>
          </div>
        </Field>

        {/* 레벨별 セリフ 편집 */}
        <DialoguesEditor
          values={form.dialogues || []}
          name={form.name}
          onChange={(dialogues) => setForm({ ...form, dialogues })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-oshi-main text-white font-black text-sm shadow mt-4 active:scale-95 disabled:opacity-50"
        >
          {loading ? '...' : '保存'}
        </button>
      </form>
    </div>
  );
}

// ===== セリフ (레벨별 대사) 편집 섹션 =====
const DIALOGUE_LEVELS = [1, 2, 3, 5, 10];

function DialoguesEditor({ values, name, onChange }) {
  // values 는 [{ unlockLevel, text }] 배열. 레벨별로 map.
  const byLevel = Object.fromEntries(
    DIALOGUE_LEVELS.map(lv => [
      lv,
      (values.find(d => d.unlockLevel === lv)?.text) || '',
    ])
  );

  const placeholders = {
    1: `よろしくね！私は${name || '…'}だよ♪`,
    2: 'えへへ、また会えたね！',
    3: 'あなたのおかげで、元気が出るよ！',
    5: 'ずっと応援してくれて、本当にありがとう。',
    10: '私の一番の推し活仲間、それはあなただよ！',
  };

  const handleChange = (lv, text) => {
    const next = DIALOGUE_LEVELS
      .map(l => ({
        unlockLevel: l,
        text: (l === lv ? text : byLevel[l]).trim(),
      }))
      .filter(d => d.text);
    onChange(next);
  };

  return (
    <div className="pt-2">
      <label className="text-xs font-black text-oshi-dark/70 mb-1 block">
        セリフ（レベル別）
      </label>
      <div className="text-[10px] text-oshi-dark/50 mb-2">
        ファンが応援してレベルアップすると解放されます。空欄はデフォルトが使われます。
      </div>
      <div className="space-y-2">
        {DIALOGUE_LEVELS.map(lv => (
          <div key={lv} className="flex items-start gap-2">
            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-oshi-main text-white shrink-0">
              Lv.{lv}
            </span>
            <input
              type="text"
              value={byLevel[lv]}
              onChange={e => handleChange(lv, e.target.value.slice(0, 80))}
              placeholder={placeholders[lv]}
              className="flex-1 px-3 py-1.5 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== 비번 변경 폼 =====
function ChangePasswordForm({ liver, onCancel, onDone }) {
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPw.length < 6) return setError('6文字以上で入力してください');
    if (newPw !== confirm) return setError('パスワードが一致しません');
    setLoading(true);
    await changeLiverPassword(liver.id, newPw);
    setLoading(false);
    alert('パスワードを変更しました');
    onDone();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onCancel} className="text-sm text-oshi-dark/60">← キャンセル</button>
        <div className="text-sm font-black text-oshi-dark">パスワード変更</div>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="新しいパスワード (6文字以上)">
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub text-sm"
            minLength={6}
            required
          />
        </Field>
        <Field label="もう一度入力">
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub text-sm"
            minLength={6}
            required
          />
        </Field>

        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-oshi-main text-white font-black text-sm shadow mt-4 active:scale-95 disabled:opacity-50"
        >
          {loading ? '...' : '変更'}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-bold text-oshi-dark/70 mb-1 block">{label}</label>
      {children}
    </div>
  );
}
