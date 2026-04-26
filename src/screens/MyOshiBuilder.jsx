import { useState } from 'react';
import {
  MY_OSHI_PRESETS, DEFAULT_PRESET_ID,
  HAIRSTYLES, DEFAULT_HAIRSTYLE_ID, DEFAULT_HAIRSTYLE_BY_GENDER,
  DEFAULT_HAIR_OFFSET, computeHairTransform,
} from '../data/characters';
import PixelAvatar from '../components/PixelAvatar';

export default function MyOshiBuilder({ initialOshi, onSave, onCancel }) {
  // 저장된 preset에서 gender 역추적
  const initialPreset = MY_OSHI_PRESETS.find(p => p.id === initialOshi?.presetId);
  const [gender, setGender] = useState(initialPreset?.gender || 'girl');

  const [presetId, setPresetId] = useState(
    initialOshi?.presetId || DEFAULT_PRESET_ID
  );
  const [hairstyleId, setHairstyleId] = useState(
    initialOshi?.hairstyleId || DEFAULT_HAIRSTYLE_ID
  );
  const [hairOffset, setHairOffset] = useState(
    initialOshi?.hairOffset || DEFAULT_HAIR_OFFSET
  );
  const [name, setName] = useState(initialOshi?.name || '');

  // gender가 바뀌면 해당 성별의 첫 프리셋/헤어로 자동 전환
  const handleGenderChange = (newGender) => {
    if (newGender === gender) return;
    setGender(newGender);
    const firstPreset = MY_OSHI_PRESETS.find(p => p.gender === newGender);
    if (firstPreset) setPresetId(firstPreset.id);
    const firstHair = DEFAULT_HAIRSTYLE_BY_GENDER[newGender];
    if (firstHair) setHairstyleId(firstHair);
    setHairOffset(DEFAULT_HAIR_OFFSET);
  };

  const filteredPresets = MY_OSHI_PRESETS.filter(p => p.gender === gender);
  const filteredHairstyles = HAIRSTYLES.filter(h => h.gender === gender);

  const preset =
    MY_OSHI_PRESETS.find(p => p.id === presetId) || MY_OSHI_PRESETS[0];
  const hairstyle =
    HAIRSTYLES.find(h => h.id === hairstyleId) || HAIRSTYLES[0];
  const hasHair = !preset.hairBaked && !!hairstyle.overlay;

  // 프리뷰에 쓸 실제 transform = 기본값 + 오프셋
  const effectiveTransform = computeHairTransform(hairstyleId, hairOffset);

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
      hairOffset,
    });
  };

  const updateOffset = (key, value) => {
    setHairOffset(o => ({ ...o, [key]: value }));
  };

  const resetOffset = () => setHairOffset(DEFAULT_HAIR_OFFSET);

  // 헤어 바꾸면 오프셋 0으로 초기화 → 새 헤어의 defaultTransform이 그대로 보임
  const pickHair = (id) => {
    setHairstyleId(id);
    setHairOffset(DEFAULT_HAIR_OFFSET);
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

      {/* 성별 탭 */}
      <div className="px-4 mb-3">
        <div className="grid grid-cols-2 bg-white rounded-full p-1 border border-oshi-sub">
          <button
            onClick={() => handleGenderChange('girl')}
            className={`py-2 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              gender === 'girl'
                ? 'bg-oshi-main text-white shadow'
                : 'text-oshi-dark/60'
            }`}
          >
            <img src="/icons/girl.png" alt="" className="w-11 h-8 object-contain" style={{ imageRendering: 'pixelated' }} />
            女の子
          </button>
          <button
            onClick={() => handleGenderChange('boy')}
            className={`py-2 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              gender === 'boy'
                ? 'text-white shadow'
                : 'text-oshi-dark/60'
            }`}
            style={gender === 'boy' ? { backgroundColor: '#5BA4E0' } : {}}
          >
            <img src="/icons/boy.png" alt="" className="w-8 h-8" style={{ imageRendering: 'pixelated' }} />
            男の子
          </button>
        </div>
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
            size={Math.round(180 * (preset.previewScale ?? 1))}
            hairOverlay={hasHair ? hairstyle.overlay : null}
            hairTransform={hasHair ? effectiveTransform : null}
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
              onClick={resetOffset}
              className="text-[10px] text-oshi-main font-bold underline active:scale-95"
            >
              リセット
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-oshi-sub p-3 grid grid-cols-3 gap-3">
            <SliderRow
              label="よこ"
              value={hairOffset.x || 0}
              min={-30} max={30} step={1}
              suffix="%"
              onChange={(v) => updateOffset('x', v)}
            />
            <SliderRow
              label="たて"
              value={hairOffset.y}
              min={-30} max={30} step={1}
              suffix="%"
              onChange={(v) => updateOffset('y', v)}
            />
            <SliderRow
              label="サイズ"
              value={hairOffset.scale}
              min={-30} max={30} step={1}
              suffix="%"
              onChange={(v) => updateOffset('scale', v)}
            />
          </div>
        </div>
      )}

      {/* 프리셋 선택 그리드 — 2개 이상일 때만 표시 */}
      {filteredPresets.length > 1 && (
        <div className="px-4 mt-5">
          <div className="text-xs font-bold text-oshi-dark/60 mb-2">
            キャラクターを選ぶ
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {filteredPresets.map(p => {
              const active = p.id === presetId;
              return (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-xl p-1 border transition active:scale-95 ${
                    active
                      ? 'border-oshi-main shadow scale-[1.03]'
                      : 'border-oshi-sub bg-white'
                  }`}
                  style={{ backgroundColor: active ? p.bgColor : '#fff' }}
                >
                  <div className="flex items-center justify-center h-12 overflow-hidden">
                    <PixelAvatar sprite={p.sprite} size={Math.round(40 * (p.previewScale ?? 1))} />
                  </div>
                  <div
                    className="text-[9px] text-center font-bold mt-0.5 truncate leading-tight"
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

      {/* 헤어스타일 선택 — hairBaked 프리셋에서는 숨김 */}
      {!preset.hairBaked && (
        <div className="px-4 mt-5">
          <div className="text-xs font-bold text-oshi-dark/60 mb-2">
            ヘアスタイル
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {filteredHairstyles.map(h => {
              const active = h.id === hairstyleId;
              return (
                <button
                  key={h.id}
                  onClick={() => pickHair(h.id)}
                  className={`rounded-xl p-1 border transition active:scale-95 ${
                    active
                      ? 'border-oshi-main shadow scale-[1.03] bg-oshi-bg'
                      : 'border-oshi-sub bg-white'
                  }`}
                >
                  <div className="flex items-start justify-center h-12 overflow-hidden">
                    <img
                      src={h.overlay}
                      alt=""
                      style={{
                        width: 44,
                        height: 'auto',
                        imageRendering: 'pixelated',
                        marginTop: -4,
                      }}
                      draggable={false}
                    />
                  </div>
                  <div
                    className="text-[9px] text-center font-bold mt-0.5 truncate leading-tight"
                    style={{ color: active ? '#FF4785' : '#666' }}
                  >
                    {h.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            <img
              src="/icons/heart.png"
              alt=""
              className="w-5 h-5 inline-block mr-1 align-middle"
              style={{ imageRendering: 'pixelated' }}
            />
            保存する
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
