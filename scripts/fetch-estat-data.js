#!/usr/bin/env node

import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables from frontend/.env
config({ path: '.env' });

const API_ID = process.env.ESTAT_APP_ID;
const BASE_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData';

// e-Stat統計表ID（犯罪統計第1表 - 刑法犯 罪種別 認知・検挙件数・検挙人員）
const STATS_DATA_ID = '0003191320';

async function fetchEstatData() {
  if (!API_ID) {
    console.error('Error: VITE_ESTAT_API_ID not found in .env file');
    process.exit(1);
  }

  const params = new URLSearchParams({
    appId: API_ID,
    statsDataId: STATS_DATA_ID,
    format: 'json',
    lang: 'J',
    startPosition: '1',
    limit: '100000'
  });

  const url = `${BASE_URL}?${params}`;
  
  console.log('Fetching data from e-Stat API...');
  console.log('URL:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Data fetched successfully');
    console.log('Response structure:', Object.keys(data));
    
    if (data.GET_STATS_DATA) {
      console.log('Statistical data found:', Object.keys(data.GET_STATS_DATA));
      
      // Save raw response for analysis
      const rawDataPath = path.join(process.cwd(), '../data/raw-estat-response.json');
      await fs.writeFile(rawDataPath, JSON.stringify(data, null, 2));
      console.log(`Raw data saved to: ${rawDataPath}`);
      
      // Display basic info
      if (data.GET_STATS_DATA.STATISTICAL_DATA) {
        const statData = data.GET_STATS_DATA.STATISTICAL_DATA;
        console.log('\\nData info:');
        console.log('- TABLE_INF:', statData.TABLE_INF?.['@id']);
        console.log('- Data rows:', statData.DATA_INF?.VALUE?.length || 0);
        
        // Show first few data points
        if (statData.DATA_INF?.VALUE) {
          console.log('\\nFirst 5 data points:');
          statData.DATA_INF.VALUE.slice(0, 5).forEach((item, index) => {
            console.log(`${index + 1}:`, item);
          });
        }
      }
      
    } else {
      console.log('No statistical data found in response');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    
    if (error.message.includes('fetch is not defined')) {
      console.log('\\n💡 Installing node-fetch for Node.js compatibility...');
      const { execSync } = await import('child_process');
      execSync('npm install node-fetch', { stdio: 'inherit' });
      console.log('Please run the script again.');
    }
  }
}

// Check if data directory exists, create if not
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), '../data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
  }
}

async function main() {
  await ensureDataDirectory();
  await fetchEstatData();
}

main().catch(console.error);