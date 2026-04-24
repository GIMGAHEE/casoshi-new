import { useState } from 'react';

// MyOshi / Liver 공통 프로필 편집 화면.
// 편집 대상:
//   - bio: 자기소개 (textarea)
//   - dialogues: Lv.1 / 2 / 3 / 5 / 10 에 해당하는 대사 (5개)
//
// props:
//   title:           화면 상단 타이틀 (예: 'momoのプロフィール')
//   initialBio:      현재 bio 값 (빈 문자열이면 default placeholder 보여줌)
//   initialDialogues: [{ unlockLevel, text }] 배열 또는 null
//   bioPlaceholder:  default bio 문구 (참고용)
//   dialoguePlaceholders: { 1: '...', 2: '...', ... } default 대사 참고용
//   onSave(result):  result = { bio, dialogues: [...] }
//                    빈 값은 빈 문자열로 보내짐 — 저장 측에서 default 폴백 처리.
//   onCancel():      뒤로가기

const LEVELS = [1, 2, 3, 5, 10];

export default function ProfileEditor({
  title = 'プロフィール編集',
  initialBio = '',
  initialDialogues = [],
  bioPlaceholder = '',
  dialoguePlaceholders = {},
  onSave,
  onCancel,
}) {
  const [bio, setBio] = useState(initialBio || '');
  const [dialogues, setDialogues] = useState(() => {
    const map = {};
    (initialDialogues || []).forEach(d => { map[d.unlockLevel] = d.text || ''; });
    return LEVELS.reduce((acc, lv) => {
      acc[lv] = map[lv] || '';
      return acc;
    }, {});
  });

  const bioMax = 200;
  const dialogueMax = 80;

  const handleSubmit = () => {
    const dialoguesArr = LEVELS
      .map(lv => ({ unlockLevel: lv, text: (dialogues[lv] || '').trim() }))
      .filter(d => d.text); // 빈 거는 제외 (default 폴백 되도록)
    onSave({
      bio: bio.trim(),
      dialogues: dialoguesArr,
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onCancel} className="text-sm text-oshi-dark/60 hover:text-oshi-dark">
          ← キャンセル
        </button>
        <div className="text-sm font-black text-oshi-dark truncate px-2">{title}</div>
        <div className="w-16" />
      </div>

      {/* 자기소개 */}
      <section className="card p-4 mb-3">
        <label className="text-[11px] font-black text-oshi-dark/70 mb-1 block">
          自己紹介
          <span className="text-oshi-dark/40 font-bold ml-1">({bio.length}/{bioMax})</span>
        </label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value.slice(0, bioMax))}
          rows={4}
          placeholder={bioPlaceholder || 'あなたの推しキャラを紹介しよう…'}
          className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm resize-none"
        />
        <div className="text-[10px] text-oshi-dark/50 mt-1">
          空欄にするとデフォルト紹介文が使用されます
        </div>
      </section>

      {/* 레벨별 대사 */}
      <section className="card p-4 mb-3">
        <div className="text-[11px] font-black text-oshi-dark/70 mb-2">
          セリフ図鑑（レベル別）
        </div>
        <div className="text-[10px] text-oshi-dark/50 mb-3">
          ファンが応援してレベルが上がると解放されるセリフです。
        </div>

        <div className="space-y-3">
          {LEVELS.map(lv => (
            <div key={lv}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-oshi-main text-white">
                  Lv.{lv}
                </span>
                <span className="text-[10px] text-oshi-dark/50">
                  ({(dialogues[lv] || '').length}/{dialogueMax})
                </span>
              </div>
              <input
                type="text"
                value={dialogues[lv] || ''}
                onChange={e => setDialogues(prev => ({
                  ...prev,
                  [lv]: e.target.value.slice(0, dialogueMax),
                }))}
                placeholder={dialoguePlaceholders[lv] || '…'}
                className="w-full px-3 py-2 rounded-xl border-2 border-oshi-sub focus:border-oshi-main outline-none text-sm"
              />
            </div>
          ))}
        </div>

        <div className="text-[10px] text-oshi-dark/50 mt-3">
          空欄のレベルはデフォルトのセリフが使われます
        </div>
      </section>

      {/* 저장 버튼 (고정) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-oshi-bg via-oshi-bg to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-full bg-oshi-main text-white font-black text-sm shadow-xl active:scale-95 transition"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
