#!/usr/bin/env node

/**
 * データバリデーションスクリプト
 * 
 * 生成されたJSONファイルの妥当性を検証
 * 
 * 使用方法:
 *   node validate-data.js <jsonファイルパス>
 * 
 * 例:
 *   node validate-data.js ../public/data/test-utf8.json
 */

const fs = require('fs');
const path = require('path');

/**
 * JSONファイルを読み込んでバリデーション
 * @param {string} jsonFilePath - JSONファイルパス
 */
function validateData(jsonFilePath) {
  console.log('🔍 データバリデーション開始...\n');
  console.log(`📁 対象ファイル: ${jsonFilePath}`);

  try {
    // 1. ファイル存在確認
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`ファイルが見つかりません: ${jsonFilePath}`);
    }

    // 2. JSON読み込み
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const data = JSON.parse(jsonContent);

    let errors = [];
    let warnings = [];

    // 3. 基本構造の検証
    console.log('📋 基本構造を検証中...');
    
    if (!data.metadata) {
      errors.push('metadata フィールドが存在しません');
    } else {
      validateMetadata(data.metadata, errors, warnings);
    }

    if (!data.foreignerCrimes) {
      errors.push('foreignerCrimes フィールドが存在しません');
    } else {
      validateForeignerCrimes(data.foreignerCrimes, errors, warnings);
    }

    if (!data.japaneseCrimes) {
      warnings.push('japaneseCrimes フィールドが存在しません（オプション）');
    } else {
      validateJapaneseCrimes(data.japaneseCrimes, errors, warnings);
    }

    // 4. 結果の出力
    console.log('\n📊 バリデーション結果:');
    
    if (errors.length === 0) {
      console.log('✅ エラーなし - データは有効です');
    } else {
      console.log(`❌ エラー ${errors.length}件:`);
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (warnings.length > 0) {
      console.log(`⚠️ 警告 ${warnings.length}件:`);
      warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    // 5. 統計情報の表示
    displayStatistics(data);

    return { errors: errors.length, warnings: warnings.length };

  } catch (error) {
    console.error('❌ バリデーション失敗:', error.message);
    return { errors: 1, warnings: 0 };
  }
}

/**
 * メタデータの検証
 * @param {object} metadata - メタデータオブジェクト
 * @param {Array} errors - エラー配列
 * @param {Array} warnings - 警告配列
 */
function validateMetadata(metadata, errors, warnings) {
  const requiredFields = ['year', 'period', 'dataSource', 'retrievedDate', 'version'];
  
  requiredFields.forEach(field => {
    if (metadata[field] === undefined || metadata[field] === '') {
      errors.push(`metadata.${field} が設定されていません`);
    }
  });

  // 年度の妥当性チェック
  if (metadata.year) {
    const year = parseInt(metadata.year);
    if (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 5) {
      errors.push(`不正な年度: ${metadata.year}`);
    }
  }

  // 取得日の形式チェック
  if (metadata.retrievedDate && !/^\d{4}-\d{2}-\d{2}$/.test(metadata.retrievedDate)) {
    warnings.push(`取得日の形式が推奨形式(YYYY-MM-DD)ではありません: ${metadata.retrievedDate}`);
  }
}

/**
 * 外国人犯罪データの検証
 * @param {object} foreignerCrimes - 外国人犯罪データ
 * @param {Array} errors - エラー配列
 * @param {Array} warnings - 警告配列
 */
function validateForeignerCrimes(foreignerCrimes, errors, warnings) {
  // total フィールドの検証
  if (!foreignerCrimes.total) {
    errors.push('foreignerCrimes.total が存在しません');
  } else {
    const total = foreignerCrimes.total;
    ['cases', 'persons', 'criminalCases', 'criminalPersons'].forEach(field => {
      if (typeof total[field] !== 'number' || total[field] < 0) {
        errors.push(`foreignerCrimes.total.${field} は0以上の数値である必要があります`);
      }
    });

    // 論理的整合性チェック
    if (total.criminalCases > total.cases) {
      errors.push('刑法犯件数が総件数を上回っています');
    }
    if (total.criminalPersons > total.persons) {
      errors.push('刑法犯人員が総人員を上回っています');
    }
  }

  // 国籍別データの検証
  if (!foreignerCrimes.byNationality || !Array.isArray(foreignerCrimes.byNationality)) {
    warnings.push('byNationality が配列ではないか存在しません');
  } else {
    foreignerCrimes.byNationality.forEach((item, index) => {
      if (!item.region || !item.country) {
        errors.push(`byNationality[${index}] に region または country が設定されていません`);
      }
      if (typeof item.totalPersons !== 'number' || item.totalPersons < 0) {
        errors.push(`byNationality[${index}].totalPersons は0以上の数値である必要があります`);
      }
    });
  }

  // 都道府県別データの検証
  if (!foreignerCrimes.byPrefecture || !Array.isArray(foreignerCrimes.byPrefecture)) {
    warnings.push('byPrefecture が配列ではないか存在しません');
  } else {
    foreignerCrimes.byPrefecture.forEach((item, index) => {
      if (!item.prefecture) {
        errors.push(`byPrefecture[${index}].prefecture が設定されていません`);
      }
      ['totalCases', 'totalPersons', 'criminalCases', 'criminalPersons'].forEach(field => {
        if (typeof item[field] !== 'number' || item[field] < 0) {
          errors.push(`byPrefecture[${index}].${field} は0以上の数値である必要があります`);
        }
      });

      // 論理的整合性チェック
      if (item.criminalCases > item.totalCases) {
        errors.push(`byPrefecture[${index}] (${item.prefecture}): 刑法犯件数が総件数を上回っています`);
      }
      if (item.criminalPersons > item.totalPersons) {
        errors.push(`byPrefecture[${index}] (${item.prefecture}): 刑法犯人員が総人員を上回っています`);
      }
    });
  }
}

/**
 * 日本人犯罪データの検証
 * @param {object} japaneseCrimes - 日本人犯罪データ
 * @param {Array} errors - エラー配列
 * @param {Array} warnings - 警告配列
 */
function validateJapaneseCrimes(japaneseCrimes, errors, warnings) {
  ['totalCases', 'totalPersons', 'totalPopulation', 'crimeRatePer100k'].forEach(field => {
    if (typeof japaneseCrimes[field] !== 'number' || japaneseCrimes[field] < 0) {
      warnings.push(`japaneseCrimes.${field} は0以上の数値である必要があります`);
    }
  });

  // 犯罪率の計算チェック
  if (japaneseCrimes.totalPopulation > 0 && japaneseCrimes.totalPersons > 0) {
    const expectedRate = (japaneseCrimes.totalPersons / japaneseCrimes.totalPopulation) * 100000;
    const actualRate = japaneseCrimes.crimeRatePer100k;
    const diff = Math.abs(expectedRate - actualRate);
    
    if (diff > 0.1) {
      warnings.push(`犯罪率の計算値と設定値に差異があります (期待値: ${expectedRate.toFixed(2)}, 実際値: ${actualRate})`);
    }
  }
}

/**
 * 統計情報を表示
 * @param {object} data - データオブジェクト
 */
function displayStatistics(data) {
  console.log('\n📈 統計情報:');
  
  if (data.metadata) {
    console.log(`   年度: ${data.metadata.year} (${data.metadata.period})`);
    console.log(`   データソース: ${data.metadata.dataSource}`);
    console.log(`   取得日: ${data.metadata.retrievedDate}`);
  }

  if (data.foreignerCrimes) {
    const fc = data.foreignerCrimes;
    console.log(`   外国人犯罪総数: ${fc.total?.cases || 0}件 / ${fc.total?.persons || 0}人`);
    console.log(`   国籍/地域数: ${fc.byNationality?.length || 0}`);
    console.log(`   都道府県数: ${fc.byPrefecture?.length || 0}`);
    
    if (fc.byPrefecture && fc.byPrefecture.length > 0) {
      const topPrefecture = fc.byPrefecture.reduce((prev, current) => 
        (prev.totalCases > current.totalCases) ? prev : current
      );
      console.log(`   最多犯罪都道府県: ${topPrefecture.prefecture} (${topPrefecture.totalCases}件)`);
    }
  }

  if (data.japaneseCrimes && data.japaneseCrimes.totalCases > 0) {
    console.log(`   日本人犯罪: ${data.japaneseCrimes.totalCases}件 / ${data.japaneseCrimes.totalPersons}人`);
    console.log(`   日本人犯罪率: ${data.japaneseCrimes.crimeRatePer100k}人/10万人`);
  }
}

// コマンドライン実行
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('使用方法: node validate-data.js <jsonファイル>');
    console.log('');
    console.log('例:');
    console.log('  node validate-data.js ../public/data/test-utf8.json');
    console.log('  node validate-data.js ../public/data/2026/crime-data-2026.json');
    process.exit(1);
  }
  
  const jsonFilePath = args[0];
  const result = validateData(jsonFilePath);
  
  // 終了コード設定
  if (result.errors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateData };