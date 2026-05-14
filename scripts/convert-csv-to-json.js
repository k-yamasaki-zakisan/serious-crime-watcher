#!/usr/bin/env node

/**
 * CSV → JSON 変換スクリプト
 * 
 * 警察庁の犯罪統計CSV（Shift-JIS）をプロジェクト用JSONに変換
 * 
 * 使用方法:
 *   node convert-csv-to-json.js <csvファイルパス> [出力ファイルパス]
 * 
 * 例:
 *   node convert-csv-to-json.js ../data/r08_1-3.csv ../public/data/2026/crime-data-2026.json
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const iconv = require('iconv-lite');

/**
 * 数値文字列をパースして数値に変換
 * @param {string} value - パースする値
 * @returns {number} - 変換された数値
 */
function parseNumber(value) {
  if (!value || value === '-' || value.trim() === '') return 0;
  // カンマを除去して数値変換
  const cleaned = value.replace(/,/g, '').trim();
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * CSVファイルの指定されたテーブルの開始行を見つける
 * @param {Array<string>} lines - CSVの行配列
 * @param {number} tableNumber - テーブル番号（12, 13など）
 * @returns {number} - テーブル開始行のインデックス
 */
function findTableStart(lines, tableNumber) {
  const tablePattern = tableNumber === 12 ? '第１２表' : '第１３表';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(tablePattern)) {
      console.log(`   ${tablePattern} 発見: 行 ${i + 1}`);
      return i;
    }
  }
  
  // デバッグ用: 「第」を含む行を表示
  console.log('   デバッグ: 「第」を含む行を検索中...');
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    if (line.includes('第')) {
      console.log(`     行 ${i + 1}: "${line.slice(0, 50)}..."`);
    }
  }
  
  return -1;
}

/**
 * 第12表（国籍別データ）をパース
 * @param {Array<Array<string>>} csvData - パース済みCSVデータ
 * @param {Array<string>} lines - 生のCSV行
 * @returns {Array<object>} - 国籍別データ配列
 */
function parseTable12(csvData, lines) {
  console.log('📊 第12表（国籍別データ）をパース中...');
  
  const table12Start = findTableStart(lines, 12);
  if (table12Start === -1) {
    console.warn('⚠️ 第12表が見つかりませんでした');
    return [];
  }

  console.log(`   開始行: ${table12Start + 1}`);
  
  const nationalityData = [];
  let currentRegion = '';
  
  // データ開始行を特定（ヘッダー行をスキップ）
  const dataStartRow = table12Start + 6; // 通常6行のヘッダー
  
  for (let i = dataStartRow; i < csvData.length; i++) {
    const row = csvData[i];
    if (!row || row.length < 10) continue;
    
    // 第13表に到達したら終了
    const lineText = lines[i] || '';
    if (lineText.includes('第１３表')) {
      console.log(`   第13表検出により終了: 行 ${i + 1}`);
      break;
    }
    
    // 空行をスキップ
    if (row.every(cell => !cell || cell.trim() === '')) continue;
    
    // デバッグ: データ行の内容を表示
    console.log(`   🐛 行${i + 1}: [${row[0]}|${row[1]}|${row[2]}|${row[3]}...]`);
    
    const region = row[1] ? row[1].trim() : currentRegion; // 列1に地域名
    const countryOrLabel = row[2] ? row[2].trim() : '';   // 列2に国名またはラベル
    
    console.log(`     地域: "${region}", 国/ラベル: "${countryOrLabel}"`);
    
    // 「計」行はスキップ
    if (countryOrLabel === '計') {
      console.log(`     → 計行をスキップ`);
      continue;
    }
    
    // 地域名の更新（regionに「州」が含まれている場合）
    if (region && region.includes('州') && countryOrLabel === '計') {
      currentRegion = region;
      console.log(`     → 地域更新: ${currentRegion}`);
      continue;
    }
    
    // 実際のデータ行を処理（countryOrLabelが実際の国名の場合）
    if (countryOrLabel && !countryOrLabel.includes('州') && countryOrLabel !== '計' && currentRegion) {
      console.log(`     → データ行として処理: ${countryOrLabel}`);
      const data = {
        region: currentRegion,
        country: countryOrLabel,
        totalPersons: parseNumber(row[3]), // 前年データではなく当年データを取得
        seriousCrimes: {
          total: parseNumber(row[4]),
          murder: parseNumber(row[6]),
          robbery: parseNumber(row[8]),
          arson: parseNumber(row[10]),
          sexualAssault: parseNumber(row[12]),
          abduction: parseNumber(row[14]),
          indecency: parseNumber(row[16])
        },
        seriousTheft: {
          total: parseNumber(row[18] || 0),
          burglary: parseNumber(row[20] || 0),
          autoTheft: parseNumber(row[22] || 0),
          snatching: parseNumber(row[24] || 0),
          pickpocketing: parseNumber(row[26] || 0)
        }
      };
      
      nationalityData.push(data);
      console.log(`   ${currentRegion} - ${countryOrLabel}: ${data.totalPersons}人`);
    }
  }
  
  console.log(`✅ 第12表パース完了: ${nationalityData.length}カ国/地域`);
  return nationalityData;
}

/**
 * 第13表（都道府県別データ）をパース
 * @param {Array<Array<string>>} csvData - パース済みCSVデータ
 * @param {Array<string>} lines - 生のCSV行
 * @returns {Array<object>} - 都道府県別データ配列
 */
function parseTable13(csvData, lines) {
  console.log('📊 第13表（都道府県別データ）をパース中...');
  
  const table13Start = findTableStart(lines, 13);
  if (table13Start === -1) {
    console.warn('⚠️ 第13表が見つかりませんでした');
    return [];
  }

  console.log(`   開始行: ${table13Start + 1}`);
  
  const prefectureData = [];
  const dataStartRow = table13Start + 6; // ヘッダー行をスキップ
  
  for (let i = dataStartRow; i < csvData.length; i++) {
    const row = csvData[i];
    if (!row || row.length < 15) continue;
    
    // 空行をスキップ
    if (row.every(cell => !cell || cell.trim() === '')) continue;
    
    const regionOrPrefecture = row[0];
    const prefectureOrLabel = row[1];
    
    // 地域の小計行（「計」）や総数行はスキップ
    if (prefectureOrLabel === '計' || regionOrPrefecture === '総数') continue;
    
    // 都道府県データを処理
    if (prefectureOrLabel && prefectureOrLabel.includes('都') || 
        prefectureOrLabel.includes('道') || 
        prefectureOrLabel.includes('府') || 
        prefectureOrLabel.includes('県')) {
      
      const data = {
        prefecture: prefectureOrLabel,
        totalCases: parseNumber(row[2]),
        totalPersons: parseNumber(row[6]),
        criminalCases: parseNumber(row[10]),
        criminalPersons: parseNumber(row[14])
      };
      
      prefectureData.push(data);
      console.log(`   ${prefectureOrLabel}: ${data.totalCases}件 / ${data.totalPersons}人`);
    }
  }
  
  console.log(`✅ 第13表パース完了: ${prefectureData.length}都道府県`);
  return prefectureData;
}

/**
 * メタデータを生成
 * @param {string} csvFilePath - CSVファイルパス
 * @returns {object} - メタデータオブジェクト
 */
function generateMetadata(csvFilePath) {
  const filename = path.basename(csvFilePath);
  
  // ファイル名から年度を推定 (r04_1-2.csv -> 2022年)
  let year = 2022; // デフォルト
  let period = '不明';
  
  const match = filename.match(/r(\d{2})_(\d+)-(\d+)\.csv/);
  if (match) {
    const reiwaYear = parseInt(match[1]);
    year = 2018 + reiwaYear; // 令和元年 = 2019年
    period = `${match[2]}-${match[3]}月`;
  }
  
  return {
    year: year,
    period: period,
    dataSource: 'e-Stat 警察庁犯罪統計',
    retrievedDate: new Date().toISOString().split('T')[0],
    notes: '検挙ベースの統計（暫定値）',
    version: '暫定値'
  };
}

/**
 * CSVファイルを読み込んでJSONに変換
 * @param {string} csvFilePath - CSVファイルパス
 * @param {string} outputPath - 出力JSONファイルパス
 */
async function convertCsvToJson(csvFilePath, outputPath) {
  try {
    console.log(`🔄 変換開始: ${csvFilePath}`);
    
    // 1. CSVファイル読み込み（Shift-JIS → UTF-8）
    console.log('📄 CSVファイル読み込み中...');
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSVファイルが見つかりません: ${csvFilePath}`);
    }
    
    const buffer = fs.readFileSync(csvFilePath);
    
    // ファイル名に基づいてエンコーディングを判定
    let utf8Content;
    if (csvFilePath.includes('utf8') || csvFilePath.includes('test-utf8')) {
      utf8Content = buffer.toString('utf8');
    } else {
      // Shift-JIS想定
      utf8Content = iconv.decode(buffer, 'Shift_JIS');
    }
    
    const lines = utf8Content.split(/\r?\n/);
    
    console.log(`   ファイルサイズ: ${(buffer.length / 1024).toFixed(1)}KB`);
    console.log(`   行数: ${lines.length}行`);
    
    // 2. CSVパース
    console.log('⚙️ CSVをパース中...');
    
    return new Promise((resolve, reject) => {
      const csvData = [];
      
      parse(utf8Content, {
        skip_empty_lines: false,
        relax_quotes: true,
        ltrim: true,
        rtrim: true,
        relax_column_count: true,  // 列数の不一致を許可
        escape: '"',
        quote: '"'
      }, (err, records) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`   パース完了: ${records.length}行`);
        
        // デバッグ: CSVデータの最初の10行を表示
        console.log('🐛 CSVデータの最初の10行:');
        records.slice(0, 10).forEach((row, index) => {
          console.log(`   行${index + 1}: [${row.slice(0, 3).join('|')}...]`);
        });
        
        // 3. テーブル別データ抽出
        const nationalityData = parseTable12(records, lines);
        const prefectureData = parseTable13(records, lines);
        
        // 4. 合計値を計算
        const totalPersons = nationalityData.reduce((sum, item) => sum + item.totalPersons, 0);
        const totalCases = prefectureData.reduce((sum, item) => sum + item.totalCases, 0);
        const totalCriminalCases = prefectureData.reduce((sum, item) => sum + item.criminalCases, 0);
        const totalCriminalPersons = prefectureData.reduce((sum, item) => sum + item.criminalPersons, 0);
        
        // 5. JSONデータ構造生成
        const jsonData = {
          metadata: generateMetadata(csvFilePath),
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
            // TODO: 日本人データは別途取得が必要
            totalCases: 0,
            totalPersons: 0,
            totalPopulation: 0,
            crimeRatePer100k: 0
          }
        };
        
        // 6. JSONファイル出力
        console.log('💾 JSONファイル出力中...');
        
        // 出力ディレクトリの作成
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
        
        console.log(`✅ 変換完了!`);
        console.log(`📁 出力ファイル: ${outputPath}`);
        console.log(`📊 統計:`)
        console.log(`   - 外国人検挙: ${totalPersons}人 / ${totalCases}件`);
        console.log(`   - 国籍/地域: ${nationalityData.length}種類`);
        console.log(`   - 都道府県: ${prefectureData.length}箇所`);
        
        resolve(jsonData);
      });
    });
    
  } catch (error) {
    console.error('❌ 変換エラー:', error.message);
    throw error;
  }
}

// コマンドライン実行
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('使用方法: node convert-csv-to-json.js <csvファイル> [出力ファイル]');
    console.log('');
    console.log('例:');
    console.log('  node convert-csv-to-json.js ../data/r08_1-3.csv');
    console.log('  node convert-csv-to-json.js ../data/r08_1-3.csv ../public/data/crime-data-2026.json');
    process.exit(1);
  }
  
  const csvFilePath = args[0];
  let outputPath = args[1];
  
  if (!outputPath) {
    // デフォルト出力パスを生成
    const basename = path.basename(csvFilePath, '.csv');
    outputPath = path.join(__dirname, '..', 'public', 'data', `${basename}.json`);
  }
  
  try {
    await convertCsvToJson(csvFilePath, outputPath);
  } catch (error) {
    console.error('変換に失敗しました:', error.message);
    process.exit(1);
  }
}

// スクリプト直接実行時のみmainを呼び出し
if (require.main === module) {
  main();
}

module.exports = { convertCsvToJson, parseNumber };