#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * e-Stat 警察庁CSVファイルをダウンロードして解析
 * 年次統計（1～12月）を取得
 */

async function downloadEstatCsv() {
  console.log('📥 警察庁 CSV データダウンロード開始...\n');

  try {
    // 令和5年1～12月犯罪統計のCSV URL
    // デバッグ結果から最後のデータセット（年次全体）を選択
    const csvUrl = 'https://www.e-stat.go.jp/stat-search/file-download?&statInfId=000040128901&fileKind=1';
    
    console.log('🌐 CSV ファイルダウンロード中...');
    console.log(`URL: ${csvUrl}`);
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvContent = await response.text();
    
    console.log(`✅ ダウンロード完了: ${csvContent.length} 文字`);
    
    // CSVファイルを保存
    const csvPath = path.join(process.cwd(), '../data/police-crime-statistics-2023.csv');
    await fs.writeFile(csvPath, csvContent, 'utf-8');
    
    console.log(`💾 CSV保存完了: ${csvPath}`);
    
    // CSV構造を解析
    const lines = csvContent.split('\n');
    console.log(`\n📊 CSV構造分析:`);
    console.log(`  - 総行数: ${lines.length}`);
    console.log(`  - 最初の10行:`);
    
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`    ${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
    });
    
    // 外国人関連データを検索
    console.log(`\n🔍 外国人関連データ検索:`);
    const foreignRelatedLines = lines.filter((line, index) => {
      const lowerLine = line.toLowerCase();
      return lowerLine.includes('外国人') || 
             lowerLine.includes('来日') ||
             lowerLine.includes('国籍') ||
             lowerLine.includes('foreign');
    });
    
    if (foreignRelatedLines.length > 0) {
      console.log(`🎯 外国人関連行: ${foreignRelatedLines.length}行発見`);
      foreignRelatedLines.slice(0, 5).forEach((line, index) => {
        console.log(`  ${index + 1}: ${line.substring(0, 150)}...`);
      });
    } else {
      console.log('⚠️ 外国人関連データが見つかりませんでした');
      console.log('   このCSVは基本的な犯罪統計のみの可能性があります');
    }
    
    // ヘッダー行を分析
    console.log(`\n📋 ヘッダー分析:`);
    if (lines.length > 0) {
      const headers = lines[0].split(',');
      console.log(`  - 列数: ${headers.length}`);
      console.log(`  - 主要列:`);
      headers.slice(0, 10).forEach((header, index) => {
        console.log(`    ${index + 1}: ${header.replace(/"/g, '')}`);
      });
    }
    
    return {
      csvPath,
      totalLines: lines.length,
      foreignRelatedLines: foreignRelatedLines.length,
      headers: lines.length > 0 ? lines[0].split(',') : []
    };
    
  } catch (error) {
    console.error('❌ ダウンロードエラー:', error.message);
    
    // 代替アプローチ: 別の年次データを試す
    console.log('\n🔄 代替データの検索...');
    
    // より確実にアクセスできる最新の確定値データを試す
    try {
      const alternativeUrl = 'https://www.e-stat.go.jp/stat-search/file-download?&statInfId=000040247461&fileKind=1';
      console.log(`代替URL: ${alternativeUrl}`);
      
      const altResponse = await fetch(alternativeUrl);
      if (altResponse.ok) {
        const altCsvContent = await altResponse.text();
        const altCsvPath = path.join(process.cwd(), '../data/police-crime-statistics-alternative.csv');
        await fs.writeFile(altCsvPath, altCsvContent, 'utf-8');
        
        console.log(`✅ 代替データ取得成功: ${altCsvPath}`);
        return {
          csvPath: altCsvPath,
          totalLines: altCsvContent.split('\n').length,
          isAlternative: true
        };
      }
    } catch (altError) {
      console.log('代替データも取得できませんでした');
    }
    
    throw error;
  }
}

// データディレクトリを確保
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), '../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    console.log(`📁 データディレクトリ作成: ${dataDir}`);
  }
}

async function main() {
  await ensureDataDirectory();
  const result = await downloadEstatCsv();
  
  console.log('\n🎉 処理完了');
  console.log('次のステップ: CSVを解析して外国人犯罪データを抽出');
}

main().catch(console.error);