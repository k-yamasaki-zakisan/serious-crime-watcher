import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface NationalityData {
  country: string;
  region: string;
  population: number;
  crimes: number;
  crimeRate: number; // per 100k
}

// モックデータ（実際のe-Statデータが利用可能になるまで）
const mockNationalityData: NationalityData[] = [
  { country: '日本', region: '国内', population: 125000000, crimes: 800000, crimeRate: 640 },
  { country: '中国', region: '東アジア', population: 750000, crimes: 4500, crimeRate: 600 },
  { country: 'ベトナム', region: '東南アジア', population: 450000, crimes: 3200, crimeRate: 711 },
  { country: '韓国', region: '東アジア', population: 430000, crimes: 2800, crimeRate: 651 },
  { country: 'フィリピン', region: '東南アジア', population: 280000, crimes: 1900, crimeRate: 679 },
  { country: 'ブラジル', region: '南米', population: 210000, crimes: 1600, crimeRate: 762 },
  { country: 'ネパール', region: '南アジア', population: 95000, crimes: 850, crimeRate: 895 },
  { country: 'ペルー', region: '南米', population: 48000, crimes: 420, crimeRate: 875 },
  { country: 'タイ', region: '東南アジア', population: 54000, crimes: 380, crimeRate: 704 },
  { country: 'インドネシア', region: '東南アジア', population: 42000, crimes: 290, crimeRate: 690 }
];

interface NationalityRatioChartProps {
  title?: string;
}

export const NationalityRatioChart: React.FC<NationalityRatioChartProps> = ({ 
  title = "国籍別犯罪率比較" 
}) => {
  const [showJapanese, setShowJapanese] = useState(true);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['東アジア', '東南アジア', '南米', '南アジア']);

  const regions = Array.from(new Set(mockNationalityData.map(d => d.region)));

  const filteredData = mockNationalityData.filter(d => 
    (d.country === '日本' ? showJapanese : selectedRegions.includes(d.region))
  );

  const chartData = [
    {
      name: '犯罪率 (人口10万人あたり)',
      data: filteredData.map(item => ({
        x: item.country,
        y: item.crimeRate,
        fillColor: item.country === '日本' ? '#3b82f6' : 
                   item.region === '東アジア' ? '#ef4444' :
                   item.region === '東南アジア' ? '#10b981' :
                   item.region === '南米' ? '#f59e0b' : '#8b5cf6'
      }))
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 450,
      toolbar: {
        show: true
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '70%',
        distributed: true,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val as number)}`,
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      type: 'category',
      title: {
        text: '国籍',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '11px'
        }
      }
    },
    yaxis: {
      title: {
        text: '犯罪率（人口10万人あたり）',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value}件/10万人`
      },
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const data = filteredData[dataPointIndex];
        return `
          <div class="p-3 bg-white rounded shadow-lg border">
            <div class="font-bold text-gray-800">${data.country}</div>
            <div class="text-sm text-gray-600 mb-2">${data.region}</div>
            <div class="space-y-1 text-xs">
              <div>人口: ${data.population.toLocaleString()}人</div>
              <div>犯罪件数: ${data.crimes.toLocaleString()}件</div>
              <div class="font-bold">犯罪率: ${data.crimeRate}件/10万人</div>
            </div>
          </div>
        `;
      }
    },
    legend: {
      show: false
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    responsive: [{
      breakpoint: 768,
      options: {
        plotOptions: {
          bar: {
            columnWidth: '90%'
          }
        }
      }
    }]
  };

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const japaneseData = mockNationalityData.find(d => d.country === '日本');
  const foreignAverage = mockNationalityData
    .filter(d => d.country !== '日本')
    .reduce((sum, d) => sum + d.crimeRate, 0) / mockNationalityData.filter(d => d.country !== '日本').length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-500">
          ⚠️ デモデータ（実際のe-Stat外国人統計が必要）
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{japaneseData?.crimeRate}</div>
          <div className="text-sm text-blue-500">日本人犯罪率</div>
          <div className="text-xs text-gray-500">人口10万人あたり</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{Math.round(foreignAverage)}</div>
          <div className="text-sm text-orange-500">外国人平均犯罪率</div>
          <div className="text-xs text-gray-500">人口10万人あたり</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {japaneseData ? Math.round((foreignAverage / japaneseData.crimeRate) * 100) / 100 : 'N/A'}倍
          </div>
          <div className="text-sm text-gray-500">比率</div>
          <div className="text-xs text-gray-500">日本人を1とした場合</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">表示フィルター</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showJapanese}
              onChange={(e) => setShowJapanese(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-blue-700">🇯🇵 日本</span>
          </label>
          
          {regions.filter(r => r !== '国内').map(region => (
            <label key={region} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={() => handleRegionToggle(region)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {region === '東アジア' ? '🌏' : 
                 region === '東南アジア' ? '🌴' :
                 region === '南米' ? '🌎' : '🏔️'} {region}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Chart */}
      {filteredData.length > 0 ? (
        <Chart
          options={options}
          series={chartData}
          type="bar"
          height={450}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>表示する国籍を選択してください</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-sm text-yellow-800">
          <div className="font-medium mb-1">⚠️ 注意事項</div>
          <ul className="text-xs space-y-1">
            <li>• 表示されているデータはデモンストレーション用です</li>
            <li>• 実際のデータはe-Stat「第12表 来日外国人による重要犯罪・重要窃盗犯」から取得する必要があります</li>
            <li>• 人口調整済み比較により統計的公平性を確保しています</li>
            <li>• 社会経済的背景要因の考慮が重要です</li>
          </ul>
        </div>
      </div>
    </div>
  );
};