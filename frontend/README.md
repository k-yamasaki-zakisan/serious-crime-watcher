# Serious Crime Watcher - Frontend

日本国内における外国人関連の犯罪統計データを可視化するダッシュボードアプリケーション。

## 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全性
- **Vite** - 高速ビルドツール
- **TailwindCSS** - ユーティリティファーストCSSフレームワーク
- **ApexCharts** - インタラクティブなデータ可視化

## プロジェクト構造

```
frontend/
├── src/
│   ├── types/          # TypeScript型定義
│   ├── components/     # Reactコンポーネント
│   ├── hooks/          # カスタムフック
│   ├── utils/          # ユーティリティ関数
│   ├── data/           # 静的データ（JSON）
│   ├── App.tsx         # メインアプリケーション
│   └── main.tsx        # エントリーポイント
├── public/             # 静的ファイル
└── package.json
```

## セットアップ

### 前提条件

- Node.js 22系以上
- npm 9系以上

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開く

### ビルド

```bash
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### プレビュー

```bash
npm run preview
```

## データソース

- **e-Stat 警察庁犯罪統計** - 来日外国人犯罪の検挙状況
- **法務省 在留外国人統計** - 在留外国人数（犯罪率計算用）

## 倫理的配慮

このアプリケーションは以下の原則に基づいています：

1. **客観性** - 公開統計データのみを使用
2. **透明性** - データソースを明示
3. **公平性** - 人口比での犯罪率を必ず表示
4. **年齢補正** - 同年齢層での比較を提供

## デプロイ

Cloudflare Pagesにデプロイ予定

```bash
npm run build
# dist/ ディレクトリをCloudflare Pagesにアップロード
```

## ライセンス

MIT
