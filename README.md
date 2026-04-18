# キャスオシ (CasOshi)

> ゲームで推しを育てる、新しい推し活プラットフォーム

ゲームで遊んでポイントを貯め、バーチャルキャラクターを応援・成長させる推し活アプリ。

## 🎯 コンセプト

**"ゲーム型推し活アプリ"**
既存の推し活アプリが「記録」型なのに対し、キャスオシは **「ゲームでポイントを稼いで推しを応援する」** 体験を中心に設計。

## 🏗️ Phase 設計

| Phase | 内容 | 状態 |
|-------|------|------|
| **Phase 1** | プラットフォーム MVP（シードキャラ 5人、無課金、ローカル保存、知人公開） | ⚡ 進行中 |
| Phase 2 | クリエイターオンボーディング（自分のキャラを登録できる） | 📝 計画 |
| Phase 3 | 商業化（ポイント課金、広告、グッズ） | 💭 構想 |

Phase 1 の段階でも、データ構造は `creatorId` 単位で設計。Phase 2 への拡張を前提にしている。

## ⚙️ 技術スタック

- **Frontend:** Vite + React 19 + Tailwind CSS v3
- **State:** localStorage (Phase 1)
- **Deploy:** Vercel (GitHub 自動連携)
- **Font:** Noto Sans JP

## 🎨 ブランドカラー

| Role     | Hex       |
|----------|-----------|
| Main     | `#FF6B9D` |
| Sub      | `#FFC1D8` |
| BG       | `#FFE5EC` |
| Dark     | `#2D1B2E` |
| Accent   | `#FFB5C5` |

## 📦 セットアップ

```bash
npm install
npm run dev
```

ビルド:

```bash
npm run build
npm run preview
```

## 🗂️ ディレクトリ構造

```
src/
├── App.jsx               # 画面ルーティング + グローバル state
├── main.jsx
├── index.css             # Tailwind + Noto Sans JP
├── components/
│   ├── PointsBar.jsx     # 上部ポイント表示バー
│   └── CharacterCard.jsx # キャラカード
├── screens/
│   ├── Home.jsx          # ホーム(出席 + タップゲーム + キャラ一覧)
│   ├── CharacterDetail.jsx # キャラ詳細 + 応援ボタン
│   └── TapGame.jsx       # タップゲーム
├── hooks/
│   └── useLocalStorage.js
└── data/
    ├── characters.js     # シードキャラ 5人
    └── gameRules.js      # ポイント計算ルール
```

## 🎮 ゲームルール (Phase 1)

| アクション | 報酬/コスト |
|-----------|-------------|
| 出席チェック (1日1回) | +10 ポイント |
| タップゲーム | タップごとに +1 ポイント |
| 応援 | -5 ポイント → キャラの応援値 +5 |
| レベルアップ | 応援値 100 ごとに Lv+1 |

## 🗺️ Roadmap (Phase 1 内)

- [x] プロジェクトセットアップ (Vite + React + Tailwind)
- [x] シードキャラ 5人
- [x] ホーム + キャラ詳細 + タップゲーム
- [x] ポイント / 応援値 / レベル計算
- [x] localStorage 保存
- [x] ランキング画面（🥇🥈🥉 メダル演出）
- [x] レベル別セリフ解放（Lv.1/2/3/5/10）
- [x] レベルアップ演出（モーダル + パーティクル）
- [ ] キャラポートレート差し替え（現状 emoji）
- [ ] 出席連続ボーナス
- [ ] タップゲームのコンボ / クリティカル
- [ ] 今日のミッション

## 📝 Notes

- **知人公開の MVP** として設計。本番運用や商用配布はまだ想定していない
- 画像は Phase 2 で差し替え予定（現状は絵文字）

## 🪪 License

Private / 非公開プロトタイプ

---

Made with 💖 by **GH (Growth Holdings)**
