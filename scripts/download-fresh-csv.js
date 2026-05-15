#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * 新しいCSVファイルをe-Statから直接ダウンロード
 * より確実にアクセスできるデータソースを試行
 */

async function downloadFreshCsv() {
  console.log('📥 新しい警察庁CSVデータダウンロード開始...\n');

  // より確実にアクセスできるURLのリスト
  const csvSources = [
    {
      name: '令和5年犯罪統計書（確定値）',
      url: 'https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040247461&fileKind=1',
      filename: 'police-statistics-2023-confirmed.csv'
    },
    {
      name: '令和4年犯罪統計書（確定値）',
      url: 'https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040128901&fileKind=1',
      filename: 'police-statistics-2022-confirmed.csv'
    },
    {
      name: '警察庁統計（月次データ）',
      url: 'https://www.e-stat.go.jp/stat-search/file-download?statInfId=000040019180&fileKind=1',
      filename: 'police-statistics-monthly.csv'
    }
  ];

  for (const source of csvSources) {
    console.log(`🌐 ${source.name} ダウンロード試行中...`);
    console.log(`URL: ${source.url}`);

    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/csv,application/csv,text/plain,*/*',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        }
      });

      console.log(`HTTP Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content-Length: ${response.headers.get('content-length')}`);

      if (response.ok) {
        // レスポンスのバイト配列として取得
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`✅ ダウンロード成功: ${buffer.length} bytes`);

        // ファイル保存
        const csvPath = path.join(process.cwd(), `../data/${source.filename}`);
        await fs.writeFile(csvPath, buffer);
        
        console.log(`💾 保存完了: ${csvPath}`);

        // 最初の数行をサンプル表示（バイナリセーフ）
        console.log('\n📄 ファイル内容サンプル:');
        const textSample = buffer.toString('utf8', 0, Math.min(500, buffer.length));
        const lines = textSample.split('\n');
        
        lines.slice(0, 5).forEach((line, index) => {
          if (line.trim()) {
            console.log(`  ${index + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          }
        });

        // エンコーディング推測
        const hasJapanese = /[ひらがなカタカナ漢字]/.test(textSample);
        const hasGarbled = textSample.includes('�') || textSample.includes('\ufffd');
        
        console.log('\n🧪 エンコーディング分析:');
        console.log(`  - 日本語文字検出: ${hasJapanese ? 'あり' : 'なし'}`);
        console.log(`  - 文字化け検出: ${hasGarbled ? 'あり' : 'なし'}`);
        
        if (!hasGarbled && (hasJapanese || textSample.includes(','))) {
          console.log('🎯 正常な読み込み成功 - このファイルを使用します');
          
          return {
            success: true,
            filePath: csvPath,
            fileName: source.filename,
            size: buffer.length,
            source: source.name,
            sampleContent: textSample
          };
        } else {
          console.log('⚠️ エンコーディング問題あり - 次のソースを試行');
        }
      } else {
        console.log(`❌ ダウンロード失敗: HTTP ${response.status}`);
      }

    } catch (error) {
      console.error(`❌ エラー (${source.name}):`, error.message);
    }

    console.log('---\n');
  }

  throw new Error('すべてのCSVソースでダウンロードに失敗しました');
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
  const result = await downloadFreshCsv();
  
  console.log('\n🎉 CSV取得完了');
  console.log(`📁 使用ファイル: ${result.fileName}`);
  console.log('次のステップ: CSVの構造解析と外国人データ抽出');
}

main().catch(console.error);