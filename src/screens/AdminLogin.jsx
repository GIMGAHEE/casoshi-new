import { useState } from 'react';
import { loginAdmin } from '../auth/session';

export default function AdminLogin({ onSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await loginAdmin(username.trim(), password);
    setLoading(false);
    if (result.ok) {
      onSuccess(result.session);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-oshi-sub p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">👑</div>
            <div className="text-xl font-black text-oshi-dark">運営ログイン</div>
            <div className="text-[11px] text-oshi-dark/60 mt-1">CasOshi 管理画面</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
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
