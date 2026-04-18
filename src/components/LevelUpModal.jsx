import { useEffect, useState } from 'react';
import { getDialogueForLevel } from '../data/characters';
import PixelAvatar from './PixelAvatar';

// 파티클 25개 랜덤 생성
const makeParticles = (count = 25) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,          // %
    delay: Math.random() * 0.4,       // s
    duration: 1.2 + Math.random() * 0.8,
    emoji: ['💖', '✨', '⭐', '🎉', '💫'][Math.floor(Math.random() * 5)],
    size: 16 + Math.random() * 16,
  }));

export default function LevelUpModal({ character, newLevel, onClose }) {
  const [particles] = useState(() => makeParticles());
  const [stage, setStage] = useState('burst'); // 'burst' → 'text' → 'dialogue'

  const newDialogue = getDialogueForLevel(character, newLevel);

  useEffect(() => {
    const t1 = setTimeout(() => setStage('text'), 400);
    const t2 = setTimeout(() => setStage('dialogue'), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(45,27,46,0.7), rgba(45,27,46,0.9))',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      {/* 파티클 레이어 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: '50%',
              fontSize: `${p.size}px`,
              animation: `burstOut ${p.duration}s ease-out ${p.delay}s forwards`,
              opacity: 0,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* 중앙 카드 */}
      <div
        className="relative rounded-3xl p-8 text-center max-w-sm w-full animate-pop shadow-2xl"
        style={{
          backgroundColor: character.bgColor,
          border: `3px solid ${character.themeColor}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEVEL UP 배너 */}
        {stage !== 'burst' && (
          <div
            className="text-xs font-black tracking-[0.3em] mb-2"
            style={{ color: character.themeColor }}
          >
            ✦ LEVEL UP ✦
          </div>
        )}

        {/* 캐릭터 아바타 */}
        <div
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-3 shadow-inner overflow-hidden animate-float"
          style={{ backgroundColor: character.themeColor + '55' }}
        >
          {character.sprite ? (
            <PixelAvatar sprite={character.sprite} size={96} hairColor={character.hairColor} baseHairColor={character.baseHairColor} />
          ) : character.isMyOshi ? (
            <PixelAvatar
              selections={{ parts: character.parts, colors: character.colors }}
              size={80}
            />
          ) : (
            <div className="text-6xl">{character.emoji}</div>
          )}
        </div>

        {/* 캐릭터 이름 + 새 레벨 */}
        <div className="text-xl font-black text-oshi-dark mb-1">
          {character.name}
        </div>
        <div
          className="text-5xl font-black mb-4"
          style={{ color: character.themeColor }}
        >
          Lv.{newLevel}
        </div>

        {/* 해금 대사 */}
        {stage === 'dialogue' && newDialogue && (
          <div className="bg-white/80 rounded-2xl p-4 mb-4 animate-pop">
            <div className="text-[10px] font-bold text-oshi-main mb-1">
              🔓 新しいセリフが解放！
            </div>
            <div className="text-sm text-oshi-dark leading-relaxed">
              「{newDialogue.text}」
            </div>
          </div>
        )}
        {stage === 'dialogue' && !newDialogue && (
          <div className="text-xs text-oshi-dark/60 mb-4">
            応援ありがとう！これからもよろしくね♪
          </div>
        )}

        <button
          onClick={onClose}
          className="btn-primary w-full"
          style={{ backgroundColor: character.themeColor }}
        >
          すごい！
        </button>
      </div>

      <style>{`
        @keyframes burstOut {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          15%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-200px) scale(1.3) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
