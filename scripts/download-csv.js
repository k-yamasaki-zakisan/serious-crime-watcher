#!/usr/bin/env node

/**
 * CSVダウンロードヘルパースクリプト
 * e-Stat から犯罪統計CSVを検索・ダウンロード
 */

const fs = require('fs');
const path = require('path');

// .envファイルを読み込み
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
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
}

loadEnv();

const APP_ID = process.env.ESTAT_APP_ID;
const BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app';

/**
 * 手動ダウンロード用の情報を表示
 */
function showDownloadInstructions() {
  console.log('📥 犯罪統計CSVのダウンロード手順');
  console.log('');
  console.log('🌐 e-Stat ポータルサイトを使用（推奨）:');
  console.log('');
  console.log('1. https://www.e-stat.go.jp/ にアクセス');
  console.log('2. 検索窓に「来日外国人犯罪」または「犯罪統計」と入力');
  console.log('3. 検索結果から警察庁の統計を選択');
  console.log('4. 年度を選択（例：令和4年、令和5年）');
  console.log('5. CSVファイルをダウンロード');
  console.log('6. データフォルダに配置: ../data/r{年度}_{期間}.csv');
  console.log('');
  console.log('📁 推奨ファイル名形式:');
  console.log('   - r04_1-12.csv  (令和4年 1-12月)');
  console.log('   - r05_1-12.csv  (令和5年 1-12月)');
  console.log('   - r06_1-3.csv   (令和6年 1-3月)');
  console.log('');
  console.log('⚠️  注意事項:');
  console.log('   - ファイルはShift-JISエンコーディングで保存される');
  console.log('   - ファイルサイズは通常100-200KB程度');
  console.log('   - 1つのCSVに複数の統計表が含まれている');
}

/**
 * 利用可能な統計データを検索
 */
async function searchAvailableStats() {
  if (!APP_ID) {
    console.log('⚠️ APIキーが設定されていないため、検索機能は利用できません');
    console.log('手動ダウンロード手順のみ表示します\n');
    showDownloadInstructions();
    return;
  }

  console.log('🔍 e-Stat API で利用可能な統計を検索中...');
  
  try {
    // より広範囲な検索を実行
    const searchTerms = ['犯罪', '警察', '検挙'];
    
    for (const term of searchTerms) {
      console.log(`\n🔎 検索語: "${term}"`);
      
      const searchUrl = `${BASE_URL}/json/getStatsList?appId=${APP_ID}&searchWord=${encodeURIComponent(term)}&statsCode=00130001&limit=50`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.GET_STATS_LIST && data.GET_STATS_LIST.TABLE_INF) {
        const tables = data.GET_STATS_LIST.TABLE_INF;
        console.log(`   検出: ${tables.length}件`);
        
        // 関連する統計を表示
        const relevantTables = tables.filter(table => {
          const title = (table.TITLE || '').toLowerCase();
          const statName = (table.STAT_NAME || '').toLowerCase();
          return title.includes('犯罪') || 
                 title.includes('検挙') || 
                 title.includes('外国人') ||
                 statName.includes('犯罪');
        });

        if (relevantTables.length > 0) {
          console.log(`   🎯 関連統計: ${relevantTables.length}件`);
          relevantTables.slice(0, 5).forEach((table, index) => {
            console.log(`      ${index + 1}. ${table.TITLE} (${table.SURVEY_DATE})`);
          });
        }
      } else {
        console.log('   📭 検索結果なし');
      }
    }
    
  } catch (error) {
    console.error('❌ 検索エラー:', error.message);
  }
  
  console.log('\n');
  showDownloadInstructions();
}

/**
 * サンプルCSVファイルの作成（テスト用）
 */
function createSampleCSV() {
  const samplePath = path.join(__dirname, '..', 'data', 'sample.csv');
  
  // サンプルデータ（実際の構造を模倣）
  const sampleContent = `第１２表,,,来日外国人による　重要犯罪・重要窃盗犯　国籍別　検挙人員　対前年比較,,,,,,,,,,,,暫定値,,
,,,,,,,,,,,,,,,,２０２６年５月１４日確定,,
,,,,,,,,,,,,,,,,,
,,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員,検挙人員
,,総数,総数,重要犯罪,重要犯罪,殺人,殺人,強盗,強盗,放火,放火,不同意性交等,不同意性交等,略取誘拐・人身売買,略取誘拐・人身売買,不同意わいせつ,不同意わいせつ,重要窃盗犯,重要窃盗犯,侵入盗,侵入盗,自動車盗,自動車盗,ひったくり,ひったくり,すり,すり
,,"2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月","2026年\n1〜３月","2025年\n1〜３月"
,アジア州,計,166,154,77,77,12,7,23,14,1,0,14,20,1,8,26,28,89,77,48,40,15,11,2,5,24,21
,アジア州,中国,32,32,18,19,3,2,4,4,0,0,5,5,0,1,6,7,14,13,10,9,2,1,0,1,2,2
,アジア州,ベトナム,69,70,21,26,7,4,11,8,0,0,1,4,0,6,2,4,48,44,26,22,9,6,1,3,12,13
,アジア州,フィリピン,15,12,8,7,1,0,2,1,0,0,3,3,0,0,2,3,7,5,3,2,1,1,0,0,3,2
第１３表,,,,来日外国人による　刑法犯・特別法犯　検挙件数・検挙人員　対前年比較,,,,,,,,,,,,暫定値,,,,,,,,,,
,,,,,,,,,,,,,,,,２０２６年５月１４日確定,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,検挙件数,検挙件数,検挙件数,検挙件数,検挙人員,検挙人員,検挙人員,検挙人員,検挙件数,検挙件数,検挙件数,検挙件数,検挙人員,検挙人員,検挙人員,検挙人員,,,,,,,,,
,,"刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯","刑法犯\n特別法犯",刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,刑法犯,,,,,,,,,
,,"2026年\n1〜３月","2025年\n1〜３月",増減,増減率（％）,"2026年\n1〜３月","2025年\n1〜３月",増減,増減率（％）,"2026年\n1〜３月","2025年\n1〜３月",増減,増減率（％）,"2026年\n1〜３月","2025年\n1〜３月",増減,増減率（％）,,,,,,,,,
総数,,2186,2596,-410,-15.8,1265,1487,-222,-14.9,1440,1606,-166,-10.3,701,763,-62,-8.1,,,,,,,,,
北海道,計,16,12,4,33.3,12,7,5,71.4,5,9,-4,-44.4,4,4,0,0.0,,,,,,,,,
東京都,,540,475,65,13.7,289,320,-31,-9.7,343,267,76,28.5,137,159,-22,-13.8,,,,,,,,,
大阪府,,312,298,14,4.7,198,201,-3,-1.5,216,191,25,13.1,123,108,15,13.9,,,,,,,,,`;

  // dataディレクトリの作成
  const dataDir = path.dirname(samplePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // サンプルファイル作成
  fs.writeFileSync(samplePath, sampleContent, 'utf8');
  
  console.log('📄 テスト用サンプルCSVを作成しました:');
  console.log(`   ファイル: ${samplePath}`);
  console.log('');
  console.log('🧪 変換テストを実行するには:');
  console.log(`   cd scripts`);
  console.log(`   node convert-csv-to-json.js ../data/sample.csv`);
}

// メイン実行
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--sample') || args.includes('-s')) {
    createSampleCSV();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('使用方法:');
    console.log('  node download-csv.js              # 利用可能な統計を検索');
    console.log('  node download-csv.js --sample     # テスト用サンプルCSVを作成');
    console.log('  node download-csv.js --help       # このヘルプを表示');
    return;
  }
  
  await searchAvailableStats();
}

main().catch(console.error);