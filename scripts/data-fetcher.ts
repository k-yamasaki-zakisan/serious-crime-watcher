#!/usr/bin/env tsx

/**
 * TypeScript データ取得・変換スクリプト
 * 
 * e-Stat API から直接データを取得してTypeScript型安全なJSONを生成
 * 
 * 使用方法:
 *   npx tsx data-fetcher.ts --year 2022
 *   npx tsx data-fetcher.ts --statsId 0003090287
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules での __dirname 代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトの型定義をインポート
interface CrimeDataset {
  metadata: Metadata;
  foreignerCrimes: ForeignerCrimes;
  japaneseCrimes: JapaneseCrimes;
}

interface Metadata {
  year: number;
  period: string;
  dataSource: string;
  retrievedDate: string;
  notes: string;
  version: string;
}

interface ForeignerCrimes {
  total: TotalCrimes;
  byNationality: NationalityData[];
  byPrefecture: PrefectureData[];
  byCrimeType?: CrimeTypeData[];
  byResidenceStatus?: ResidenceStatusData[];
  byAgeGroup?: AgeGroupData[];
}

interface TotalCrimes {
  cases: number;
  persons: number;
  criminalCases: number;
  criminalPersons: number;
}

interface NationalityData {
  region: string;
  country: string;
  totalPersons: number;
  seriousCrimes: SeriousCrimes;
  seriousTheft: SeriousTheft;
  residentPopulation?: number;
  crimeRatePer100k?: number;
}

interface SeriousCrimes {
  total: number;
  murder: number;
  robbery: number;
  arson: number;
  sexualAssault: number;
  abduction: number;
  indecency: number;
}

interface SeriousTheft {
  total: number;
  burglary: number;
  autoTheft: number;
  snatching: number;
  pickpocketing: number;
}

interface PrefectureData {
  prefecture: string;
  totalCases: number;
  totalPersons: number;
  criminalCases: number;
  criminalPersons: number;
}

interface JapaneseCrimes {
  totalCases: number;
  totalPersons: number;
  totalPopulation: number;
  crimeRatePer100k: number;
  byAgeGroup?: AgeGroupData[];
}

interface AgeGroupData {
  ageGroup: string;
  persons: number;
  population: number;
  crimeRatePer100k: number;
}

interface CrimeTypeData {
  type: string;
  cases: number;
  persons: number;
}

interface ResidenceStatusData {
  status: string;
  persons: number;
  cases: number;
}

// e-Stat API レスポンス型
interface EStatResponse {
  GET_STATS_LIST?: {
    TABLE_INF: Array<{
      '@id': string;
      TITLE: string;
      STAT_NAME: string;
      SURVEY_DATE: string;
      UPDATED_DATE: string;
    }>;
  };
  GET_STATS_DATA?: {
    RESULT: {
      STATUS: number;
      ERROR_MSG: string;
    };
    STATISTICAL_DATA: {
      DATA_INF: {
        VALUE: Array<{
          $: string;
          [key: string]: string;
        }>;
      };
    };
  };
}

class CrimeDataFetcher {
  private apiId: string;
  private baseUrl = 'https://api.e-stat.go.jp/rest/3.0/app';

  constructor() {
    this.loadEnv();
    this.apiId = process.env.ESTAT_APP_ID || '';
    
    if (!this.apiId) {
      throw new Error('ESTAT_APP_ID が設定されていません。.envファイルを確認してください。');
    }
  }

  /**
   * .envファイルを読み込み
   */
  private loadEnv(): void {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️ .envファイルが見つかりません');
      return;
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  }

  /**
   * 来日外国人犯罪統計を検索
   */
  async searchCrimeStats(): Promise<Array<{id: string, title: string, year: string}>> {
    console.log('🔍 来日外国人犯罪統計を検索中...');

    const searchTerms = ['来日外国人', '外国人犯罪', '犯罪統計'];
    const allResults: Array<{id: string, title: string, year: string}> = [];

    for (const term of searchTerms) {
      try {
        const url = `${this.baseUrl}/json/getStatsList?appId=${this.apiId}&searchWord=${encodeURIComponent(term)}&statsCode=00130001&limit=50`;
        
        const response = await fetch(url);
        const data: EStatResponse = await response.json();

        if (data.GET_STATS_LIST?.TABLE_INF) {
          const relevantTables = data.GET_STATS_LIST.TABLE_INF.filter(table => 
            table.TITLE.includes('外国人') || 
            table.TITLE.includes('犯罪') ||
            table.STAT_NAME.includes('犯罪')
          );

          for (const table of relevantTables) {
            allResults.push({
              id: table['@id'],
              title: table.TITLE,
              year: table.SURVEY_DATE
            });
          }
        }
      } catch (error) {
        console.warn(`検索エラー (${term}):`, error);
      }
    }

    // 重複除去
    const uniqueResults = allResults.filter((item, index, self) =>
      index === self.findIndex(t => t.id === item.id)
    );

    console.log(`✅ ${uniqueResults.length}件の統計データを発見`);
    return uniqueResults;
  }

  /**
   * 指定された統計IDからデータを取得
   */
  async fetchStatData(statsId: string): Promise<CrimeDataset | null> {
    console.log(`📊 統計データ取得中: ${statsId}`);

    try {
      const url = `${this.baseUrl}/json/getStatsData?appId=${this.apiId}&statsDataId=${statsId}&limit=100000`;
      
      const response = await fetch(url);
      const data: EStatResponse = await response.json();

      if (!data.GET_STATS_DATA || data.GET_STATS_DATA.RESULT.STATUS !== 0) {
        console.error('データ取得失敗:', data.GET_STATS_DATA?.RESULT.ERROR_MSG);
        return null;
      }

      return this.transformToProjectFormat(data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE, statsId);

    } catch (error) {
      console.error('API呼び出しエラー:', error);
      return null;
    }
  }

  /**
   * APIレスポンスをプロジェクト形式に変換
   */
  private transformToProjectFormat(apiData: Array<{$: string; [key: string]: string}>, statsId: string): CrimeDataset {
    console.log('🔄 データ形式変換中...');

    // サンプル実装 - 実際のAPIレスポンス構造に基づいて調整が必要
    const metadata: Metadata = {
      year: new Date().getFullYear(), // APIデータから抽出
      period: '年間', // APIデータから抽出
      dataSource: 'e-Stat 警察庁犯罪統計 (API)',
      retrievedDate: new Date().toISOString().split('T')[0],
      notes: 'API経由で取得したデータ',
      version: '確定値'
    };

    // 国籍別データの変換ロジック
    const nationalityData: NationalityData[] = this.extractNationalityData(apiData);
    
    // 都道府県別データの変換ロジック  
    const prefectureData: PrefectureData[] = this.extractPrefectureData(apiData);

    // 合計値の計算
    const totalPersons = nationalityData.reduce((sum, item) => sum + item.totalPersons, 0);
    const totalCases = prefectureData.reduce((sum, item) => sum + item.totalCases, 0);
    const totalCriminalCases = prefectureData.reduce((sum, item) => sum + item.criminalCases, 0);
    const totalCriminalPersons = prefectureData.reduce((sum, item) => sum + item.criminalPersons, 0);

    const result: CrimeDataset = {
      metadata,
      foreignerCrimes: {
        total: {
          cases: totalCases,
          persons: totalPersons,
          criminalCases: totalCriminalCases,
          criminalPersons: totalCriminalPersons
        },
        byNationality: nationalityData,
        byPrefecture: prefectureData
      },
      japaneseCrimes: {
        totalCases: 0, // 別途取得が必要
        totalPersons: 0,
        totalPopulation: 0,
        crimeRatePer100k: 0
      }
    };

    return result;
  }

  /**
   * 国籍別データを抽出（仮実装）
   */
  private extractNationalityData(apiData: Array<{$: string; [key: string]: string}>): NationalityData[] {
    // 実際のAPIレスポンス構造に基づいて実装
    // ここでは空配列を返す（実装が必要）
    console.log('⚠️ 国籍別データ抽出は未実装');
    return [];
  }

  /**
   * 都道府県別データを抽出（仮実装）
   */
  private extractPrefectureData(apiData: Array<{$: string; [key: string]: string}>): PrefectureData[] {
    // 実際のAPIレスポンス構造に基づいて実装
    // ここでは空配列を返す（実装が必要）
    console.log('⚠️ 都道府県別データ抽出は未実装');
    return [];
  }

  /**
   * JSONファイルとして出力
   */
  async saveAsJson(data: CrimeDataset, outputPath?: string): Promise<string> {
    const finalOutputPath = outputPath || path.join(__dirname, '..', 'public', 'data', `crime-data-${data.metadata.year}.json`);
    
    // ディレクトリ作成
    const outputDir = path.dirname(finalOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSON出力
    fs.writeFileSync(finalOutputPath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ JSONファイル出力完了: ${finalOutputPath}`);
    return finalOutputPath;
  }
}

/**
 * コマンドライン実行
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  try {
    const fetcher = new CrimeDataFetcher();

    if (args.includes('--search')) {
      // 統計データ検索
      const results = await fetcher.searchCrimeStats();
      
      console.log('\n📋 利用可能な統計データ:');
      results.forEach((item, index) => {
        console.log(`${index + 1}. [${item.year}] ${item.title}`);
        console.log(`   統計ID: ${item.id}\n`);
      });

      if (results.length > 0) {
        console.log('💡 データ取得するには:');
        console.log(`npx tsx data-fetcher.ts --statsId ${results[0].id}`);
      }

    } else if (args.includes('--statsId')) {
      // 特定の統計IDからデータ取得
      const statsIdIndex = args.indexOf('--statsId');
      const statsId = args[statsIdIndex + 1];
      
      if (!statsId) {
        console.error('❌ 統計IDを指定してください');
        process.exit(1);
      }

      const data = await fetcher.fetchStatData(statsId);
      
      if (data) {
        const outputPath = await fetcher.saveAsJson(data);
        console.log(`🎉 データ取得完了: ${outputPath}`);
      } else {
        console.error('❌ データ取得に失敗しました');
        process.exit(1);
      }

    } else {
      // ヘルプ表示
      console.log('🔧 TypeScript Crime Data Fetcher');
      console.log('');
      console.log('使用方法:');
      console.log('  npx tsx data-fetcher.ts --search              # 利用可能な統計を検索');
      console.log('  npx tsx data-fetcher.ts --statsId <ID>        # 指定IDのデータを取得');
      console.log('');
      console.log('例:');
      console.log('  npx tsx data-fetcher.ts --search');
      console.log('  npx tsx data-fetcher.ts --statsId 0003090287');
      console.log('');
      console.log('⚠️ 事前に .env ファイルで ESTAT_APP_ID を設定してください');
    }

  } catch (error) {
    console.error('❌ 実行エラー:', error);
    process.exit(1);
  }
}

// スクリプト直接実行時のみmainを呼び出し
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CrimeDataFetcher };
export type { CrimeDataset, NationalityData, PrefectureData };