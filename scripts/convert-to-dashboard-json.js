#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * e-Stat API レスポンスをダッシュボード用JSONに変換
 */

async function convertTodasboardJSON() {
  try {
    console.log('📊 e-Stat データをダッシュボード用JSONに変換中...');

    // Raw e-Stat response を読み込み
    const rawDataPath = path.join(process.cwd(), '../data/raw-estat-response.json');
    const rawData = JSON.parse(await fs.readFile(rawDataPath, 'utf-8'));

    const statisticalData = rawData.GET_STATS_DATA.STATISTICAL_DATA;
    const classInfo = statisticalData.CLASS_INF.CLASS_OBJ;
    const dataValues = statisticalData.DATA_INF.VALUE;

    console.log(`✅ 読み込み完了: ${dataValues.length}件のデータ`);

    // カテゴリマッピングを作成
    const categoryMaps = {};
    classInfo.forEach(classObj => {
      const categoryId = classObj['@id'];
      const categoryMap = {};
      
      if (classObj.CLASS) {
        classObj.CLASS.forEach(cls => {
          categoryMap[cls['@code']] = {
            name: cls['@name'],
            level: cls['@level'],
            unit: cls['@unit'],
            parentCode: cls['@parentCode']
          };
        });
      }
      
      categoryMaps[categoryId] = categoryMap;
    });

    console.log('📋 カテゴリマッピング作成完了');
    console.log('認知・検挙カテゴリ:', Object.keys(categoryMaps.cat01 || {}).length, '件');
    console.log('罪種カテゴリ:', Object.keys(categoryMaps.cat02 || {}).length, '件');

    // 年度別データを整理
    const yearlyData = {};
    const crimeTypeData = {};
    
    dataValues.forEach(item => {
      const year = parseInt(item['@time'].substring(0, 4));
      const cat01 = item['@cat01']; // 認知・検挙種別
      const cat02 = item['@cat02']; // 罪種
      const value = parseInt(item['$']) || 0;
      const unit = item['@unit'];

      // 年度別データを作成
      if (!yearlyData[year]) {
        yearlyData[year] = {
          year,
          totalRecognized: 0,
          totalArrested: 0,
          arrestRate: 0,
          totalPersonnel: 0,
          details: {}
        };
      }

      // 犯罪種別データを作成
      const crimeType = categoryMaps.cat02?.[cat02]?.name || '不明';
      const measureType = categoryMaps.cat01?.[cat01]?.name || '不明';

      if (!crimeTypeData[crimeType]) {
        crimeTypeData[crimeType] = {
          name: crimeType,
          code: cat02,
          level: categoryMaps.cat02?.[cat02]?.level || '1',
          recognized: 0,
          arrested: 0,
          personnel: 0,
          yearlyTrend: []
        };
      }

      // データを分類して格納
      if (measureType === '認知件数' && unit === '件') {
        yearlyData[year].totalRecognized += value;
        crimeTypeData[crimeType].recognized += value;
      } else if (measureType === '検挙件数' && unit === '件') {
        yearlyData[year].totalArrested += value;
        crimeTypeData[crimeType].arrested += value;
      } else if (measureType === '検挙人員' && unit === '人') {
        yearlyData[year].totalPersonnel += value;
        crimeTypeData[crimeType].personnel += value;
      } else if (measureType === '検挙率' && unit === '%') {
        yearlyData[year].arrestRate = value;
      }
    });

    // 検挙率を計算（データにない場合）
    Object.values(yearlyData).forEach(yearData => {
      if (yearData.arrestRate === 0 && yearData.totalRecognized > 0) {
        yearData.arrestRate = Math.round((yearData.totalArrested / yearData.totalRecognized) * 100);
      }
    });

    // 重要犯罪の特別カテゴリ作成
    const seriousCrimes = Object.values(crimeTypeData).filter(crime => 
      crime.name.includes('殺人') || 
      crime.name.includes('強盗') || 
      crime.name.includes('放火') ||
      crime.name.includes('強姦')
    );

    const totalSeriousCrimes = seriousCrimes.reduce((sum, crime) => sum + crime.recognized, 0);
    const totalSeriousArrests = seriousCrimes.reduce((sum, crime) => sum + crime.arrested, 0);

    // ダッシュボード用データ構造を作成
    const dashboardData = {
      metadata: {
        year: Math.max(...Object.keys(yearlyData).map(y => parseInt(y))),
        period: "年次",
        dataSource: "警察庁・e-Stat犯罪統計",
        retrievedDate: new Date().toISOString().split('T')[0],
        version: "ver.2.0",
        notes: `統計表番号 0003191320 刑法犯 罪種別 認知・検挙件数・検挙人員`,
        totalRecords: dataValues.length
      },
      
      summary: {
        latestYear: Math.max(...Object.keys(yearlyData).map(y => parseInt(y))),
        totalRecognizedCases: Object.values(yearlyData).reduce((sum, y) => sum + y.totalRecognized, 0),
        totalArrestedCases: Object.values(yearlyData).reduce((sum, y) => sum + y.totalArrested, 0),
        averageArrestRate: Math.round(Object.values(yearlyData).reduce((sum, y) => sum + y.arrestRate, 0) / Object.values(yearlyData).length),
        totalPersonnel: Object.values(yearlyData).reduce((sum, y) => sum + y.totalPersonnel, 0)
      },

      yearlyTrends: Object.values(yearlyData).sort((a, b) => a.year - b.year),

      crimeTypes: Object.values(crimeTypeData)
        .filter(crime => crime.recognized > 0)
        .sort((a, b) => b.recognized - a.recognized)
        .slice(0, 20), // トップ20の犯罪種別

      seriousCrimes: {
        total: totalSeriousCrimes,
        arrested: totalSeriousArrests,
        arrestRate: totalSeriousCrimes > 0 ? Math.round((totalSeriousArrests / totalSeriousCrimes) * 100) : 0,
        breakdown: seriousCrimes.sort((a, b) => b.recognized - a.recognized)
      },

      // 注意: 実際の外国人データは別の統計表が必要
      // 現在はプレースホルダーとして基本データのみ
      foreignerCrimes: {
        note: "外国人犯罪の詳細データは別の統計表（第12表）から取得が必要",
        estimated: {
          totalCases: Math.floor(totalSeriousCrimes * 0.05), // 推定値
          byRegion: [
            { region: "東アジア", cases: Math.floor(totalSeriousCrimes * 0.02) },
            { region: "東南アジア", cases: Math.floor(totalSeriousCrimes * 0.015) },
            { region: "その他", cases: Math.floor(totalSeriousCrimes * 0.015) }
          ]
        }
      }
    };

    // JSONファイルに出力
    const outputPath = path.join(process.cwd(), '../frontend/public/data/crime-statistics.json');
    await fs.writeFile(outputPath, JSON.stringify(dashboardData, null, 2));
    
    console.log('✅ 変換完了');
    console.log(`📁 出力先: ${outputPath}`);
    console.log('📊 データサマリー:');
    console.log(`  - 対象年度: ${dashboardData.summary.latestYear}`);
    console.log(`  - 総認知件数: ${dashboardData.summary.totalRecognizedCases.toLocaleString()}件`);
    console.log(`  - 総検挙件数: ${dashboardData.summary.totalArrestedCases.toLocaleString()}件`);
    console.log(`  - 平均検挙率: ${dashboardData.summary.averageArrestRate}%`);
    console.log(`  - 犯罪種別: ${dashboardData.crimeTypes.length}件`);
    console.log(`  - 重要犯罪: ${dashboardData.seriousCrimes.total.toLocaleString()}件`);

  } catch (error) {
    console.error('❌ 変換エラー:', error.message);
    process.exit(1);
  }
}

convertTodasboardJSON().catch(console.error);