import { useState } from 'react';
import { MY_OSHI_PRESETS, DEFAULT_PRESET_ID, HAIR_COLOR_OPTIONS } from '../data/characters';
import PixelAvatar from '../components/PixelAvatar';

export default function MyOshiBuilder({ initialOshi, onSave, onCancel }) {
  const [presetId, setPresetId] = useState(
    initialOshi?.presetId || DEFAULT_PRESET_ID
  );
  const [name, setName] = useState(initialOshi?.name || '');
  const [hairColor, setHairColor] = useState(initialOshi?.hairColor || null);

  const preset =
    MY_OSHI_PRESETS.find(p => p.id === presetId) || MY_OSHI_PRESETS[0];

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('名前を入力してね！');
      return;
    }
    onSave({
      name: trimmed,
      presetId,
      hairColor,
    });
  };

  return (
    <div className="max-w-md mx-auto pb-32">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onCancel} className="text-sm text-oshi-dark/70">
          ← キャンセル
        </button>
        <div className="text-sm font-bold text-oshi-dark">
          {initialOshi ? '推しを編集' : 'マイ推しを作る'}
        </div>
        <div className="w-16" />
      </div>

      {/* 프리뷰 */}
      <div className="px-4">
        <div
          className="rounded-3xl py-6 flex flex-col items-center shadow-md border-2 border-oshi-sub"
          style={{
            background: `linear-gradient(135deg, ${preset.themeColor}33, ${preset.bgColor})`,
          }}
        >
          <PixelAvatar
            sprite={preset.sprite}
            size={180}
            hairColor={hairColor}
            baseHairColor={preset.baseHairColor}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="推しの名前を入力..."
            maxLength={10}
            className="mt-3 bg-white/90 border border-oshi-sub rounded-full px-4 py-2 text-center text-sm font-bold text-oshi-dark w-56 focus:outline-none focus:ring-2 focus:ring-oshi-main"
          />
        </div>
      </div>

      {/* 프리셋 선택 그리드 */}
      <div className="px-4 mt-5">
        <div className="text-xs font-bold text-oshi-dark/60 mb-2">
          キャラクターを選ぶ
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MY_OSHI_PRESETS.map(p => {
            const active = p.id === presetId;
            return (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                className={`rounded-2xl p-2 border-2 transition active:scale-95 ${
                  active
                    ? 'border-oshi-main shadow-md scale-[1.02]'
                    : 'border-oshi-sub bg-white'
                }`}
                style={{
                  backgroundColor: active ? p.bgColor : '#fff',
                }}
              >
                <div className="flex items-center justify-center h-24 overflow-hidden">
                  <PixelAvatar sprite={p.sprite} size={80} />
                </div>
                <div
                  className="text-[10px] text-center font-bold mt-1 truncate"
                  style={{ color: active ? p.themeColor : '#666' }}
                >
                  {p.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 머리색 선택 버튼 */}
      <div className="px-4 mt-5">
        <div className="text-xs font-bold text-oshi-dark/60 mb-2">
          髪の色
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {HAIR_COLOR_OPTIONS.map(opt => {
            const active = (opt.hex || null) === hairColor;
            return (
              <button
                key={opt.id}
                onClick={() => setHairColor(opt.hex)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 rounded-2xl p-2 border-2 transition active:scale-95 ${
                  active
                    ? 'border-oshi-main shadow-md'
                    : 'border-oshi-sub bg-white'
                }`}
                style={{ minWidth: 64 }}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow-inner"
                  style={{
                    background: opt.hex
                      ? opt.previewBg
                      : 'repeating-linear-gradient(45deg, #e5e7eb 0 4px, #f9fafb 4px 8px)',
                  }}
                />
                <div className="text-[10px] font-bold text-oshi-dark/70 truncate max-w-[60px]">
                  {opt.label}
                </div>
              </button>
            );
          })}
        </div>
        <div className="text-[10px] text-oshi-dark/40 mt-2 text-center leading-relaxed">
          ※ 黒髪キャラは輪郭も少し色が変わります
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-oshi-bg via-oshi-bg to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-full font-black text-lg bg-oshi-main text-white shadow-xl active:scale-95 hover:bg-pink-500 transition"
          >
            💖 保存する
          </button>
        </div>
      </div>
    </div>
  );
}
