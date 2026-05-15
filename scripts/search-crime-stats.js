#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '../frontend/.env' });

const API_ID = process.env.VITE_ESTAT_API_ID;
const BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app';

async function searchCrimeStats() {
  console.log('🔍 犯罪統計データの詳細検索開始...\n');

  const searchTerms = [
    '来日外国人',
    '外国人犯罪',
    '犯罪統計',
    '検挙状況',
    '来日',
    '外国人'
  ];

  for (const term of searchTerms) {
    console.log(`🔎 検索キーワード: "${term}"`);
    
    try {
      const searchUrl = `${BASE_URL}/json/getStatsList?appId=${API_ID}&searchWord=${encodeURIComponent(term)}&limit=50`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.GET_STATS_LIST && data.GET_STATS_LIST.TABLE_INF) {
        const tables = data.GET_STATS_LIST.TABLE_INF;
        console.log(`📊 検出: ${tables.length}件`);
        
        // 外国人や犯罪関連のテーブルをフィルタリング
        const relevantTables = tables.filter(table => {
          const title = table.TITLE || '';
          const statName = table.STAT_NAME || '';
          return title.includes('外国人') || 
                title.includes('犯罪') || 
                title.includes('検挙') ||
                statName.includes('犯罪') ||
                statName.includes('警察');
        });

        if (relevantTables.length > 0) {
          console.log(`🎯 関連テーブル: ${relevantTables.length}件`);
          relevantTables.forEach((table, index) => {
            console.log(`  ${index + 1}. ID: ${table['@id']}`);
            console.log(`     統計名: ${table.STAT_NAME}`);
            console.log(`     タイトル: ${table.TITLE}`);
            console.log(`     調査年月: ${table.SURVEY_DATE}`);
            console.log(`     更新日時: ${table.UPDATED_DATE}`);
            console.log('');
          });
        } else {
          console.log('   💡 関連するテーブルなし');
        }
        
      } else {
        console.log('   📭 検索結果なし');
      }
      
      console.log('---\n');
      
    } catch (error) {
      console.error(`❌ エラー (${term}):`, error.message);
    }
  }

  // 警察庁の統計コードで絞り込み検索
  console.log('🏢 警察庁統計コード (00130001) で検索...');
  
  try {
    const policeUrl = `${BASE_URL}/json/getStatsList?appId=${API_ID}&statsCode=00130001&limit=100`;
    
    const response = await fetch(policeUrl);
    const data = await response.json();

    if (data.GET_STATS_LIST && data.GET_STATS_LIST.TABLE_INF) {
      const tables = data.GET_STATS_LIST.TABLE_INF;
      console.log(`📊 警察庁統計: ${tables.length}件`);
      
      // 最新のものを10件表示
      tables.slice(0, 10).forEach((table, index) => {
        console.log(`${index + 1}. ID: ${table['@id']}`);
        console.log(`   統計名: ${table.STAT_NAME}`);
        console.log(`   タイトル: ${table.TITLE}`);
        console.log(`   調査年月: ${table.SURVEY_DATE}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 警察庁統計検索エラー:', error.message);
  }
}

searchCrimeStats().catch(console.error);