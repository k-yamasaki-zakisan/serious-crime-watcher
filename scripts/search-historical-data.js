#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env' });

const API_ID = process.env.ESTAT_APP_ID;
const FILE_SEARCH_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getDataCatalog';

async function searchHistoricalData() {
  if (!API_ID) {
    console.error('Error: ESTAT_APP_ID not found in .env file');
    process.exit(1);
  }

  console.log('🔍 過去10年間の来日外国人犯罪統計データ検索...\n');

  // 過去10年間の年度検索
  const years = [];
  for (let year = 2014; year <= 2024; year++) {
    years.push(year);
  }

  for (const year of years) {
    console.log(`📅 ${year}年データ検索中...`);
    
    try {
      const params = new URLSearchParams({
        appId: API_ID,
        lang: 'J',
        surveyYears: `${year}01-${year}12`,
        openYears: `${year-1}01-${year+2}12`,
        statsCode: '00130001', // 警察庁
        searchWord: '来日外国人',
        dataFormat: 'XLS,CSV'
      });
      
      const url = `${FILE_SEARCH_URL}?${params}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.GET_DATA_CATALOG && data.GET_DATA_CATALOG.DATALIST_INF && data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF) {
        const files = Array.isArray(data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF)
          ? data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF
          : [data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF];
        
        console.log(`✅ ${files.length}件のファイル発見`);
        
        files.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.TITLE}`);
          console.log(`     調査年: ${file.SURVEY_DATE || 'N/A'}`);
          console.log(`     公開日: ${file.OPEN_DATE || 'N/A'}`);
          if (file.DOWNLOAD_URL) {
            console.log(`     URL: ${file.DOWNLOAD_URL}`);
          }
          console.log('');
        });
      } else {
        console.log('❌ データなし');
      }
      
    } catch (error) {
      console.error(`❌ エラー (${year}年):`, error.message);
    }
    
    console.log('---\n');
    
    // API制限を避けるため待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

searchHistoricalData().catch(console.error);