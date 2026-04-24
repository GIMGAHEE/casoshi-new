import { useState } from 'react';
import { registerLiver, deleteLiver } from '../auth/liverRepository';
import { useLivers } from '../hooks/useLivers';
import { useMyOshis } from '../hooks/useMyOshis';
import { deleteMyOshi } from '../data/myOshiRepository';
import { logout } from '../auth/session';

export default function AdminDashboard({ onLogout }) {
  const livers = useLivers();
  const allMyOshis = useMyOshis();
  const [mode, setMode] = useState('list'); // 'list' | 'register' | 'credentials'
  const [tab, setTab] = useState('liver'); // 'liver' | 'user'
  const [issuedCreds, setIssuedCreds] = useState(null);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleDelete = async (liver) => {
    if (!window.confirm(`「${liver.profile.name}」を削除しますか？\nこの操作は取り消せません。`)) return;
    await deleteLiver(liver.id);
    // Firestore onSnapshot 이 자동으로 리스트를 업데이트함 — refresh 불필요
  };

  const handleDeleteMyOshi = async (m) => {
    const name = m.oshi?.name || '(無名)';
    if (!window.confirm(`ユーザー「${name}」のマイ推しを削除しますか？\nこの操作は取り消せません。`)) return;
    try {
      await deleteMyOshi(m.userId);
    } catch (err) {
      alert('削除に失敗しました: ' + err.message);
    }
  };

  if (mode === 'register') {
    return (
      <RegisterLiverForm
        onCancel={() => setMode('list')}
        onRegistered={(result) => {
          setIssuedCreds(result);
          setMode('credentials');
        }}
      />
    );
  }

  if (mode === 'credentials' && issuedCreds) {
    return (
      <CredentialsDisplay
        liver={issuedCreds.liver}
        tempPassword={issuedCreds.tempPassword}
        onDone={() => {
          setIssuedCreds(null);
          setMode('list');
        }}
      />
    );
  }

  // === 리스트 뷰 ===
  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)]">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-lg font-black text-oshi-dark">👑 運営ダッシュボード</div>
          <div className="text-[11px] text-oshi-dark/60">ライバー・ユーザー管理</div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-oshi-dark/60 hover:text-oshi-dark underline"
        >
          ログアウト
        </button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-2xl border-2 border-oshi-sub p-3 text-center">
          <div className="text-[10px] text-oshi-dark/60">ライバー</div>
          <div className="text-xl font-black text-oshi-main">{livers.length}</div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-oshi-sub p-3 text-center">
          <div className="text-[10px] text-oshi-dark/60">ユーザー</div>
          <div className="text-xl font-black text-purple-500">{allMyOshis.length}</div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-oshi-sub p-3 text-center">
          <div className="text-[10px] text-oshi-dark/60">累計応援pt</div>
          <div className="text-xl font-black text-oshi-dark">
            {livers.reduce((sum, l) => sum + (l.stats?.totalSupport || 0), 0)}
          </div>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 p-1 rounded-2xl bg-white/70 border-2 border-oshi-sub shadow-inner mb-3">
        <button
          onClick={() => setTab('liver')}
          className={`flex-1 py-2 rounded-xl text-sm font-black transition ${
            tab === 'liver' ? 'bg-oshi-main text-white shadow' : 'text-oshi-dark/60'
          }`}
        >
          🎤 ライバー <span className="text-[10px] opacity-70">({livers.length})</span>
        </button>
        <button
          onClick={() => setTab('user')}
          className={`flex-1 py-2 rounded-xl text-sm font-black transition ${
            tab === 'user' ? 'bg-purple-500 text-white shadow' : 'text-oshi-dark/60'
          }`}
        >
          👥 ユーザー <span className="text-[10px] opacity-70">({allMyOshis.length})</span>
        </button>
      </div>

      {tab === 'liver' ? (
        <>
          {/* 등록 버튼 */}
          <button
            onClick={() => setMode('register')}
            className="w-full py-3 rounded-full bg-oshi-main text-white font-black text-sm shadow mb-4 active:scale-95 transition"
          >
            ＋ 新しいライバーを登録
          </button>

          {/* 라이버 리스트 */}
          {livers.length === 0 ? (
            <div className="bg-white/60 rounded-2xl border-2 border-dashed border-oshi-sub p-8 text-center">
              <div className="text-3xl mb-2">🎤</div>
              <div className="text-sm text-oshi-dark/60">
                まだ登録されたライバーがいません<br />
                上の「＋」ボタンから登録してください
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {livers.map(l => (
                <div
                  key={l.id}
                  className="bg-white rounded-2xl border-2 border-oshi-sub p-3 flex items-center gap-3"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: l.profile.bgColor || '#FFE5EC' }}
                  >
                    <div className="text-2xl">
                      {l.profile.gender === 'boy' ? '👦' : '👧'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black text-oshi-dark truncate">
                      {l.profile.name}
                    </div>
                    <div className="text-[10px] text-oshi-dark/60 truncate">
                      ID: <code className="bg-oshi-bg px-1 rounded">{l.username}</code>
                    </div>
                    {l.profile.casLiveHandle && (
                      <div className="text-[10px] text-oshi-main truncate">
                        🎥 {l.profile.casLiveHandle}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="text-[10px] text-oshi-dark/50">
                      {l.mustChangePassword && (
                        <span className="text-orange-500 font-bold">初期PW未変更</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(l)}
                      className="text-[10px] text-red-500 hover:text-red-700"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // === 유저 (MyOshi) 관리 탭 ===
        <>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 mb-3 text-[11px] text-purple-800">
            ℹ️ ユーザーが作成したマイ推しキャラクター一覧です。<br />
            不適切な名前や表示のものを削除できます。
          </div>

          {allMyOshis.length === 0 ? (
            <div className="bg-white/60 rounded-2xl border-2 border-dashed border-oshi-sub p-8 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm text-oshi-dark/60">
                まだマイ推しを作ったユーザーがいません
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {allMyOshis
                .slice()
                .sort((a, b) => (b.meta?.updatedAt?.seconds || 0) - (a.meta?.updatedAt?.seconds || 0))
                .map(m => (
                  <MyOshiRow
                    key={m.userId}
                    myOshi={m}
                    onDelete={() => handleDeleteMyOshi(m)}
                  />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ===== MyOshi 행 =====
function MyOshiRow({ myOshi, onDelete }) {
  const name = myOshi.oshi?.name || '(無名)';
  const updatedAt = myOshi.meta?.updatedAt?.toDate
    ? myOshi.meta.updatedAt.toDate()
    : null;
  const updatedStr = updatedAt
    ? `${updatedAt.getMonth() + 1}/${updatedAt.getDate()} ${String(updatedAt.getHours()).padStart(2, '0')}:${String(updatedAt.getMinutes()).padStart(2, '0')}`
    : '—';
  const shortId = myOshi.userId.length > 12
    ? myOshi.userId.slice(0, 8) + '...'
    : myOshi.userId;

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 p-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-100">
        <div className="text-2xl">💖</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-black text-oshi-dark truncate">
          {name}
        </div>
        <div className="text-[10px] text-oshi-dark/60 truncate">
          User: <code className="bg-oshi-bg px-1 rounded">{shortId}</code>
        </div>
        <div className="text-[10px] text-oshi-dark/50">
          更新: {updatedStr}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <button
          onClick={onDelete}
          className="text-[10px] text-red-500 hover:text-red-700"
        >
          削除
        </button>
      </div>
    </div>
  );
}

// ===== 등록 폼 =====
function RegisterLiverForm({ onCancel, onRegistered }) {
  const [form, setForm] = useState({
    name: '',
    bio: '',
    gender: 'girl',
    casLiveHandle: '',
    streamSchedule: '',
    themeColor: '#FF6B9D',
    bgColor: '#FFE5EC',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const result = await registerLiver({
        ...form,
        name: form.name.trim(),
      });
      onRegistered(result);
    } catch (err) {
      alert('登録に失敗しました: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onCancel} className="text-sm text-oshi-dark/60 hover:text-oshi-dark">
          ← キャンセル
        </button>
        <div className="text-sm font-black text-oshi-dark">新規ライバー登録</div>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="名前 (必須)">
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
            placeholder="例: ナナ"
            required
          />
        </Field>

        <Field label="性別">
          <div className="grid grid-cols-2 gap-2">
            {['girl', 'boy'].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setForm({ ...form, gender: g })}
                className={`py-2 rounded-xl text-sm font-bold transition ${
                  form.gender === g
                    ? g === 'girl'
                      ? 'bg-oshi-main text-white'
                      : 'bg-blue-400 text-white'
                    : 'bg-white border-2 border-oshi-sub text-oshi-dark/70'
                }`}
              >
                {g === 'girl' ? '👧 女性' : '👦 男性'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="自己紹介">
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm resize-none"
            placeholder="例: 毎週金曜22時〜配信中♪"
          />
        </Field>

        <Field label="CasLive ハンドル">
          <input
            type="text"
            value={form.casLiveHandle}
            onChange={e => setForm({ ...form, casLiveHandle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
            placeholder="@nana_live"
          />
        </Field>

        <Field label="配信スケジュール">
          <input
            type="text"
            value={form.streamSchedule}
            onChange={e => setForm({ ...form, streamSchedule: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
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

        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="w-full py-3 rounded-full bg-oshi-main text-white font-black text-sm shadow mt-4 active:scale-95 transition disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録して ID/PW を発行'}
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

// ===== 발급된 자격증명 표시 =====
function CredentialsDisplay({ liver, tempPassword, onDone }) {
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyBoth = () => {
    const text = `CasOshi ライバーログイン情報\n\nID: ${liver.username}\nパスワード: ${tempPassword}\n\n※初回ログイン時にパスワードを変更してください`;
    navigator.clipboard.writeText(text);
    setCopied('both');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-64px)]">
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">✅</div>
        <div className="text-lg font-black text-oshi-dark">登録完了！</div>
        <div className="text-xs text-oshi-dark/60 mt-1">
          下記の ID/PW を <span className="font-bold">{liver.profile.name}</span> さんにお伝えください
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-pink-50 border-2 border-oshi-main rounded-2xl p-4 mb-3">
        <div className="space-y-3">
          <CredRow label="ID" value={liver.username} copied={copied === 'id'} onCopy={() => copy(liver.username, 'id')} />
          <CredRow label="パスワード" value={tempPassword} copied={copied === 'pw'} onCopy={() => copy(tempPassword, 'pw')} mono />
        </div>

        <div className="mt-3 text-[10px] text-orange-600 bg-orange-50 rounded-lg px-2 py-1.5 border border-orange-200">
          ⚠️ このパスワードは一度しか表示されません。必ず保管してください。
        </div>
      </div>

      <button
        onClick={copyBoth}
        className="w-full py-3 rounded-xl bg-white border-2 border-oshi-main text-oshi-main font-black text-sm mb-2 active:scale-95 transition"
      >
        {copied === 'both' ? '✓ コピーしました！' : '📋 両方まとめてコピー'}
      </button>

      <button
        onClick={onDone}
        className="w-full py-3 rounded-full bg-oshi-main text-white font-black text-sm shadow active:scale-95 transition"
      >
        完了
      </button>
    </div>
  );
}

function CredRow({ label, value, copied, onCopy, mono }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-oshi-dark/60 mb-0.5">{label}</div>
      <div className="flex items-center gap-2">
        <code className={`flex-1 bg-white border border-oshi-sub rounded-lg px-3 py-2 text-sm font-bold text-oshi-dark break-all ${mono ? 'font-mono' : ''}`}>
          {value}
        </code>
        <button
          onClick={onCopy}
          className="px-3 py-2 rounded-lg bg-oshi-main text-white text-[11px] font-bold shrink-0 active:scale-95"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  );
}
