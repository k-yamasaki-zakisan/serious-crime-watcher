#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import iconv from 'iconv-lite';

/**
 * CSVファイルの文字エンコーディングを検出・変換して解析
 */

async function parseCsvWithEncoding() {
  console.log('🔧 CSV文字エンコーディング変換開始...\n');

  try {
    const csvPath = path.join(process.cwd(), '../data/police-crime-statistics-alternative.csv');
    
    // バイナリデータとして読み込み
    console.log('📖 CSVファイル読み込み中...');
    const buffer = await fs.readFile(csvPath);
    
    console.log(`📏 ファイルサイズ: ${buffer.length} bytes`);
    
    // 複数のエンコーディングを試す
    const encodings = ['shift_jis', 'utf8', 'euc-jp', 'iso-2022-jp'];
    let decodedContent = null;
    let successfulEncoding = null;
    
    for (const encoding of encodings) {
      try {
        console.log(`🧪 ${encoding} エンコーディングを試行中...`);
        const decoded = iconv.decode(buffer, encoding);
        
        // 文字化けチェック（簡易）
        const hasGarbled = decoded.includes('�') || decoded.includes('・・');
        const hasJapanese = /[ひらがなカタカナ漢字]/.test(decoded.substring(0, 1000));
        
        console.log(`  - 文字化け検出: ${hasGarbled ? 'あり' : 'なし'}`);
        console.log(`  - 日本語検出: ${hasJapanese ? 'あり' : 'なし'}`);
        
        if (!hasGarbled && hasJapanese) {
          decodedContent = decoded;
          successfulEncoding = encoding;
          console.log(`✅ ${encoding} で正常に読み込み完了`);
          break;
        }
      } catch (error) {
        console.log(`  ❌ ${encoding} 変換エラー: ${error.message}`);
      }
    }
    
    if (!decodedContent) {
      throw new Error('適切なエンコーディングが見つかりません');
    }
    
    console.log(`\n🎯 使用エンコーディング: ${successfulEncoding}`);
    
    // UTF-8で保存
    const utf8CsvPath = path.join(process.cwd(), '../data/police-crime-statistics-utf8.csv');
    await fs.writeFile(utf8CsvPath, decodedContent, 'utf-8');
    console.log(`💾 UTF-8変換完了: ${utf8CsvPath}`);
    
    // CSV構造を解析
    const lines = decodedContent.split('\n').filter(line => line.trim());
    console.log(`\n📊 CSV構造分析:`);
    console.log(`  - 総行数: ${lines.length}`);
    
    // ヘッダー分析
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      console.log(`  - 列数: ${headers.length}`);
      console.log(`\n📋 ヘッダー列:`);
      headers.forEach((header, index) => {
        if (header) {
          console.log(`    ${index + 1}: ${header}`);
        }
      });
    }
    
    // サンプルデータ表示
    console.log(`\n📄 最初の5行のサンプル:`);
    lines.slice(0, 5).forEach((line, index) => {
      console.log(`  ${index + 1}: ${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
    });
    
    // 外国人関連データを検索
    console.log(`\n🔍 外国人関連キーワード検索:`);
    const keywords = ['外国人', '来日', '国籍', 'foreign', '外国', '韓国', '中国', 'ベトナム', 'フィリピン'];
    const matchedLines = [];
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      for (const keyword of keywords) {
        if (line.includes(keyword) || lowerLine.includes(keyword.toLowerCase())) {
          matchedLines.push({ 
            lineNumber: index + 1, 
            content: line, 
            keyword: keyword 
          });
          break;
        }
      }
    });
    
    if (matchedLines.length > 0) {
      console.log(`🎯 外国人関連データ: ${matchedLines.length}行発見`);
      matchedLines.slice(0, 10).forEach((match, index) => {
        console.log(`  ${index + 1}. [行${match.lineNumber}] (${match.keyword}): ${match.content.substring(0, 100)}...`);
      });
    } else {
      console.log('⚠️ 外国人関連キーワードが見つかりませんでした');
      
      // より広範囲な検索
      console.log('\n🔍 犯罪統計キーワード検索:');
      const crimeKeywords = ['犯罪', '検挙', '事件', '統計', '件数', '人員', '重要'];
      const crimeMatches = [];
      
      lines.forEach((line, index) => {
        for (const keyword of crimeKeywords) {
          if (line.includes(keyword)) {
            crimeMatches.push({ lineNumber: index + 1, content: line, keyword: keyword });
            break;
          }
        }
      });
      
      if (crimeMatches.length > 0) {
        console.log(`📈 犯罪統計関連: ${crimeMatches.length}行`);
        crimeMatches.slice(0, 5).forEach((match, index) => {
          console.log(`  ${index + 1}. [行${match.lineNumber}] (${match.keyword}): ${match.content.substring(0, 80)}...`);
        });
      }
    }
    
    return {
      utf8FilePath: utf8CsvPath,
      encoding: successfulEncoding,
      totalLines: lines.length,
      headers: lines.length > 0 ? lines[0].split(',').map(h => h.replace(/"/g, '').trim()) : [],
      foreignMatches: matchedLines.length,
      sampleLines: lines.slice(0, 5)
    };
    
  } catch (error) {
    console.error('❌ CSV解析エラー:', error.message);
    process.exit(1);
  }
}

parseCsvWithEncoding().catch(console.error);