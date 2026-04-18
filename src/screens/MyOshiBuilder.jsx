import { useState } from 'react';
import {
  MY_OSHI_PRESETS, DEFAULT_PRESET_ID,
  HAIRSTYLES, DEFAULT_HAIRSTYLE_ID,
} from '../data/characters';
import PixelAvatar from '../components/PixelAvatar';

const DEFAULT_TRANSFORM = { x: 0, y: 0, scale: 1 };

export default function MyOshiBuilder({ initialOshi, onSave, onCancel }) {
  const [presetId, setPresetId] = useState(
    initialOshi?.presetId || DEFAULT_PRESET_ID
  );
  const [hairstyleId, setHairstyleId] = useState(
    initialOshi?.hairstyleId || DEFAULT_HAIRSTYLE_ID
  );
  const [hairTransform, setHairTransform] = useState(
    initialOshi?.hairTransform || DEFAULT_TRANSFORM
  );
  const [name, setName] = useState(initialOshi?.name || '');

  const preset =
    MY_OSHI_PRESETS.find(p => p.id === presetId) || MY_OSHI_PRESETS[0];
  const hairstyle =
    HAIRSTYLES.find(h => h.id === hairstyleId) || HAIRSTYLES[0];
  const hasHair = !!hairstyle.overlay;

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('名前を入力してね！');
      return;
    }
    onSave({
      name: trimmed,
      presetId,
      hairstyleId,
      hairTransform: hasHair ? hairTransform : DEFAULT_TRANSFORM,
    });
  };

  const updateTransform = (key, value) => {
    setHairTransform(t => ({ ...t, [key]: value }));
  };

  const resetTransform = () => setHairTransform(DEFAULT_TRANSFORM);

  // 헤어 바꾸면 위치 초기화 (이전 조정값이 다른 헤어에 맞지 않음)
  const pickHair = (id) => {
    setHairstyleId(id);
    setHairTransform(DEFAULT_TRANSFORM);
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
            sprite={hasHair ? preset.bareSprite : preset.sprite}
            size={180}
            hairOverlay={hairstyle.overlay}
            hairTransform={hasHair ? hairTransform : null}
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

      {/* 헤어 위치/크기 미세조정 — 프리뷰 바로 아래 (헤어 선택 시에만) */}
      {hasHair && (
        <div className="px-4 mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-oshi-dark/60">ヘアの微調整</div>
            <button
              onClick={resetTransform}
              className="text-[10px] text-oshi-main font-bold underline active:scale-95"
            >
              リセット
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-oshi-sub p-3 space-y-2.5">
            <SliderRow
              label="よこ"
              value={hairTransform.x}
              min={-30} max={30} step={1}
              suffix="%"
              onChange={(v) => updateTransform('x', v)}
            />
            <SliderRow
              label="たて"
              value={hairTransform.y}
              min={-30} max={30} step={1}
              suffix="%"
              onChange={(v) => updateTransform('y', v)}
            />
            <SliderRow
              label="サイズ"
              value={Math.round(hairTransform.scale * 100)}
              min={50} max={150} step={1}
              suffix="%"
              onChange={(v) => updateTransform('scale', v / 100)}
            />
          </div>
        </div>
      )}

      {/* 프리셋 선택 그리드 — 2개 이상일 때만 표시 */}
      {MY_OSHI_PRESETS.length > 1 && (
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
                  style={{ backgroundColor: active ? p.bgColor : '#fff' }}
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
      )}

      {/* 헤어스타일 선택 */}
      <div className="px-4 mt-5">
        <div className="text-xs font-bold text-oshi-dark/60 mb-2">
          ヘアスタイル
        </div>
        <div className="grid grid-cols-3 gap-2">
          {HAIRSTYLES.map(h => {
            const active = h.id === hairstyleId;
            return (
              <button
                key={h.id}
                onClick={() => pickHair(h.id)}
                className={`rounded-2xl p-2 border-2 transition active:scale-95 ${
                  active
                    ? 'border-oshi-main shadow-md scale-[1.02] bg-oshi-bg'
                    : 'border-oshi-sub bg-white'
                }`}
              >
                <div className="flex items-center justify-center h-24 overflow-hidden">
                  <PixelAvatar
                    sprite={h.overlay ? preset.bareSprite : preset.sprite}
                    size={80}
                    hairOverlay={h.overlay}
                  />
                </div>
                <div
                  className="text-[10px] text-center font-bold mt-1 truncate"
                  style={{ color: active ? '#FF4785' : '#666' }}
                >
                  {h.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="px-4 mt-4 text-center">
        <div className="text-[11px] text-oshi-dark/50 leading-relaxed">
          名前と見た目を決めて、保存してね！<br />
          他のパーツも今後追加予定 🔜
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

function SliderRow({ label, value, min, max, step, suffix = '', onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-bold text-oshi-dark/70">{label}</span>
        <span className="text-[11px] text-oshi-dark/50 tabular-nums">
          {value > 0 ? '+' : ''}{value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-oshi-bg appearance-none cursor-pointer accent-oshi-main"
      />
    </div>
  );
}
