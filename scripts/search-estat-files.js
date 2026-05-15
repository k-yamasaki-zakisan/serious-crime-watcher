#!/usr/bin/env node

import { config } from 'dotenv';

config({ path: '.env' });

const API_ID = process.env.ESTAT_APP_ID;
const FILE_SEARCH_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getDataCatalog';

async function searchEstatFiles() {
  if (!API_ID) {
    console.error('Error: ESTAT_APP_ID not found in .env file');
    process.exit(1);
  }

  console.log('📁 e-Stat ファイル形式データ検索開始...\n');

  // 複数の検索戦略でファイルを探す
  const searchStrategies = [
    {
      name: '警察庁全ファイル検索',
      params: {
        appId: API_ID,
        lang: 'J',
        surveyYears: '202301-202312', // 2023年
        openYears: '202001-202412',   // 2020-2024年に公開
        statsCode: '00130001',       // 警察庁
        searchWord: '',
        dataFormat: 'XLS,CSV'     // Excel/CSV形式のみ
      }
    },
    {
      name: '外国人キーワード検索',
      params: {
        appId: API_ID,
        lang: 'J',
        surveyYears: '202301-202312',
        searchWord: '外国人',
        statsCode: '00130001',
        dataFormat: 'XLS,CSV'
      }
    },
    {
      name: '来日外国人検索',
      params: {
        appId: API_ID,
        lang: 'J',
        surveyYears: '202301-202312',
        searchWord: '来日外国人',
        dataFormat: 'XLS,CSV'
      }
    },
    {
      name: '重要犯罪検索',
      params: {
        appId: API_ID,
        lang: 'J',
        surveyYears: '202301-202312',
        searchWord: '重要犯罪',
        statsCode: '00130001',
        dataFormat: 'XLS,CSV'
      }
    },
    {
      name: '犯罪統計全ファイル',
      params: {
        appId: API_ID,
        lang: 'J',
        surveyYears: '202301-202312',
        searchWord: '犯罪統計',
        dataFormat: 'XLS,CSV'
      }
    }
  ];

  for (const strategy of searchStrategies) {
    console.log(`🔍 ${strategy.name}を実行中...`);
    
    try {
      const params = new URLSearchParams(strategy.params);
      const url = `${FILE_SEARCH_URL}?${params}`;
      
      console.log(`URL: ${url.substring(0, 120)}...`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Response keys:', Object.keys(data));
      
      if (data.GET_DATA_CATALOG && data.GET_DATA_CATALOG.DATALIST_INF && data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF) {
        const files = Array.isArray(data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF)
          ? data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF
          : [data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF];
        
        console.log(`✅ ${files.length}件のファイルを発見`);
        
        // 外国人や犯罪関連のファイルをフィルタリング
        const relevantFiles = files.filter(file => {
          const title = file.TITLE || '';
          const statName = file.STATISTICS_NAME || '';
          const description = file.DESCRIPTION || '';
          
          const relevantKeywords = [
            '外国人', '来日', '国籍', '重要犯罪', 'foreign', 
            '検挙', '第12表', '第13表', 'visiting'
          ];
          
          return relevantKeywords.some(keyword => 
            title.toLowerCase().includes(keyword.toLowerCase()) ||
            statName.toLowerCase().includes(keyword.toLowerCase()) ||
            description.toLowerCase().includes(keyword.toLowerCase())
          );
        });
        
        if (relevantFiles.length > 0) {
          console.log(`🎯 関連ファイル ${relevantFiles.length}件:`);
          relevantFiles.forEach((file, index) => {
            console.log(`\n${index + 1}. ファイルID: ${file['@id']}`);
            console.log(`   タイトル: ${file.TITLE}`);
            console.log(`   統計名: ${file.STATISTICS_NAME}`);
            console.log(`   調査年月: ${file.SURVEY_DATE || 'N/A'}`);
            console.log(`   公開日: ${file.OPEN_DATE || 'N/A'}`);
            console.log(`   形式: ${file.DATA_FORMAT || 'N/A'}`);
            console.log(`   サイズ: ${file.FILE_SIZE || 'N/A'}`);
            if (file.DOWNLOAD_URL) {
              console.log(`   URL: ${file.DOWNLOAD_URL}`);
            }
          });
        } else {
          console.log('💡 フィルタリング後の関連ファイルなし');
          
          // 最初の5件だけ表示
          if (files.length > 0) {
            console.log(`\n📋 利用可能なファイルの一部 (${Math.min(5, files.length)}件):`);
            files.slice(0, 5).forEach((file, index) => {
              console.log(`${index + 1}. ${file['@id']} - ${file.TITLE} (${file.DATA_FORMAT})`);
            });
          }
        }
        
      } else if (data.GET_DATA_CATALOG && data.GET_DATA_CATALOG.RESULT) {
        console.log(`⚠️ 結果: ${JSON.stringify(data.GET_DATA_CATALOG.RESULT)}`);
      } else {
        console.log('📭 検索結果なし');
      }
      
    } catch (error) {
      console.error(`❌ エラー (${strategy.name}):`, error.message);
    }
    
    console.log('---\n');
    
    // API制限を避けるため少し待機
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 最後に政府統計全体から外国人関連を探す
  console.log('🏛️ 政府統計全体から外国人関連データを検索...');
  try {
    const params = new URLSearchParams({
      appId: API_ID,
      lang: 'J',
      surveyYears: '2023-2019',
      searchWord: '外国人 犯罪',
      dataFormat: 'XLS,CSV',
      limit: '50'
    });
    
    const url = `${FILE_SEARCH_URL}?${params}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.GET_DATA_CATALOG && data.GET_DATA_CATALOG.DATALIST_INF && data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF) {
      const files = Array.isArray(data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF)
        ? data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF
        : [data.GET_DATA_CATALOG.DATALIST_INF.DATA_INF];
      
      console.log(`📊 政府統計全体: ${files.length}件のマッチング`);
      
      const crimeRelated = files.filter(file => {
        const title = (file.TITLE || '').toLowerCase();
        const statName = (file.STATISTICS_NAME || '').toLowerCase();
        return title.includes('犯罪') || title.includes('検挙') || 
               statName.includes('犯罪') || statName.includes('警察');
      });
      
      if (crimeRelated.length > 0) {
        console.log(`🚨 犯罪関連ファイル ${crimeRelated.length}件:`);
        crimeRelated.forEach((file, index) => {
          console.log(`\n${index + 1}. ファイルID: ${file['@id']}`);
          console.log(`   タイトル: ${file.TITLE}`);
          console.log(`   機関: ${(file.GOV_ORG && file.GOV_ORG.$) || 'N/A'}`);
          console.log(`   形式: ${file.DATA_FORMAT || 'N/A'}`);
        });
      } else {
        console.log('⚠️ 犯罪関連ファイルが見つかりませんでした');
      }
    }
    
  } catch (error) {
    console.error('❌ 政府統計全体検索エラー:', error.message);
  }
}

searchEstatFiles().catch(console.error);