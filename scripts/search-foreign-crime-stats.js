#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env' });

const API_ID = process.env.ESTAT_APP_ID;
const SEARCH_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList';

async function searchForeignCrimeStats() {
  if (!API_ID) {
    console.error('Error: ESTAT_APP_ID not found in .env file');
    process.exit(1);
  }

  console.log('🔍 外国人犯罪統計の詳細検索を開始...\n');

  // 複数の検索戦略を試す
  const searchStrategies = [
    {
      name: '来日外国人検索',
      params: {
        appId: API_ID,
        searchWord: '来日外国人',
        searchKind: '2', // 統計表情報
        limit: '50'
      }
    },
    {
      name: '外国人犯罪検索',
      params: {
        appId: API_ID,
        searchWord: '外国人',
        searchKind: '2',
        limit: '50',
        statsCode: '00130001' // 警察庁
      }
    },
    {
      name: '重要犯罪検索',
      params: {
        appId: API_ID,
        searchWord: '重要犯罪',
        searchKind: '2',
        limit: '50',
        statsCode: '00130001'
      }
    },
    {
      name: '第12表検索',
      params: {
        appId: API_ID,
        searchWord: '第12表',
        searchKind: '2',
        limit: '50',
        statsCode: '00130001'
      }
    }
  ];

  for (const strategy of searchStrategies) {
    console.log(`📋 ${strategy.name}を実行中...`);
    
    try {
      const params = new URLSearchParams(strategy.params);
      const url = `${SEARCH_URL}?${params}`;
      
      console.log(`URL: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.GET_STATS_LIST && data.GET_STATS_LIST.DATALIST_INF && data.GET_STATS_LIST.DATALIST_INF.TABLE_INF) {
        const tables = Array.isArray(data.GET_STATS_LIST.DATALIST_INF.TABLE_INF)
          ? data.GET_STATS_LIST.DATALIST_INF.TABLE_INF
          : [data.GET_STATS_LIST.DATALIST_INF.TABLE_INF];
        
        console.log(`✅ ${tables.length}件の統計表を発見`);
        
        // 外国人や犯罪関連のテーブルをフィルタリング
        const relevantTables = tables.filter(table => {
          const title = table.TITLE || '';
          const statName = table.STATISTICS_NAME || '';
          const govOrg = (table.GOV_ORG && table.GOV_ORG.$) || '';
          
          return (govOrg.includes('警察') || statName.includes('犯罪')) &&
                 (title.includes('外国人') || 
                  title.includes('来日') || 
                  title.includes('国籍') ||
                  title.includes('重要犯罪') ||
                  title.includes('第12表') ||
                  title.includes('第13表'));
        });
        
        if (relevantTables.length > 0) {
          console.log(`🎯 関連テーブル ${relevantTables.length}件:`);
          relevantTables.forEach((table, index) => {
            console.log(`\n${index + 1}. 統計表ID: ${table['@id']}`);
            console.log(`   タイトル: ${table.TITLE}`);
            console.log(`   統計名: ${table.STATISTICS_NAME}`);
            console.log(`   調査年月: ${table.SURVEY_DATE || 'N/A'}`);
            console.log(`   更新日: ${table.UPDATED_DATE || 'N/A'}`);
            console.log(`   機関: ${(table.GOV_ORG && table.GOV_ORG.$) || 'N/A'}`);
          });
        } else {
          console.log('💡 フィルタリング後の関連テーブルなし');
        }
        
      } else if (data.GET_STATS_LIST && data.GET_STATS_LIST.RESULT) {
        console.log(`⚠️ 結果: ${JSON.stringify(data.GET_STATS_LIST.RESULT)}`);
      } else {
        console.log('📭 検索結果なし');
      }
      
    } catch (error) {
      console.error(`❌ エラー (${strategy.name}):`, error.message);
    }
    
    console.log('---\n');
    
    // API制限を避けるため少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 追加: 警察庁の全統計表をリストアップ
  console.log('🏢 警察庁の全統計表を確認...');
  try {
    const params = new URLSearchParams({
      appId: API_ID,
      statsCode: '00130001',
      limit: '100'
    });
    const url = `${SEARCH_URL}?${params}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.GET_STATS_LIST && data.GET_STATS_LIST.DATALIST_INF && data.GET_STATS_LIST.DATALIST_INF.TABLE_INF) {
      const tables = Array.isArray(data.GET_STATS_LIST.DATALIST_INF.TABLE_INF)
        ? data.GET_STATS_LIST.DATALIST_INF.TABLE_INF
        : [data.GET_STATS_LIST.DATALIST_INF.TABLE_INF];
      
      console.log(`📊 警察庁統計表総数: ${tables.length}件\n`);
      
      // タイトルに「外国人」「来日」「国籍」を含むものを抽出
      const foreignRelated = tables.filter(table => {
        const title = (table.TITLE || '').toLowerCase();
        return title.includes('外国人') || title.includes('来日') || title.includes('国籍');
      });
      
      if (foreignRelated.length > 0) {
        console.log(`🎯 外国人関連統計表 ${foreignRelated.length}件:`);
        foreignRelated.forEach((table, index) => {
          console.log(`\n${index + 1}. 統計表ID: ${table['@id']}`);
          console.log(`   タイトル: ${table.TITLE}`);
          console.log(`   統計名: ${table.STATISTICS_NAME}`);
          console.log(`   調査年月: ${table.SURVEY_DATE || 'N/A'}`);
        });
      } else {
        console.log('⚠️ 外国人関連の統計表が見つかりませんでした');
        console.log('\n📋 利用可能な統計表の一部:');
        tables.slice(0, 10).forEach((table, index) => {
          console.log(`${index + 1}. ID: ${table['@id']} - ${table.TITLE}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ 警察庁統計表リスト取得エラー:', error.message);
  }
}

searchForeignCrimeStats().catch(console.error);