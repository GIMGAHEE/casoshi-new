import { useState } from 'react';
import {
  HAIR_PARTS, EYE_PARTS, MOUTH_PARTS, OUTFIT_PARTS, ACCESSORY_PARTS,
  SKIN_COLORS, HAIR_COLORS, OUTFIT_COLORS, ACCENT_COLORS,
  DEFAULT_SELECTIONS,
} from '../data/avatarParts';
import AvatarSVG from '../components/AvatarSVG';

const TABS = [
  { id: 'hair', label: 'ヘア', emoji: '💇‍♀️' },
  { id: 'face', label: 'かお', emoji: '😊' },
  { id: 'outfit', label: 'ふく', emoji: '👗' },
  { id: 'accessory', label: 'アクセ', emoji: '🎀' },
  { id: 'skin', label: 'はだ', emoji: '🎨' },
];

export default function MyOshiBuilder({ initialOshi, onSave, onCancel }) {
  const [selections, setSelections] = useState(
    initialOshi
      ? { parts: initialOshi.parts, colors: initialOshi.colors }
      : DEFAULT_SELECTIONS
  );
  const [name, setName] = useState(initialOshi?.name || '');
  const [activeTab, setActiveTab] = useState('hair');

  const updatePart = (slot, id) => {
    setSelections(s => ({ ...s, parts: { ...s.parts, [slot]: id } }));
  };
  const updateColor = (slot, hex) => {
    setSelections(s => ({ ...s, colors: { ...s.colors, [slot]: hex } }));
  };

  const randomize = () => {
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    setSelections({
      parts: {
        hair: rand(HAIR_PARTS).id,
        eyes: rand(EYE_PARTS).id,
        mouth: rand(MOUTH_PARTS).id,
        outfit: rand(OUTFIT_PARTS).id,
        accessory: rand(ACCESSORY_PARTS).id,
      },
      colors: {
        skin: rand(SKIN_COLORS).hex,
        hair: rand(HAIR_COLORS).hex,
        outfit: rand(OUTFIT_COLORS).hex,
        accent: rand(ACCENT_COLORS).hex,
      },
    });
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('名前を入力してね！');
      return;
    }
    onSave({
      name: trimmed,
      parts: selections.parts,
      colors: selections.colors,
    });
  };

  return (
    <div className="max-w-md mx-auto pb-32">
      {/* 상단바 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onCancel} className="text-sm text-oshi-dark/70">
          ← キャンセル
        </button>
        <div className="text-sm font-bold text-oshi-dark">
          {initialOshi ? '推しを編集' : 'マイ推しを作る'}
        </div>
        <button
          onClick={randomize}
          className="text-xs bg-white border border-oshi-sub rounded-full px-3 py-1 text-oshi-dark active:scale-95 transition-transform"
        >
          🎲 ランダム
        </button>
      </div>

      {/* 프리뷰 */}
      <div className="px-4">
        <div
          className="rounded-3xl py-6 flex flex-col items-center shadow-md border-2 border-oshi-sub"
          style={{ background: `linear-gradient(135deg, ${selections.colors.skin}30, ${selections.colors.hair}20)` }}
        >
          <AvatarSVG selections={selections} size={180} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="推しの名前を入力..."
            maxLength={10}
            className="mt-3 bg-white/80 border border-oshi-sub rounded-full px-4 py-2 text-center text-sm font-bold text-oshi-dark w-56 focus:outline-none focus:ring-2 focus:ring-oshi-main"
          />
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 px-4 mt-4 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-bold transition ${
              activeTab === t.id
                ? 'bg-oshi-main text-white shadow-md'
                : 'bg-white text-oshi-dark/70 border border-oshi-sub'
            }`}
          >
            <span className="mr-1">{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="px-4 mt-3 space-y-4">
        {activeTab === 'hair' && (
          <>
            <PartGrid
              label="ヘアスタイル"
              parts={HAIR_PARTS}
              activeId={selections.parts.hair}
              onPick={(id) => updatePart('hair', id)}
              selections={selections}
              previewSlot="hair"
            />
            <ColorRow
              label="ヘアカラー"
              colors={HAIR_COLORS}
              activeHex={selections.colors.hair}
              onPick={(hex) => updateColor('hair', hex)}
            />
          </>
        )}

        {activeTab === 'face' && (
          <>
            <PartGrid
              label="目"
              parts={EYE_PARTS}
              activeId={selections.parts.eyes}
              onPick={(id) => updatePart('eyes', id)}
              selections={selections}
              previewSlot="eyes"
            />
            <PartGrid
              label="口"
              parts={MOUTH_PARTS}
              activeId={selections.parts.mouth}
              onPick={(id) => updatePart('mouth', id)}
              selections={selections}
              previewSlot="mouth"
            />
          </>
        )}

        {activeTab === 'outfit' && (
          <>
            <PartGrid
              label="衣装"
              parts={OUTFIT_PARTS}
              activeId={selections.parts.outfit}
              onPick={(id) => updatePart('outfit', id)}
              selections={selections}
              previewSlot="outfit"
            />
            <ColorRow
              label="衣装カラー"
              colors={OUTFIT_COLORS}
              activeHex={selections.colors.outfit}
              onPick={(hex) => updateColor('outfit', hex)}
            />
          </>
        )}

        {activeTab === 'accessory' && (
          <>
            <PartGrid
              label="アクセサリー"
              parts={ACCESSORY_PARTS}
              activeId={selections.parts.accessory}
              onPick={(id) => updatePart('accessory', id)}
              selections={selections}
              previewSlot="accessory"
            />
            <ColorRow
              label="アクセントカラー"
              colors={ACCENT_COLORS}
              activeHex={selections.colors.accent}
              onPick={(hex) => updateColor('accent', hex)}
            />
          </>
        )}

        {activeTab === 'skin' && (
          <ColorRow
            label="肌の色"
            colors={SKIN_COLORS}
            activeHex={selections.colors.skin}
            onPick={(hex) => updateColor('skin', hex)}
          />
        )}
      </div>

      {/* 저장 버튼 고정 */}
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

// =====================================================
// 서브 컴포넌트
// =====================================================

function PartGrid({ label, parts, activeId, onPick, selections, previewSlot }) {
  return (
    <div>
      <div className="text-xs font-bold text-oshi-dark/60 mb-2">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {parts.map(p => {
          const active = p.id === activeId;
          // 이 파츠만 바꾼 프리뷰를 미니로 렌더
          const previewSelections = {
            ...selections,
            parts: { ...selections.parts, [previewSlot]: p.id },
          };
          return (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className={`rounded-2xl p-1 border-2 transition ${
                active
                  ? 'border-oshi-main bg-oshi-bg shadow-md'
                  : 'border-oshi-sub bg-white'
              }`}
            >
              <div className="flex items-center justify-center h-16 overflow-hidden">
                <div style={{ transform: 'scale(0.55)', transformOrigin: 'center' }}>
                  <AvatarSVG selections={previewSelections} size={100} />
                </div>
              </div>
              <div className="text-[10px] text-center text-oshi-dark/70 mt-1 truncate">
                {p.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorRow({ label, colors, activeHex, onPick }) {
  return (
    <div>
      <div className="text-xs font-bold text-oshi-dark/60 mb-2">{label}</div>
      <div className="flex gap-2 flex-wrap">
        {colors.map(c => {
          const active = c.hex.toLowerCase() === activeHex.toLowerCase();
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.hex)}
              className={`w-10 h-10 rounded-full border-2 transition ${
                active ? 'border-oshi-main scale-110 shadow-md' : 'border-white'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
              aria-label={c.label}
            />
          );
        })}
      </div>
    </div>
  );
}
