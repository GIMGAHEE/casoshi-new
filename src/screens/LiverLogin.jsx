import { useState } from 'react';
import { loginLiver } from '../auth/session';
import { changeLiverPassword } from '../auth/liverRepository';

export default function LiverLogin({ onSuccess, onCancel }) {
  const [step, setStep] = useState('login'); // 'login' | 'changePassword'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [liver, setLiver] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await loginLiver(username.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.liver.mustChangePassword) {
      // 비번 변경 강제 단계로
      setLiver(result.liver);
      setStep('changePassword');
      return;
    }
    onSuccess(result.session, result.liver);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('パスワードが一致しません');
      return;
    }
    setLoading(true);
    await changeLiverPassword(liver.id, newPassword);
    setLoading(false);
    // 다시 로그인 (새 비번 세션 반영용)
    const result = await loginLiver(liver.username, newPassword);
    if (result.ok) {
      onSuccess(result.session, result.liver);
    } else {
      setError('再ログインに失敗しました');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-oshi-sub p-6">
          <div className="text-center mb-4">
            <img src="/icons/mic.png" alt="" className="w-12 h-12 object-contain mx-auto mb-2" style={{ imageRendering: 'pixelated' }} />
            <div className="text-xl font-black text-oshi-dark">
              {step === 'login' ? 'ライバーログイン' : '初期パスワード変更'}
            </div>
            <div className="text-[11px] text-oshi-dark/60 mt-1">
              {step === 'login'
                ? '運営から発行された ID/PW を入力'
                : 'セキュリティのため、初回は新しいパスワードを設定してください'}
            </div>
          </div>

          {step === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-oshi-dark/70 mb-1 block">ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
                  autoComplete="username"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-oshi-dark/70 mb-1 block">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full bg-oshi-main text-white font-black text-sm shadow active:scale-95 transition disabled:opacity-50"
              >
                {loading ? '...' : 'ログイン'}
              </button>
            </form>
          )}

          {step === 'changePassword' && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 text-[11px] text-yellow-800">
                ようこそ <span className="font-bold">{liver?.profile?.name}</span> さん！<br />
                安全のため、最初にパスワードを変更してください
              </div>
              <div>
                <label className="text-xs font-bold text-oshi-dark/70 mb-1 block">新しいパスワード (6文字以上)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-oshi-dark/70 mb-1 block">もう一度入力</label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-full bg-oshi-main text-white font-black text-sm shadow active:scale-95 transition disabled:opacity-50"
              >
                {loading ? '...' : '変更して続ける'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-oshi-dark/50 underline"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
