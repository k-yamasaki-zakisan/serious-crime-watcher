# Serious Crime Watcher - 設計ドキュメント

## 📋 プロジェクトステータス（2026年5月14日時点）

### ✅ 完了済み

1. **プロジェクト初期化**
   - Gitリポジトリ作成
   - .gitignore設定（ルート・フロントエンド）
   - ディレクトリ構造確立

2. **Reactプロジェクトセットアップ**
   - Vite + React 19 + TypeScript 6
   - TailwindCSS 4.2.4
   - ApexCharts 5.10.6 + react-apexcharts
   - 開発サーバー起動確認済み（http://localhost:5173）
   - 場所: `./frontend/`

3. **データ構造設計**
   - TypeScript型定義完成（`frontend/src/types/crime-data.ts`）
   - JSONスキーマ確定
   - CSVパース仕様策定

4. **データ取得**
   - e-Stat APIキー取得済み（appId: 30b1e240ae1e0e045e30eb4b2bbb10a08353f0b7）
   - サンプルCSVファイル取得済み:
     - `data/r04_1-2.csv`（2022年1-2月）
     - `data/r08_1-3.csv`（2026年1-3月）

5. **設計ドキュメント作成**
   - データソース・取得方法
   - CSVパース仕様（詳細）
   - データ構造・変換ルール
   - e-Stat API仕様

### 🚧 未完了・次のステップ

#### 優先度: 高

**タスク#5: データ加工スクリプトを作成**
- 目的: CSVをJSONに変換
- ファイル: `scripts/convert-csv-to-json.js`
- 依存: Node.js、iconv-lite パッケージ
- 実装内容:
  - Shift-JIS → UTF-8変換
  - 第12表（国籍別）のパース
  - 第13表（都道府県別）のパース
  - JSON出力（`public/data/{year}/crime-data-{year}.json`）
  - データバリデーション
- 参照: セクション 3.4「CSVデータ構造とパース仕様」

**タスク#4: UI/UX設計とワイヤーフレームを作成**
- 目的: ダッシュボードのレイアウト設計
- 成果物: ワイヤーフレーム（Markdown or 画像）
- 考慮事項:
  - ApexChartsを使った可視化
  - 年齢層別比較を目玉機能とする
  - レスポンシブデザイン
  - 倫理的配慮（人口比表示必須）
- 出力先: `DESIGN.md` セクション4

#### 優先度: 中

**タスク#3: 複数年のデータを収集**
- 目的: 時系列分析を可能にする
- 対象年度: 2021-2024年（最低4年分）
- 方法: e-Statで「来日外国人」検索 → CSVダウンロード
- 保存先: `data/r{年度}_*.csv`

#### 優先度: 低（実装フェーズ後）

- Reactコンポーネント実装
- チャート実装（ApexCharts）
- Cloudflare Pagesデプロイ
- GitHub Actions自動更新

---

## 🔄 別PC/AIへの引き渡し手順

### 前提条件

- Node.js 22系以上
- Git
- e-Stat APIキー（既に取得済み: 上記参照）

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone <repository-url>
cd serious-crime-watcher

# 2. フロントエンドの依存関係インストール
cd frontend
npm install

# 3. 開発サーバー起動（動作確認）
npm run dev
# → http://localhost:5173 が開けばOK

# 4. データファイルの配置
# data/ディレクトリにCSVファイルを配置（gitignore対象）
# または e-Statから再ダウンロード
```

### 作業開始前の確認

1. `DESIGN.md` を通読（特にセクション2-3）
2. `frontend/src/types/crime-data.ts` で型定義を確認
3. `data/r08_1-3.csv` でCSV構造を実際に確認
4. 上記「未完了・次のステップ」から優先度の高いタスクを選択

### 重要なファイル

```
プロジェクトルート/
├── DESIGN.md                    ← この設計ドキュメント（最重要）
├── README.md                    ← プロジェクト概要
├── .gitignore                   ← データ・設定除外
├── data/                        ← CSVファイル（gitignore対象）
│   ├── r04_1-2.csv
│   └── r08_1-3.csv
└── frontend/
    ├── src/
    │   ├── types/crime-data.ts  ← TypeScript型定義
    │   ├── App.tsx              ← メインコンポーネント
    │   └── index.css            ← TailwindCSS設定
    ├── package.json             ← 依存関係
    └── README.md                ← フロントエンドのREADME
```

### 推奨する次のアクション

1. **データ加工スクリプトを実装する場合:**
   - `scripts/convert-csv-to-json.js` を作成
   - セクション 3.4.5 の疑似コードを参考に実装
   - `npm install iconv-lite csv-parse` で依存追加

2. **UI/UX設計を進める場合:**
   - ApexChartsのサンプルを確認
   - ワイヤーフレームをスケッチ
   - DESIGN.mdのセクション4として記述

3. **実装を開始する場合:**
   - まずデータ加工スクリプトを完成させる
   - サンプルJSONを生成
   - Reactコンポーネントでデータを表示

---

## 1. プロジェクト概要

### 1.1 目的
日本国内における外国人関連の犯罪統計データを可視化し、客観的な情報提供を行うダッシュボードアプリケーション。

### 1.2 背景
- 移民問題に関心を持つ日本在住者向けに、公開統計データを分かりやすく提供
- 感情的な議論ではなく、データに基づいた客観的な議論の土台を作る
- 欧州での移民問題の先例を踏まえ、日本でも統計情報へのアクセシビリティを向上

### 1.3 ミニマムバリューバージョン（MVP）
**スコープ:**
- 外国人関連の犯罪統計データのダッシュボード表示
- 静的データ（JSON）ベースの実装
- 時系列推移、国籍別、罪種別の基本的な可視化

**スコープ外（将来検討）:**
- リアルタイムデータ更新
- ユーザー認証機能
- データのエクスポート機能
- 詳細なフィルタリング機能

### 1.4 ターゲットユーザー
- **プライマリ:** 移民問題に関心を持つ日本在住者
- **セカンダリ:** 研究者、ジャーナリスト、政策立案者

### 1.5 技術スタック
- **フロントエンド:** React
- **ビルドツール:** Vite（推奨）
- **データ可視化:** ApexCharts（インタラクティブ性、レスポンシブ対応）
- **ホスティング:** Cloudflare Pages（静的ファイル配信）
- **データ形式:** JSON（静的ファイル）
- **スタイリング:** TailwindCSS（検討中）
- **コスト:** 実質無料（Cloudflareの無料枠内）

### 1.6 プロジェクト原則
1. **客観性:** 公開統計データのみを使用
2. **透明性:** データソースを明示
3. **公平性:** 日本人の犯罪率との比較を必ず含める（人口比）
4. **正確性:** データの加工プロセスを文書化

---

## 2. データソース・取得方法

### 2.1 主要データソース

#### 2.1.1 e-Stat（政府統計の総合窓口）
**URL:** https://www.e-stat.go.jp/

**取得対象データ:**

1. **警察庁「犯罪統計」**
   - 統計表名: 「来日外国人犯罪の検挙状況」
   - データ項目:
     - 国籍別検挙件数
     - 国籍別検挙人員
     - 罪種別検挙件数
     - 在留資格別検挙人員
     - **年齢層別検挙人員**（20-29歳、30-39歳等）
   - 更新頻度: 年次
   - 過去データ: 10-20年分を取得

2. **法務省「在留外国人統計」**
   - 統計表名: 「在留外国人統計」
   - データ項目:
     - 国籍別在留外国人数
     - 在留資格別人数
     - **年齢層別在留外国人数**
   - 目的: 犯罪率計算の分母として使用
   - 更新頻度: 年次

3. **警察庁「犯罪統計」（日本人含む総数）**
   - データ項目:
     - 全体の検挙件数・人員
     - 罪種別統計
     - **年齢層別検挙人員**
   - 目的: 日本人との比較データとして使用

4. **総務省「人口推計」**
   - データ項目:
     - 日本人の年齢層別人口
   - 目的: 日本人の年齢層別犯罪率計算の分母

5. **入管庁「退去強制統計」（四半期/年次）**
   - データ項目:
     - 退去強制の理由（犯罪種別）
     - 国籍別の退去強制件数
   - 更新頻度: 四半期
   - 目的: 補完データとして活用

### 2.2 データ取得手順

#### ステップ1: e-Statからのダウンロード

**検索方法:**
1. e-Stat（https://www.e-stat.go.jp/）にアクセス
2. 検索窓で **「来日外国人犯罪 検挙状況」** または **「来日外国人」** でキーワード検索
3. 警察庁の「犯罪統計」を選択
4. 該当年度のCSVファイルをダウンロード
5. 必要に応じて「在留外国人統計」も同様にダウンロード

**取得済みデータ:**
- **r04_1-2.csv**
  - 年度: 令和4年（2022年）1-2月
  - ファイル名: `r04_1-2.csv`
  - データ内容:
    - 第12表: 来日外国人による重要犯罪・重要窃盗犯　国籍別　検挙人員
    - 第13表: 来日外国人による刑法犯・特別法犯　検挙件数・検挙人員（都道府県別）
  - 文字エンコーディング: Shift-JIS
  - ファイルサイズ: 180KB

- **r08_1-3.csv**
  - 年度: 令和8年（2026年）1-3月
  - ファイル名: `r08_1-3.csv`
  - データ内容:
    - 第12表: 来日外国人による重要犯罪・重要窃盗犯　国籍別　検挙人員
    - 第13表: 来日外国人による刑法犯・特別法犯　検挙件数・検挙人員（都道府県別）
  - 文字エンコーディング: Shift-JIS
  - ファイルサイズ: 184KB

**重要な注意事項:**
- e-Statの検索では **「来日外国人犯罪」** だけでは結果が0件になる場合があります
- **「来日外国人」** で検索すると149件以上の関連データが見つかります
- 警察庁が提供元のデータを選択してください
- CSVファイルは **Shift-JIS** エンコーディングなので、UTF-8への変換が必要です
- データ格納場所: `/data/` ディレクトリ（.gitignoreで除外済み）

#### ステップ2: データクリーニング
```
入力: CSV形式の生データ（Shift-JISエンコーディング）
処理:
  - 文字エンコーディング変換（Shift-JIS → UTF-8）
  - 不要な行（ヘッダー、フッター）の削除
  - 数値データの正規化（カンマ除去、数値変換）
  - 国籍名の統一（表記ゆれの修正）
  - 欠損値の処理
出力: クリーニング済みJSON
```

#### ステップ3: JSON変換
実際のCSVデータから以下のJSONスキーマを設計：

```typescript
// データ構造の型定義
interface CrimeData {
  metadata: {
    year: number;
    period: string; // "1-3月", "年間" など
    dataSource: string;
    retrievedDate: string;
    notes: string;
  };
  
  // 来日外国人犯罪データ
  foreignerCrimes: {
    total: {
      cases: number; // 刑法犯 + 特別法犯
      persons: number;
      criminalCases: number; // 刑法犯のみ
      criminalPersons: number;
    };
    
    // 国籍別（第12表から抽出）
    byNationality: NationalityData[];
    
    // 罪種別
    byCrimeType: CrimeTypeData[];
    
    // 都道府県別（第13表から抽出）
    byPrefecture: PrefectureData[];
    
    // 在留資格別（取得可能な場合）
    byResidenceStatus?: ResidenceStatusData[];
    
    // 年齢層別（取得可能な場合）
    byAgeGroup?: AgeGroupData[];
  };
  
  // 日本人犯罪データ（比較用）
  japaneseCrimes: {
    totalCases: number;
    totalPersons: number;
    totalPopulation: number;
    crimeRatePer100k: number;
    byAgeGroup?: AgeGroupData[];
  };
}

interface NationalityData {
  region: string; // "アジア州", "ヨーロッパ州" など
  country: string; // "中国", "韓国・朝鮮", "ベトナム" など
  totalPersons: number;
  seriousCrimes: {
    total: number;
    murder: number;
    robbery: number;
    arson: number;
    sexualAssault: number; // 不同意性交等
    abduction: number; // 略取誘拐・人身売買
    indecency: number; // 不同意わいせつ
  };
  seriousTheft: {
    total: number;
    burglary: number;
    autoTheft: number;
    snatching: number; // ひったくり
    pickpocketing: number; // すり
  };
  residentPopulation?: number; // 在留外国人数（分母）
  crimeRatePer100k?: number; // 人口10万人あたり
}

interface CrimeTypeData {
  type: string;
  cases: number;
  persons: number;
}

interface PrefectureData {
  prefecture: string;
  totalCases: number;
  totalPersons: number;
  criminalCases: number; // 刑法犯のみ
  criminalPersons: number;
}

interface AgeGroupData {
  ageGroup: string; // "20-29", "30-39" など
  persons: number;
  population: number;
  crimeRatePer100k: number;
}

interface ResidenceStatusData {
  status: string; // "留学", "技能実習", "観光" など
  persons: number;
  cases: number;
}
```

**JSONサンプル例:**
```json
{
  "metadata": {
    "year": 2026,
    "period": "1-3月",
    "dataSource": "e-Stat 警察庁犯罪統計",
    "retrievedDate": "2026-05-14",
    "notes": "検挙ベースの統計（暫定値）"
  },
  "foreignerCrimes": {
    "total": {
      "cases": 2186,
      "persons": 1265,
      "criminalCases": 1440,
      "criminalPersons": 701
    },
    "byNationality": [
      {
        "region": "アジア州",
        "country": "中国",
        "totalPersons": 32,
        "seriousCrimes": {
          "total": 18,
          "murder": 3,
          "robbery": 4,
          "arson": 0,
          "sexualAssault": 5,
          "abduction": 0,
          "indecency": 6
        },
        "seriousTheft": {
          "total": 16,
          "burglary": 9,
          "autoTheft": 3,
          "snatching": 0,
          "pickpocketing": 4
        }
      },
      {
        "region": "アジア州",
        "country": "ベトナム",
        "totalPersons": 69,
        "seriousCrimes": {
          "total": 21,
          "murder": 7,
          "robbery": 11,
          "arson": 0,
          "sexualAssault": 1,
          "abduction": 0,
          "indecency": 2
        },
        "seriousTheft": {
          "total": 36,
          "burglary": 23,
          "autoTheft": 6,
          "snatching": 1,
          "pickpocketing": 6
        }
      }
    ],
    "byPrefecture": [
      {
        "prefecture": "東京都",
        "totalCases": 540,
        "totalPersons": 289,
        "criminalCases": 343,
        "criminalPersons": 137
      }
    ]
  },
  "japaneseCrimes": {
    "totalCases": 567890,
    "totalPersons": 234567,
    "totalPopulation": 123456789,
    "crimeRatePer100k": 190.0
  }
}
```

### 2.3 データ更新戦略

#### MVPフェーズ（手動・年次更新）
- 手動更新（年1回、詳細データ公開後）
- データは `public/data/` または `src/data/` に静的JSONとして配置
- バージョン管理: ファイル名に年度を含める（例: `crime-data-2023.json`）

#### 月次更新の可能性調査

**現状の課題:**
| データソース | 更新頻度 | 外国人詳細 | 利用可否 |
|------------|---------|-----------|---------|
| 警察庁・犯罪統計（詳細） | 年次 | ✅ あり | ✅ メイン |
| 警察庁・犯罪統計（速報） | 月次 | ❌ なし | △ 限定的 |
| 都道府県警察 | 月次 | ❌ なし（多くの県） | △ 要調査 |
| 入管庁・退去強制統計 | 四半期 | ✅ あり | ✅ 補完 |

**ハイブリッドアプローチ（将来版）:**

```
レイヤー1: 詳細データ（年次更新）
  - 国籍別・在留資格別・年齢層別の詳細分析
  - データソース: e-Stat 警察庁犯罪統計（年次）
  - 更新: 年1回

レイヤー2: 速報データ（月次更新）
  - 全体の犯罪件数トレンド（外国人・日本人の区別なし）
  - データソース: 警察庁犯罪統計資料（月次）
  - 更新: 月1回
  - 用途: トレンドの可視化、最新月の速報表示

レイヤー3: 補完データ（四半期更新）
  - 退去強制の状況（犯罪関連）
  - 在留外国人数の推移
  - データソース: 入管庁統計
  - 更新: 四半期ごと
```

**UI上の表現例:**
```
タイムライン表示:
  2023年: [詳細データ] 国籍別・罪種別・年齢層別
  2024年1-11月: [速報値] 全体トレンドのみ
  2024年12月: [最新] 「詳細は2025年春公開予定」
```

#### 都道府県警データの活用可能性

**調査すべき県警:**
1. **東京都**: 外国人人口が多く、詳細統計を公開している可能性
2. **大阪府**: 同上
3. **愛知県**: 技能実習生が多い地域

**スクレイピング戦略（将来）:**
- 各県警のウェブサイトから月次PDFを取得
- PDF → JSON変換（Tabula等）
- GitHub Actionsで自動化

#### 自動更新の実装（Phase 2）

```yaml
# .github/workflows/update-data.yml
name: Update Crime Statistics

on:
  schedule:
    - cron: '0 0 1 * *'  # 毎月1日
  workflow_dispatch:     # 手動トリガー

jobs:
  update:
    - e-Stat API経由でデータ取得
    - 警察庁サイトから月次PDFをスクレイピング
    - JSON生成 & コミット
    - Cloudflare Pagesへ自動デプロイ
```

### 2.4 データ品質管理

**検証項目:**
1. 数値の妥当性チェック（負の値、異常値）
2. 年次データの連続性確認
3. 合計値の整合性確認
4. ソースデータとの照合

**ドキュメント化:**
- データ取得日
- ソースURL
- 加工手順
- 既知の制約事項

### 2.5 データ利用上の注意事項

**統計上の制約:**
- 「検挙」ベースのデータ（起訴・有罪ではない）
- 「来日外国人」の定義: 永住者等を除く場合がある
- 暗数の存在（検挙されていない犯罪）
- データの遅れ（公開まで1-2年のタイムラグ）

**倫理的配慮:**
1. **人口比での犯罪率を必須表示**
   - 絶対数だけでなく、人口10万人あたりの犯罪率を併記
   - 「人数が多い = 危険」という誤解を避ける

2. **年齢補正の重要性**
   - 在留外国人は20-30代が多い（労働・留学目的）
   - 日本人全体は高齢化が進んでいる
   - 同年齢層での比較を必ず提供（20-39歳等）
   - 年齢補正なしの比較は統計学的に不公平

3. **文脈の提供**
   - 在留資格別データを提示（留学、技能実習、観光等）
   - 経済状況、社会的背景の影響も示唆
   - 特定の国籍への偏見を助長しない表現

4. **データソースの透明性**
   - 全てのデータソースを明記
   - 加工手順を公開
   - 計算方法を明示

**推奨される可視化アプローチ:**
```
❌ 避けるべき: 「○○国籍が犯罪件数トップ」
✅ 推奨: 「20-39歳の人口10万人あたりの犯罪率比較（日本人: 295.2、外国人全体: 410.5）」
```

---

## 2.6 e-Stat API 仕様

### 2.6.1 API概要
- **公式URL**: https://www.e-stat.go.jp/api/
- **バージョン**: 3.0（最新）
- **プロトコル**: REST API (HTTPS)
- **レスポンス形式**: JSON / XML / CSV
- **認証**: アプリケーションID（appId）必須

### 2.6.2 利用登録
1. **登録URL**: https://www.e-stat.go.jp/mypage/user/preregister
2. **費用**: 無料（政府統計の公開API）
3. **登録後**: マイページでアプリケーションIDを取得
4. **利用制限**: 
   - 1回の取得上限: 10万件（`limit`パラメータで指定）
   - レート制限: 明示的な記載なし（常識的な範囲内で利用）

### 2.6.3 主要エンドポイント

#### 統計表検索（getStatsList）
```
https://api.e-stat.go.jp/rest/3.0/app/getStatsList?
  appId={YOUR_APP_ID}
  &searchWord=来日外国人
  &statsCode=00130001  # 警察庁の統計コード
```

**レスポンス例（JSON）:**
```json
{
  "GET_STATS_LIST": {
    "TABLE_INF": [
      {
        "@id": "0003090287",
        "STAT_NAME": "犯罪統計",
        "TITLE": "来日外国人犯罪の検挙状況",
        "SURVEY_DATE": "202300"
      }
    ]
  }
}
```

#### 統計データ取得（getStatsData）
```
https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?
  appId={YOUR_APP_ID}
  &statsDataId=0003090287
  &cdCat01=001,002,003  # 国籍コード
```

**レスポンス構造:**
```json
{
  "GET_STATS_DATA": {
    "RESULT": {
      "STATUS": 0,
      "ERROR_MSG": "正常に終了しました。"
    },
    "STATISTICAL_DATA": {
      "DATA_INF": {
        "VALUE": [
          {
            "@cat01": "中国",
            "@time": "2023",
            "$": "1234"  # 検挙件数
          }
        ]
      }
    }
  }
}
```

#### メタ情報取得（getMetaInfo）
```
https://api.e-stat.go.jp/rest/3.0/app/getMetaInfo?
  appId={YOUR_APP_ID}
  &statsDataId=0003090287
```
目的: 統計表の項目コード（国籍、罪種等）を取得

### 2.6.4 データ取得フロー

```
ステップ1: 統計表IDを検索
  getStatsList(searchWord="来日外国人")
  → statsDataId を取得

ステップ2: メタ情報を取得
  getMetaInfo(statsDataId)
  → 国籍コード、罪種コード等を把握

ステップ3: 統計データを取得
  getStatsData(statsDataId, cdCat01="001,002,...")
  → JSON形式で数値データを取得

ステップ4: データクリーニング & JSON変換
  → プロジェクト用のJSONスキーマに整形
```

### 2.6.5 実装上の注意点

**分割取得:**
- 10万件を超える場合は`NEXT_KEY`で分割取得
```javascript
// 初回リクエスト
const res1 = await fetch(`${API_URL}?appId=${APP_ID}&statsDataId=xxx&startPosition=1`)
const nextKey = res1.NEXT_KEY

// 継続リクエスト
const res2 = await fetch(`${API_URL}?appId=${APP_ID}&statsDataId=xxx&startPosition=${nextKey}`)
```

**エラーハンドリング:**
| STATUS | ERROR_MSG | 対処 |
|--------|-----------|------|
| 0 | 正常終了 | - |
| 100 | 認証失敗 | appIdを確認 |
| 110 | パラメータ不正 | リクエストを修正 |

**キャッシュ戦略:**
- APIレスポンスをファイルにキャッシュ（年次データは変更されない）
- GitHub Actionsで年1回実行 → 静的JSONを生成

### 2.6.6 開発フェーズでの利用

**Phase 1（MVP）:**
- 手動でCSVをダウンロード → JSONに変換 → プロジェクトに配置

**Phase 2（自動化）:**
- Node.jsスクリプトでCSV加工 → データ加工 → コミット
- GitHub Actionsで定期実行

**Phase 3（リアルタイム）:**
- フロントエンドから直接API呼び出し（appIdの扱いに注意）
- または、バックエンド（Cloudflare Workers）経由でプロキシ

---

## 3. データ構造設計

### 3.1 CSVデータの分析結果

取得したCSVファイル（r04_1-2.csv, r08_1-3.csv）の分析から、以下の構造を確認：

**主要テーブル:**
- **第12表**: 来日外国人による重要犯罪・重要窃盗犯　国籍別　検挙人員
- **第13表**: 来日外国人による刑法犯・特別法犯　検挙件数・検挙人員（都道府県別）

**国籍の分類:**
```
アジア州:
  - 韓国・朝鮮
  - 中国（台湾、香港等を含む）
  - ベトナム
  - フィリピン
  - タイ
  - インド
  - インドネシア
  - スリランカ
  - パキスタン
  - バングラデシュ
  - その他

ヨーロッパ州:
  - イギリス、イタリア、ドイツ、フランス、ロシア、その他

南北アメリカ州:
  - アメリカ、カナダ、ブラジル、その他

アフリカ州
オセアニア州
無国籍
国籍不明
```

**罪種の分類:**
```
重要犯罪:
  - 殺人
  - 強盗
  - 放火
  - 不同意性交等（旧: 強制性交等）
  - 略取誘拐・人身売買
  - 不同意わいせつ（旧: 強制わいせつ）

重要窃盗犯:
  - 侵入盗
  - 自動車盗
  - ひったくり
  - すり
```

### 3.2 ファイル構成

```
プロジェクトルート/
├── public/
│   └── data/
│       ├── 2022/
│       │   └── crime-data-2022.json
│       ├── 2023/
│       │   └── crime-data-2023.json
│       ├── 2024/
│       │   └── crime-data-2024.json
│       └── index.json  # 利用可能な年度一覧
├── src/
│   ├── types/
│   │   └── crime-data.ts  # TypeScript型定義
│   └── ...
└── scripts/
    ├── convert-csv-to-json.js  # CSV → JSON変換スクリプト
    └── validate-data.js  # データ検証スクリプト
```

### 3.3 JSONスキーマの詳細

`src/types/crime-data.ts`:
```typescript
export interface CrimeDataset {
  metadata: Metadata;
  foreignerCrimes: ForeignerCrimes;
  japaneseCrimes: JapaneseCrimes;
}

export interface Metadata {
  year: number;
  period: string; // "1-3月", "年間"
  dataSource: string;
  retrievedDate: string;
  notes: string;
  version: string; // "暫定値" or "確定値"
}

export interface ForeignerCrimes {
  total: TotalCrimes;
  byNationality: NationalityData[];
  byPrefecture: PrefectureData[];
  byCrimeType?: CrimeTypeData[];
  byResidenceStatus?: ResidenceStatusData[];
  byAgeGroup?: AgeGroupData[];
}

export interface TotalCrimes {
  cases: number; // 総件数（刑法犯 + 特別法犯）
  persons: number; // 総人員
  criminalCases: number; // 刑法犯のみ
  criminalPersons: number; // 刑法犯のみ
}

export interface NationalityData {
  region: string;
  country: string;
  totalPersons: number;
  seriousCrimes: SeriousCrimes;
  seriousTheft: SeriousTheft;
  residentPopulation?: number;
  crimeRatePer100k?: number;
}

export interface SeriousCrimes {
  total: number;
  murder: number;
  robbery: number;
  arson: number;
  sexualAssault: number; // 不同意性交等
  abduction: number; // 略取誘拐・人身売買
  indecency: number; // 不同意わいせつ
}

export interface SeriousTheft {
  total: number;
  burglary: number; // 侵入盗
  autoTheft: number; // 自動車盗
  snatching: number; // ひったくり
  pickpocketing: number; // すり
}

export interface PrefectureData {
  prefecture: string;
  totalCases: number;
  totalPersons: number;
  criminalCases: number;
  criminalPersons: number;
}

export interface JapaneseCrimes {
  totalCases: number;
  totalPersons: number;
  totalPopulation: number;
  crimeRatePer100k: number;
  byAgeGroup?: AgeGroupData[];
}

export interface AgeGroupData {
  ageGroup: string;
  persons: number;
  population: number;
  crimeRatePer100k: number;
}

export interface CrimeTypeData {
  type: string;
  cases: number;
  persons: number;
}

export interface ResidenceStatusData {
  status: string;
  persons: number;
  cases: number;
}

// 年度インデックス用
export interface DataIndex {
  availableYears: AvailableYear[];
  latestYear: number;
}

export interface AvailableYear {
  year: number;
  period: string;
  version: string;
  fileUrl: string;
}
```

### 3.4 CSVデータ構造とパース仕様

#### 3.4.1 CSVファイルの全体構造

警察庁の犯罪統計CSVファイルは複数の統計表が1つのファイルに含まれています：

```
r08_1-3.csv の構造:
├── 第1表: 刑法犯全体の統計（行2-70）
├── 第2表: 窃盗の統計（行74-142）
├── ...（中略）
├── 第12表: 来日外国人の国籍別統計（行2104-2207）← 重要
└── 第13表: 来日外国人の都道府県別統計（行2209-2290）← 重要
```

**重要な特徴:**
- ファイルは **Shift-JIS** エンコーディング
- ヘッダー行が複数行にまたがる（3-5行）
- 数値にカンマ区切りが含まれる（例: `1,234`）
- 空白セルは欠損値を意味する

#### 3.4.2 第12表: 国籍別検挙人員の構造

**行構造:**
```
行2104: ,第１２表,,,来日外国人による　重要犯罪・重要窃盗犯　国籍別　検挙人員　対前年比較,,,,,,,,,,,,暫定値,,
行2105: ,,,,,,,,,,,,,,,,２０２７年２月１日確定,,
行2106: （空行）
行2107: ,,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,...
行2108: ,,総数,総数,重要犯罪,重要犯罪,殺人,殺人,強盗,強盗,...
行2109: ,,"2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月",...
行2110以降: データ行
```

**列構造（0-indexed）:**
```
列0: （空）
列1: 地域または国名（例: "アジア州", "中国", "計"）
列2: 総数（当年）
列3: 総数（前年）
列4: 重要犯罪（当年）
列5: 重要犯罪（前年）
列6: 殺人（当年）
列7: 殺人（前年）
列8: 強盗（当年）
列9: 強盗（前年）
列10: 放火（当年）
列11: 放火（前年）
列12: 不同意性交等（当年）
列13: 不同意性交等（前年）
列14: 略取誘拐・人身売買（当年）
列15: 略取誘拐・人身売買（前年）
列16: 不同意わいせつ（当年）
列17: 不同意わいせつ（前年）
```

**データ行の例:**
```csv
,アジア州,計,166,154,77,77,12,7,23,14,1,0,14,20,1,8,26,28,
,アジア州,中国,32,32,18,19,3,2,4,4,0,0,5,5,0,1,6,7,
,アジア州,ベトナム,69,70,21,26,7,4,11,8,0,0,1,4,0,6,2,4,
```

**パースルール:**
- 列1が「計」の場合は地域の合計行
- 列1が「アジア州」「ヨーロッパ州」等の場合は地域名
- 列1が具体的な国名の場合はその国のデータ
- 偶数列（2,4,6...）が当年データ、奇数列（3,5,7...）が前年データ

#### 3.4.3 第13表: 都道府県別検挙件数・人員の構造

**行構造:**
```
行2209: 第１３表,,,,来日外国人による　刑法犯・特別法犯　検挙件数・検挙人員　対前年比較,,,,,,,,,,,,暫定値,,,,,,,,,,
行2210: ,,,,,,,,,,,,,,,,２０２７年２月１日確定,,,,,,,,,,
行2211: （空行）
行2212: ,,検挙件数,検挙件数,検挙件数,検挙件数,検挙人員,検挙人員,検挙人員,検挙人員,検挙件数,検挙件数,検挙件数,検挙件数,検挙人員,検挙人員,検挙人員,検挙人員,,,,,,,,,
行2213: ,,"刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯",... ,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,,,,,,,,,
行2214: ,,"2026年\n1〜３月","2025年\n1〜３月",増減,増減率（％）,...
行2215以降: データ行
```

**列構造（0-indexed）:**
```
列0: （空）
列1: 都道府県名または地域名（例: "総数", "東京都", "関東", "茨城県"）
列2: 検挙件数（刑法犯+特別法犯、当年）
列3: 検挙件数（刑法犯+特別法犯、前年）
列4: 増減
列5: 増減率（％）
列6: 検挙人員（刑法犯+特別法犯、当年）
列7: 検挙人員（刑法犯+特別法犯、前年）
列8: 増減
列9: 増減率（％）
列10: 検挙件数（刑法犯のみ、当年）
列11: 検挙件数（刑法犯のみ、前年）
列12: 増減
列13: 増減率（％）
列14: 検挙人員（刑法犯のみ、当年）
列15: 検挙人員（刑法犯のみ、前年）
列16: 増減
列17: 増減率（％）
```

**データ行の例:**
```csv
総数,,2186,2596,-410,-15.8,1265,1487,-222,-14.9,1440,1606,-166,-10.3,701,763,-62,-8.1,,,,,,,,,
北海道,計,16,12,4,33.3,12,7,5,71.4,5,9,-4,-44.4,4,4,0,0.0,,,,,,,,,
東京都,,540,475,65,13.7,289,320,-31,-9.7,343,267,76,28.5,137,159,-22,-13.8,,,,,,,,,
```

**パースルール:**
- 列1が「総数」の場合は全国合計
- 列1が空で列0が地域名（「北海道」「関東」等）の場合は地域グループ
- 列1が「計」の場合はその地域の小計
- 列1が具体的な都道府県名の場合はそのデータ

#### 3.4.4 データ変換ルール

1. **文字エンコーディング**: Shift-JIS → UTF-8
   ```javascript
   const iconv = require('iconv-lite');
   const utf8Data = iconv.decode(buffer, 'Shift_JIS');
   ```

2. **数値の正規化**: カンマ除去、文字列 → 数値変換
   ```javascript
   function parseNumber(value) {
     if (!value || value === '-') return 0;
     return parseInt(value.replace(/,/g, ''), 10) || 0;
   }
   ```

3. **欠損値の処理**: `-`, 空文字列 → `0`
   ```javascript
   const numValue = value.trim() === '' || value === '-' ? 0 : parseNumber(value);
   ```

4. **テーブルの識別**:
   ```javascript
   function findTableStart(lines, tableNumber) {
     return lines.findIndex(line => 
       line.includes(`第${tableNumber}表`) && 
       line.includes('来日外国人')
     );
   }
   ```

5. **ヘッダー行のスキップ**: 各テーブルの先頭3-5行はヘッダーなので読み飛ばす
   ```javascript
   const dataStartRow = tableStartRow + 5; // ヘッダー行をスキップ
   ```

6. **国籍名の統一**: CSVの表記をそのまま使用
   - 「中国」は台湾、香港等を含む（注釈あり）
   - 「韓国・朝鮮」はハイフン区切り

7. **罪種名の統一**: 
   - 2023年以降: 「強制性交等」→「不同意性交等」
   - 2023年以降: 「強制わいせつ」→「不同意わいせつ」

#### 3.4.5 パース実装の疑似コード

```javascript
function parseTable12(csvLines) {
  const table12Start = findTableStart(csvLines, 12);
  const dataStartRow = table12Start + 5;
  
  const nationalityData = [];
  let currentRegion = '';
  
  for (let i = dataStartRow; i < csvLines.length; i++) {
    const line = csvLines[i];
    const columns = line.split(',');
    
    // 次のテーブルに到達したら終了
    if (columns[0] && columns[0].includes('第１３表')) break;
    
    // 空行をスキップ
    if (columns.every(col => !col.trim())) continue;
    
    const region = columns[0] || currentRegion;
    const countryOrLabel = columns[1];
    
    // 「計」行はスキップ（地域合計）
    if (countryOrLabel === '計') continue;
    
    // 地域名の更新
    if (region.includes('州')) {
      currentRegion = region;
    }
    
    // データ行の処理
    if (countryOrLabel && !countryOrLabel.includes('州')) {
      nationalityData.push({
        region: currentRegion,
        country: countryOrLabel,
        totalPersons: parseNumber(columns[2]),
        seriousCrimes: {
          total: parseNumber(columns[4]),
          murder: parseNumber(columns[6]),
          robbery: parseNumber(columns[8]),
          arson: parseNumber(columns[10]),
          sexualAssault: parseNumber(columns[12]),
          abduction: parseNumber(columns[14]),
          indecency: parseNumber(columns[16])
        }
        // ...続く
      });
    }
  }
  
  return nationalityData;
}
```

### 3.5 データ検証

`scripts/validate-data.js` で以下を検証:
```javascript
// 検証項目
- 合計値の整合性（国籍別の合計 = 総数）
- 負の値がないこと
- 必須フィールドの存在
- 数値型の妥当性
- 年度の連続性
```

---

## 4. 実装計画（TODO）

### 4.1 フェーズ1: データパイプライン構築 🚧

#### タスク5: データ加工スクリプト実装
**優先度: 🔴 高**

**ゴール:** CSVファイルをJSONに変換するスクリプトを作成

**実装ファイル:** `scripts/convert-csv-to-json.js`

**依存パッケージ:**
```bash
npm install iconv-lite csv-parse
```

**実装内容:**
```
1. CSVファイル読み込み
   - Shift-JIS → UTF-8変換
   - csv-parseでパース

2. 第12表のパース
   - 国籍別データ抽出
   - NationalityData[] 生成

3. 第13表のパース
   - 都道府県別データ抽出
   - PrefectureData[] 生成

4. JSON出力
   - CrimeDataset 型に準拠
   - public/data/{year}/crime-data-{year}.json

5. バリデーション
   - 数値の妥当性チェック
   - 合計値の整合性確認
```

**成功条件:**
- [ ] r04_1-2.csv → crime-data-2022.json 変換成功
- [ ] r08_1-3.csv → crime-data-2026.json 変換成功
- [ ] 生成されたJSONがTypeScript型定義に準拠
- [ ] バリデーションエラーがゼロ

**参照:**
- セクション 3.4「CSVデータ構造とパース仕様」
- `frontend/src/types/crime-data.ts`

---

#### タスク3: 複数年のデータ収集
**優先度: 🟡 中**

**ゴール:** 時系列分析用に過去4-5年分のデータを取得

**手順:**
```
1. e-Statにアクセス（https://www.e-stat.go.jp/）
2. 「来日外国人」で検索
3. 以下の年度のCSVをダウンロード:
   - 令和3年（2021年）
   - 令和4年（2022年）
   - 令和5年（2023年）
   - 令和6年（2024年）
   - 令和7年（2025年）※あれば
4. data/ ディレクトリに保存
5. convert-csv-to-json.js で変換
```

**成功条件:**
- [ ] 4年分以上のCSVファイル取得
- [ ] 全てJSON変換成功
- [ ] public/data/index.json に年度リスト追加

---

### 4.2 フェーズ2: UI/UX設計 🚧

#### タスク4: ダッシュボード設計
**優先度: 🟡 中**

**ゴール:** ダッシュボードのワイヤーフレームとチャート設計

**実装内容:**
```
1. レイアウト設計
   - ヘッダー（タイトル、説明）
   - サイドバー（フィルター、年度選択）
   - メインエリア（チャート配置）
   - フッター（データソース明記）

2. チャート設計（ApexCharts）
   - 国籍別犯罪率（棒グラフ）
   - 時系列推移（折れ線グラフ）
   - 罪種別分布（ドーナツチャート）
   - 都道府県別ヒートマップ
   - 年齢層別比較（横棒グラフ）← 目玉機能

3. インタラクティブ要素
   - 年度切り替え
   - 国籍フィルター
   - ツールチップ（詳細情報表示）

4. レスポンシブデザイン
   - デスクトップ（1920px）
   - タブレット（768px）
   - モバイル（375px）
```

**成果物:**
- ワイヤーフレーム（手書き or Figma）
- DESIGN.md セクション4に記述

**参照:**
- ApexCharts公式: https://apexcharts.com/
- サンプル: https://apexcharts.com/react-chart-demos/

---

### 4.3 フェーズ3: フロントエンド実装 ⏳

**優先度: 🟢 低（データ準備後）**

```
1. データロード機能
   - useEffect でJSON読み込み
   - ローディング状態管理

2. コンポーネント実装
   - NationalityChart.tsx
   - TimeSeriesChart.tsx
   - PrefectureHeatmap.tsx
   - AgeGroupComparison.tsx ← 目玉

3. フィルター機能
   - 年度選択
   - 国籍フィルター
   - 罪種フィルター

4. スタイリング
   - TailwindCSSで調整
   - ダークモード対応
```

---

### 4.4 フェーズ4: デプロイ ⏳

**優先度: 🟢 低（実装完了後）**

```
1. ビルド最適化
   - npm run build
   - バンドルサイズ確認

2. Cloudflare Pagesデプロイ
   - プロジェクト作成
   - dist/ ディレクトリをアップロード
   - カスタムドメイン設定（任意）

3. CI/CD設定（将来）
   - GitHub Actionsでビルド自動化
   - データ更新の自動化
```

---

## 5. トラブルシューティング

### 5.1 CSVパースエラー

**問題:** 文字化けが発生する
```
解決策: iconv-liteでShift-JIS変換を確認
const iconv = require('iconv-lite');
const utf8 = iconv.decode(buffer, 'Shift_JIS');
```

**問題:** 数値パースに失敗する
```
解決策: カンマを除去してからparseInt
const num = parseInt(value.replace(/,/g, ''), 10) || 0;
```

### 5.2 開発サーバーエラー

**問題:** npm run dev が起動しない
```
解決策:
1. node_modules削除 → npm install
2. package-lock.json削除 → npm install
3. Node.jsバージョン確認（22系推奨）
```

### 5.3 型エラー

**問題:** TypeScriptの型エラー
```
解決策: frontend/src/types/crime-data.ts を確認
生成するJSONがインターフェースに準拠しているか確認
```

---

## 6. 参考リンク

### 公式ドキュメント
- **e-Stat**: https://www.e-stat.go.jp/
- **e-Stat API**: https://www.e-stat.go.jp/api/
- **React**: https://react.dev/
- **Vite**: https://vite.dev/
- **TailwindCSS**: https://tailwindcss.com/
- **ApexCharts**: https://apexcharts.com/

### データソース
- **警察庁 犯罪統計**: https://www.npa.go.jp/publications/statistics/
- **法務省 在留外国人統計**: https://www.moj.go.jp/isa/policies/statistics/

### 開発ツール
- **iconv-lite**: https://www.npmjs.com/package/iconv-lite
- **csv-parse**: https://www.npmjs.com/package/csv-parse

---

## 📝 変更履歴

- **2026-05-14**: プロジェクト初期化、React セットアップ、データ構造設計、CSV パース仕様策定
