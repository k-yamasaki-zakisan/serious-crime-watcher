#!/usr/bin/env node

/**
 * e-Stat API 接続テストスクリプト
 * 
 * このスクリプトは以下をテストします：
 * 1. API接続の確認
 * 2. 来日外国人犯罪統計データの検索
 * 3. 統計表IDの取得
 */

const fs = require('fs');
const path = require('path');

// .envファイルを読み込み
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .envファイルが見つかりません');
    console.log('📝 .env.exampleを.envにコピーして、APIキーを設定してください');
    process.exit(1);
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

loadEnv();

const APP_ID = process.env.ESTAT_APP_ID;
const BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app';

if (!APP_ID) {
  console.error('❌ ESTAT_APP_IDが設定されていません');
  process.exit(1);
}

async function testApiConnection() {
  console.log('🔍 e-Stat API 接続テスト開始...\n');

  try {
    // 1. API基本接続テスト
    console.log('📡 API基本接続テスト...');
    const testUrl = `${BASE_URL}/json/getStatsList?appId=${APP_ID}&searchWord=犯罪統計&limit=5`;
    
    const response = await fetch(testUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API接続成功\n');

    // 2. 来日外国人関連データの検索
    console.log('🔎 来日外国人犯罪統計データを検索中...');
    const searchUrl = `${BASE_URL}/json/getStatsList?appId=${APP_ID}&searchWord=来日外国人&statsCode=00130001&limit=20`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.GET_STATS_LIST && searchData.GET_STATS_LIST.TABLE_INF) {
      const tables = searchData.GET_STATS_LIST.TABLE_INF;
      console.log(`📊 検出された統計表数: ${tables.length}`);
      
      console.log('\n📋 利用可能な統計表:');
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ID: ${table['@id']}`);
        console.log(`   タイトル: ${table.TITLE}`);
        console.log(`   調査年月: ${table.SURVEY_DATE}`);
        console.log(`   統計名: ${table.STAT_NAME}`);
        console.log('');
      });

      // 3. 最新の統計表のメタ情報を取得
      if (tables.length > 0) {
        const latestTable = tables[0];
        console.log(`🔍 最新統計表 (ID: ${latestTable['@id']}) のメタ情報を取得中...`);
        
        const metaUrl = `${BASE_URL}/json/getMetaInfo?appId=${APP_ID}&statsDataId=${latestTable['@id']}`;
        const metaResponse = await fetch(metaUrl);
        const metaData = await metaResponse.json();
        
        if (metaData.GET_META_INFO && metaData.GET_META_INFO.METADATA_INF) {
          const metadata = metaData.GET_META_INFO.METADATA_INF;
          console.log('✅ メタ情報取得成功');
          console.log(`📈 統計表名: ${metadata.STAT_NAME}`);
          console.log(`📅 調査年月: ${metadata.SURVEY_DATE}`);
          console.log(`🏢 提供機関: ${metadata.GOV_ORG}`);
          
          // 分類項目の確認
          if (metadata.CLASS_INF && metadata.CLASS_INF.CLASS_OBJ) {
            console.log('\n📂 分類項目:');
            const classes = Array.isArray(metadata.CLASS_INF.CLASS_OBJ) 
              ? metadata.CLASS_INF.CLASS_OBJ 
              : [metadata.CLASS_INF.CLASS_OBJ];
            
            classes.forEach((cls, index) => {
              console.log(`${index + 1}. ${cls['@name']} (${cls['@code']})`);
              if (cls.CLASS && cls.CLASS.length > 0) {
                console.log(`   項目数: ${cls.CLASS.length}項目`);
                // 最初の5項目を表示
                cls.CLASS.slice(0, 5).forEach(item => {
                  console.log(`   - ${item['@name']} (${item['@code']})`);
                });
                if (cls.CLASS.length > 5) {
                  console.log(`   ... 他${cls.CLASS.length - 5}項目`);
                }
              }
            });
          }
        }
      }
    } else {
      console.log('⚠️ 検索結果が見つかりません');
    }

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    console.error('詳細:', error);
  }
}

async function testDataRetrieval() {
  console.log('\n🔄 実際のデータ取得テスト...');
  
  try {
    // 既知の統計表IDでデータ取得をテスト
    const testStatsDataId = '0003090287'; // 仮のID（実際の検索結果から更新する必要あり）
    
    const dataUrl = `${BASE_URL}/json/getStatsData?appId=${APP_ID}&statsDataId=${testStatsDataId}&limit=10`;
    
    console.log(`📊 統計表ID ${testStatsDataId} からデータ取得中...`);
    const response = await fetch(dataUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.GET_STATS_DATA && data.GET_STATS_DATA.RESULT.STATUS === 0) {
        console.log('✅ データ取得成功');
        
        if (data.GET_STATS_DATA.STATISTICAL_DATA && data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF) {
          const values = data.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;
          console.log(`📈 取得データ数: ${values.length}件`);
          
          // 最初の3件のデータを表示
          console.log('\n📋 サンプルデータ:');
          values.slice(0, 3).forEach((value, index) => {
            console.log(`${index + 1}. 値: ${value.$}`);
            Object.keys(value).filter(key => key.startsWith('@')).forEach(key => {
              console.log(`   ${key.replace('@', '')}: ${value[key]}`);
            });
          });
        }
      } else {
        console.log('⚠️ データ取得に失敗しました');
        if (data.GET_STATS_DATA && data.GET_STATS_DATA.RESULT) {
          console.log(`エラー: ${data.GET_STATS_DATA.RESULT.ERROR_MSG}`);
        }
      }
    } else {
      console.log(`⚠️ HTTP エラー: ${response.status}`);
    }
    
  } catch (error) {
    console.log('ℹ️ データ取得テストをスキップ（統計表IDが不明）');
    console.log('実際のIDは検索結果から取得してください');
  }
}

// メイン実行
async function main() {
  await testApiConnection();
  await testDataRetrieval();
  console.log('\n🎉 テスト完了！');
}

main().catch(console.error);