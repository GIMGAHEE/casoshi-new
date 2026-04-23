import { useState, useRef, useEffect } from 'react';
import { FURNITURE_CATALOG, findFurniture, createRoomItem } from '../data/furniture';
import IsometricRoom from '../components/IsometricRoom';
import PixelAvatar from '../components/PixelAvatar';

const CHAR_ID = '__character__';
const DEFAULT_CHAR_POS = { x: 50, y: 80 }; // 바닥 중앙, 발 기준

/**
 * 방 꾸미기 편집기
 * - 가구 드래그로 위치 이동
 * - 선택된 가구에 대해 크기 / 회전 조정
 * - 가구 추가 / 삭제
 * - 저장 시 room state callback
 */
export default function RoomEditor({
  character, initialRoom, onSave, onCancel,
}) {
  const [items, setItems] = useState(initialRoom?.items || []);
  const [characterPos, setCharacterPos] = useState(
    initialRoom?.characterPos || DEFAULT_CHAR_POS
  );
  const [selectedId, setSelectedId] = useState(null);
  const [showCatalog, setShowCatalog] = useState(false);

  const roomRef = useRef(null);
  const dragStateRef = useRef(null);

  const selectedItem = selectedId && selectedId !== CHAR_ID
    ? items.find(i => i.id === selectedId)
    : null;
  const isCharSelected = selectedId === CHAR_ID;

  const updateItem = (id, patch) => {
    setItems(items => items.map(i => i.id === id ? { ...i, ...patch } : i));
  };

  // 드래그 대상(가구 or 캐릭터)의 현재 position 읽기/쓰기 공통 헬퍼
  const getPos = (id) => {
    if (id === CHAR_ID) return { x: characterPos.x, y: characterPos.y };
    const it = items.find(i => i.id === id);
    return it ? { x: it.x, y: it.y } : null;
  };
  const setPos = (id, patch) => {
    if (id === CHAR_ID) setCharacterPos(p => ({ ...p, ...patch }));
    else updateItem(id, patch);
  };

  const addFurniture = (furnitureId) => {
    const newItem = createRoomItem(furnitureId);
    setItems(items => [...items, newItem]);
    setSelectedId(newItem.id);
    setShowCatalog(false);
  };

  const deleteItem = (id) => {
    setItems(items => items.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // ===== 드래그 처리 (가구 & 캐릭터 공통) =====
  const handlePointerDown = (e, itemId) => {
    e.stopPropagation();
    setSelectedId(itemId);
    const pos = getPos(itemId);
    if (!pos) return;
    const rect = roomRef.current.getBoundingClientRect();
    dragStateRef.current = {
      itemId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      itemStartX: pos.x,
      itemStartY: pos.y,
      roomW: rect.width,
      roomH: rect.height,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const d = dragStateRef.current;
    if (!d) return;
    const dxPx = e.clientX - d.startClientX;
    const dyPx = e.clientY - d.startClientY;
    const dxPercent = (dxPx / d.roomW) * 100;
    const dyPercent = (dyPx / d.roomH) * 100;
    const newX = Math.max(0, Math.min(100, d.itemStartX + dxPercent));
    const newY = Math.max(0, Math.min(100, d.itemStartY + dyPercent));
    setPos(d.itemId, { x: newX, y: newY });
  };

  const handlePointerUp = () => {
    dragStateRef.current = null;
  };

  // 빈 방 영역 클릭 시 선택 해제
  const handleRoomClick = () => {
    setSelectedId(null);
  };

  const handleSave = () => {
    onSave({ items, characterPos });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-3 pb-32">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={onCancel} className="text-sm text-oshi-dark/70">
          ← キャンセル
        </button>
        <div className="text-sm font-bold text-oshi-dark">
          おへやカスタマイズ
        </div>
        <button
          onClick={handleSave}
          className="text-sm font-bold text-oshi-main hover:underline"
        >
          保存
        </button>
      </div>

      {/* 방 뷰 */}
      <div
        ref={roomRef}
        className="relative rounded-2xl overflow-hidden shadow-md border-2 border-oshi-sub select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleRoomClick}
      >
        <IsometricRoom character={character}>
          {/* 배치된 가구들 */}
          {items.map(item => {
            const f = findFurniture(item.furnitureId);
            if (!f) return null;
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  width: `${f.defaultWidthPercent * (item.scale ?? item.scaleX ?? 1)}%`,
                  aspectRatio: f.aspectRatio,
                  transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                  transformOrigin: 'center center',
                  cursor: 'grab',
                  touchAction: 'none',
                  outline: isSelected ? '2px dashed #FF6B9D' : 'none',
                  outlineOffset: '4px',
                  borderRadius: '4px',
                }}
              >
                <img
                  src={f.image}
                  alt={f.label}
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            );
          })}

          {/* 캐릭터 (드래그 가능 / 발 기준 anchor)
             wrapper = img 정확한 렌더 크기. outline은 img 박스에 딱 맞음. */}
          <div
            onPointerDown={(e) => handlePointerDown(e, CHAR_ID)}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: `${characterPos.x}%`,
              top: `${characterPos.y}%`,
              transform: 'translate(-50%, -100%)',
              cursor: 'grab',
              touchAction: 'none',
              outline: isCharSelected ? '2px dashed #FF6B9D' : 'none',
              outlineOffset: '-2px',
              borderRadius: '4px',
              lineHeight: 0,
              fontSize: 0,
              width: 90,
              height: 104, // 발바닥 아래 투명 영역(15px) 자르기
              overflow: 'hidden',
            }}
          >
            {character?.sprite ? (
              <PixelAvatar
                sprite={character.sprite}
                size={90}
                hairOverlay={character.hairOverlay}
                hairTransform={character.hairTransform}
              />
            ) : character?.isMyOshi ? (
              <PixelAvatar
                selections={{ parts: character.parts, colors: character.colors }}
                size={90}
              />
            ) : (
              <div style={{ fontSize: 72 }}>{character?.emoji}</div>
            )}
          </div>

          {/* 상단: 가구 추가 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowCatalog(s => !s); }}
            className="absolute top-2 right-2 bg-oshi-main text-white rounded-full px-3 py-1.5 text-xs font-bold shadow-lg active:scale-95"
          >
            + 家具
          </button>
        </IsometricRoom>
      </div>

      {/* 가구 카탈로그 (열림 상태) */}
      {showCatalog && (
        <div className="mt-3 bg-white rounded-2xl border-2 border-oshi-sub p-3">
          <div className="text-xs font-bold text-oshi-dark/60 mb-2">
            家具をえらぶ
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FURNITURE_CATALOG.map(f => (
              <button
                key={f.id}
                onClick={() => addFurniture(f.id)}
                className="rounded-xl border-2 border-oshi-sub bg-oshi-bg/40 p-2 hover:bg-oshi-bg active:scale-95 transition"
              >
                <div className="h-20 flex items-center justify-center">
                  <img
                    src={f.image}
                    alt=""
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      imageRendering: 'pixelated',
                    }}
                  />
                </div>
                <div className="text-[10px] text-center font-bold text-oshi-dark/80 mt-1">
                  {f.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 선택된 가구 조작 패널 */}
      {selectedItem && (
        <div className="mt-3 bg-white rounded-2xl border-2 border-oshi-main p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-oshi-main">
              {findFurniture(selectedItem.furnitureId)?.label} を編集
            </div>
            <button
              onClick={() => deleteItem(selectedItem.id)}
              className="text-[10px] text-red-500 font-bold active:scale-95"
            >
              🗑 削除
            </button>
          </div>

          <EditSlider
            label="サイズ"
            value={Math.round((selectedItem.scale ?? selectedItem.scaleX ?? 1) * 100)}
            min={30} max={250} step={1} suffix="%"
            onChange={(v) => updateItem(selectedItem.id, { scale: v / 100 })}
          />
          <EditSlider
            label="かいてん"
            value={selectedItem.rotation}
            min={-180} max={180} step={1} suffix="°"
            onChange={(v) => updateItem(selectedItem.id, { rotation: v })}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => updateItem(selectedItem.id, { scale: 1, rotation: 0 })}
              className="text-[10px] text-oshi-dark/60 font-bold underline active:scale-95"
            >
              リセット
            </button>
            <div className="text-[10px] text-oshi-dark/40">
              ドラッグで位置変更
            </div>
          </div>
        </div>
      )}

      {/* 캐릭터 선택 시: 위치 리셋 */}
      {isCharSelected && (
        <div className="mt-3 bg-white rounded-2xl border-2 border-oshi-main p-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-oshi-main">
              {character?.name || 'キャラクター'} を移動
            </div>
            <button
              onClick={() => setCharacterPos(DEFAULT_CHAR_POS)}
              className="text-[10px] text-oshi-dark/60 font-bold underline active:scale-95"
            >
              位置リセット
            </button>
          </div>
          <div className="text-[10px] text-oshi-dark/40 mt-2 text-center">
            ドラッグで位置変更
          </div>
        </div>
      )}

      {!selectedItem && !isCharSelected && items.length > 0 && (
        <div className="mt-3 text-center text-[11px] text-oshi-dark/50">
          家具やキャラをタップして編集 / ドラッグで移動
        </div>
      )}

      {items.length === 0 && !isCharSelected && (
        <div className="mt-3 text-center text-[11px] text-oshi-dark/50">
          右上の「+ 家具」から家具を追加 🛋️ / キャラをドラッグして移動
        </div>
      )}
    </div>
  );
}

function EditSlider({ label, value, min, max, step, suffix = '', onChange }) {
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
