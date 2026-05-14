# データ処理スクリプト

このディレクトリには、serious-crime-watcherプロジェクト用のデータ処理スクリプトが含まれています。

## 🚀 セットアップ

```bash
# 依存関係のインストール
npm install

# .envファイルの設定
cp .env.example .env
# .envファイルを編集してAPIキーを設定
```

## 📁 スクリプト一覧

### 1. `test-api.js` - e-Stat API接続テスト

**用途**: e-Stat APIの接続確認とデバッグ

```bash
node test-api.js
```

**機能**:
- API基本接続テスト
- 統計データ検索
- APIレスポンス確認

---

### 2. `search-crime-stats.js` - 犯罪統計データ検索

**用途**: 利用可能な犯罪統計データの検索

```bash
node search-crime-stats.js
```

**機能**:
- キーワード検索による統計表発見
- 警察庁統計コードでの絞り込み検索
- 関連する統計の一覧表示

---

### 3. `download-csv.js` - CSVダウンロード支援

**用途**: CSVファイルのダウンロード手順表示とテストデータ作成

```bash
# ダウンロード手順を表示
node download-csv.js

# テスト用CSVを作成
node download-csv.js --sample

# ヘルプを表示
node download-csv.js --help
```

**機能**:
- e-Statからの手動ダウンロード手順表示
- API経由での統計検索
- テスト用サンプルCSV作成

---

### 4. `convert-csv-to-json.js` - CSV→JSON変換

**用途**: 警察庁犯罪統計CSV（Shift-JIS）をプロジェクト用JSONに変換

```bash
# 基本的な使用方法
node convert-csv-to-json.js <csvファイルパス> [出力ファイルパス]

# 例
node convert-csv-to-json.js ../data/r08_1-3.csv
node convert-csv-to-json.js ../data/test-sjis.csv ../public/data/crime-data-2026.json
```

**対応形式**:
- **入力**: Shift-JIS または UTF-8 エンコーディングのCSV
- **出力**: プロジェクト型定義に準拠したJSON

**処理内容**:
- 第12表: 来日外国人による重要犯罪・重要窃盗犯　国籍別　検挙人員
- 第13表: 来日外国人による刑法犯・特別法犯　検挙件数・検挙人員（都道府県別）
- 自動エンコーディング判定（ファイル名ベース）
- 数値データの正規化
- データ整合性チェック

---

### 5. `validate-data.js` - データバリデーション

**用途**: 生成されたJSONファイルの妥当性検証

```bash
node validate-data.js <jsonファイルパス>

# 例
node validate-data.js ../public/data/test-utf8.json
node validate-data.js ../public/data/2026/crime-data-2026.json
```

**検証項目**:
- **基本構造**: 必須フィールドの存在確認
- **データ型**: 数値フィールドの型チェック
- **論理整合性**: 刑法犯 ≤ 総数 など
- **統計情報**: データサマリーの表示

**出力**:
- エラー数と詳細
- 警告数と詳細
- 統計情報（年度、件数、都道府県等）

---

### 6. `create-test-csv.js` - テストCSV作成

**用途**: 開発・テスト用のサンプルCSVファイル作成

```bash
node create-test-csv.js
```

**生成ファイル**:
- `../data/test-utf8.csv`: UTF-8エンコーディング版
- `../data/test-sjis.csv`: Shift-JISエンコーディング版

---

## 📋 推奨ワークフロー

### 新しいデータの処理

1. **e-Statからのダウンロード**:
   ```bash
   node download-csv.js  # 手順を確認
   ```

2. **CSV→JSON変換**:
   ```bash
   node convert-csv-to-json.js ../data/r05_1-12.csv
   ```

3. **データ検証**:
   ```bash
   node validate-data.js ../public/data/r05_1-12.json
   ```

### 開発・テスト

1. **サンプルデータ作成**:
   ```bash
   node download-csv.js --sample
   ```

2. **変換テスト**:
   ```bash
   node convert-csv-to-json.js ../data/sample.csv
   ```

3. **API接続確認**:
   ```bash
   node test-api.js
   ```

## ⚙️ 設定ファイル

### `.env`
```
ESTAT_APP_ID=your_api_key_here
```

### `package.json`
```json
{
  "scripts": {
    "test-api": "node test-api.js",
    "search-stats": "node search-crime-stats.js",
    "convert": "node convert-csv-to-json.js",
    "validate": "node validate-data.js"
  }
}
```

## 📊 出力形式

### JSONスキーマ
生成されるJSONファイルは、`../frontend/src/types/crime-data.ts`で定義された型に準拠しています。

### ディレクトリ構造
```
public/data/
├── 2022/
│   └── crime-data-2022.json
├── 2023/
│   └── crime-data-2023.json
└── index.json
```

## 🔧 トラブルシューティング

### 文字化けエラー
- Shift-JISファイルの場合、ファイル名に`sjis`を含めるか、エンコーディング判定ロジックを確認

### パースエラー
- CSVの構造が想定と異なる場合、`convert-csv-to-json.js`のデバッグ出力を有効にして確認

### APIエラー
- `.env`ファイルのAPIキー設定を確認
- ネットワーク接続を確認

## 📝 注意事項

1. **APIキーの管理**: `.env`ファイルはGitにコミットされません
2. **データファイル**: `data/`ディレクトリのCSVファイルは`.gitignore`されています
3. **エンコーディング**: 実際の警察庁データはShift-JISです
4. **バージョン管理**: 重要な変更前にはバックアップを取ってください

---

**作成日**: 2026年5月14日  
**バージョン**: 1.0.0  
**作成者**: serious-crime-watcher project