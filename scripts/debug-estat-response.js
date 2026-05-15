#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env' });

const API_ID = process.env.ESTAT_APP_ID;
const FILE_SEARCH_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getDataCatalog';

async function debugEstatResponse() {
  if (!API_ID) {
    console.error('Error: ESTAT_APP_ID not found in .env file');
    process.exit(1);
  }

  console.log('🔍 e-Stat レスポンス構造デバッグ...\n');

  // 警察庁のファイル形式データを検索
  const params = new URLSearchParams({
    appId: API_ID,
    lang: 'J',
    surveyYears: '202301-202312',
    statsCode: '00130001',
    dataFormat: 'XLS,CSV'
  });

  try {
    const url = `${FILE_SEARCH_URL}?${params}`;
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('\n📋 Full Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.GET_DATA_CATALOG) {
      console.log('\n🎯 GET_DATA_CATALOG keys:', Object.keys(data.GET_DATA_CATALOG));
      
      if (data.GET_DATA_CATALOG.DATALIST_INF) {
        console.log('📁 DATALIST_INF keys:', Object.keys(data.GET_DATA_CATALOG.DATALIST_INF));
        
        if (data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF) {
          const dataInf = data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF;
          
          if (Array.isArray(dataInf)) {
            console.log(`📊 Found ${dataInf.length} files`);
            dataInf.slice(0, 3).forEach((file, index) => {
              console.log(`\n${index + 1}. File Structure:`, Object.keys(file));
              console.log('   Title:', file.TITLE);
              console.log('   Format:', file.DATA_FORMAT);
            });
          } else {
            console.log('📊 Single file found:');
            console.log('   Structure:', Object.keys(dataInf));
            console.log('   Title:', dataInf.TITLE);
          }
        } else {
          console.log('⚠️ No DATA_INF in DATALIST_INF');
        }
      } else {
        console.log('⚠️ No DATALIST_INF in GET_DATA_CATALOG');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugEstatResponse().catch(console.error);