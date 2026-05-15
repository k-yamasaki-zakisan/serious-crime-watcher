#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import iconv from 'iconv-lite';

/**
 * ダウンロード済みCSVファイルのエンコーディングを強制的にShift-JISとして解釈
 */

async function fixCsvEncoding() {
  console.log('🔧 CSV文字エンコーディング修正開始...\n');

  try {
    // 最も新しいCSVファイルを使用
    const csvPath = path.join(process.cwd(), '../data/police-statistics-2023-confirmed.csv');
    
    console.log('📖 CSVファイル読み込み中...');
    const buffer = await fs.readFile(csvPath);
    console.log(`📏 ファイルサイズ: ${buffer.length} bytes`);
    
    // 強制的にShift-JISとして解釈
    console.log('🔄 Shift-JIS エンコーディングで強制デコード中...');
    const decodedContent = iconv.decode(buffer, 'shift_jis');
    
    // 成功をチェック
    const hasJapanese = /[ひらがなカタカナ漢字]/.test(decodedContent.substring(0, 2000));
    const hasGarbled = decodedContent.includes('�');
    
    console.log(`✓ 日本語文字検出: ${hasJapanese ? 'あり' : 'なし'}`);
    console.log(`✓ 文字化け検出: ${hasGarbled ? 'あり' : 'なし'}`);
    
    if (hasJapanese && !hasGarbled) {
      console.log('🎯 Shift-JISデコード成功！');
      
      // UTF-8で保存
      const utf8Path = path.join(process.cwd(), '../data/police-statistics-utf8.csv');
      await fs.writeFile(utf8Path, decodedContent, 'utf-8');
      console.log(`💾 UTF-8保存完了: ${utf8Path}`);
      
      // 構造解析
      const lines = decodedContent.split('\n').filter(line => line.trim());
      console.log(`\n📊 CSV構造解析:`);
      console.log(`  - 総行数: ${lines.length}`);
      
      // ヘッダー確認
      if (lines.length > 0) {
        console.log('\n📋 最初の10行:');
        lines.slice(0, 10).forEach((line, index) => {
          console.log(`  ${index + 1}: ${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
        });
      }
      
      // 外国人関連キーワード検索
      console.log('\n🔍 外国人関連データ検索:');
      const keywords = ['外国人', '来日', '国籍', '韓国', '中国', 'ベトナム', 'フィリピン', 'タイ', 'ブラジル', '外国'];
      const foreignMatches = [];
      
      lines.forEach((line, index) => {
        for (const keyword of keywords) {
          if (line.includes(keyword)) {
            foreignMatches.push({
              lineNumber: index + 1,
              keyword: keyword,
              content: line
            });
            break;
          }
        }
      });
      
      if (foreignMatches.length > 0) {
        console.log(`🎯 外国人関連データ発見: ${foreignMatches.length}行`);
        foreignMatches.slice(0, 15).forEach((match, index) => {
          console.log(`  ${index + 1}. [行${match.lineNumber}] (${match.keyword}): ${match.content.substring(0, 100)}...`);
        });
      } else {
        console.log('⚠️ 外国人関連キーワードが見つかりませんでした');
        
        // 一般的な犯罪統計キーワード検索
        console.log('\n📈 犯罪統計キーワード検索:');
        const crimeKeywords = ['犯罪', '検挙', '重要', '統計', '件数', '人員'];
        const crimeMatches = [];
        
        lines.forEach((line, index) => {
          for (const keyword of crimeKeywords) {
            if (line.includes(keyword)) {
              crimeMatches.push({ lineNumber: index + 1, keyword, content: line });
              break;
            }
          }
        });
        
        if (crimeMatches.length > 0) {
          console.log(`📊 犯罪統計関連: ${crimeMatches.length}行`);
          crimeMatches.slice(0, 10).forEach((match, index) => {
            console.log(`  ${index + 1}. [行${match.lineNumber}] (${match.keyword}): ${match.content.substring(0, 100)}...`);
          });
        }
      }
      
      return {
        success: true,
        utf8FilePath: utf8Path,
        totalLines: lines.length,
        foreignMatches: foreignMatches.length,
        sampleLines: lines.slice(0, 5)
      };
      
    } else {
      console.log('❌ Shift-JISデコードも失敗');
      
      // 他のエンコーディングも試してみる
      const otherEncodings = ['euc-jp', 'cp932', 'windows-31j'];
      
      for (const encoding of otherEncodings) {
        try {
          console.log(`🧪 ${encoding} を試行中...`);
          const testDecode = iconv.decode(buffer, encoding);
          const testHasJapanese = /[ひらがなカタカナ漢字]/.test(testDecode.substring(0, 1000));
          const testHasGarbled = testDecode.includes('�');
          
          if (testHasJapanese && !testHasGarbled) {
            console.log(`✅ ${encoding} で成功！`);
            
            const utf8Path = path.join(process.cwd(), '../data/police-statistics-utf8.csv');
            await fs.writeFile(utf8Path, testDecode, 'utf-8');
            console.log(`💾 UTF-8保存完了: ${utf8Path}`);
            
            return {
              success: true,
              utf8FilePath: utf8Path,
              encoding: encoding
            };
          }
        } catch (error) {
          console.log(`  ❌ ${encoding} エラー: ${error.message}`);
        }
      }
      
      throw new Error('適切なエンコーディングが見つかりませんでした');
    }
    
  } catch (error) {
    console.error('❌ エンコーディング修正エラー:', error.message);
    throw error;
  }
}

fixCsvEncoding().catch(console.error);