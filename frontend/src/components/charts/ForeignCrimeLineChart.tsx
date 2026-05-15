import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface ForeignCrimeData {
  metadata: {
    dataSource: string;
    period: string;
    extractedDate: string;
    totalCountries: number;
    definition: string;
  };
  summary: {
    totalPersons2024: number;
    totalPersons2023: number;
    seriousCrimes2024: number;
    seriousCrimes2023: number;
    yearOnYearChange: number;
  };
  countries: Array<{
    name: string;
    region: string;
    data: {
      total: Record<string, number>;
      seriousCrimes: Record<string, number>;
      murder: Record<string, number>;
      robbery: Record<string, number>;
      arson: Record<string, number>;
      sexualAssault: Record<string, number>;
      kidnapping: Record<string, number>;
      indecency: Record<string, number>;
    };
  }>;
}

type CrimeType = 'total' | 'seriousCrimes' | 'murder' | 'robbery' | 'arson' | 'sexualAssault' | 'kidnapping' | 'indecency';

interface Props {
  data: ForeignCrimeData;
}

const crimeTypeLabels: Record<CrimeType, string> = {
  total: '総検挙人員',
  seriousCrimes: '重要犯罪',
  murder: '殺人',
  robbery: '強盗',
  arson: '放火',
  sexualAssault: '不同意性交等',
  kidnapping: '略取誘拐・人身売買',
  indecency: '不同意わいせつ'
};

export const ForeignCrimeLineChart: React.FC<Props> = ({ data }) => {
  const [selectedCrimeType, setSelectedCrimeType] = useState<CrimeType>('total');
  const [selectedRegion, setSelectedRegion] = useState<string>('全地域');
  const [displayMode, setDisplayMode] = useState<'absolute' | 'percentage'>('absolute');

  // 地域別フィルタリング
  const regions = useMemo(() => {
    const regionSet = new Set(data.countries.map(c => c.region));
    return ['全地域', ...Array.from(regionSet)];
  }, [data.countries]);

  // フィルタリングされた国データ
  const filteredCountries = useMemo(() => {
    let filtered = data.countries;
    if (selectedRegion !== '全地域') {
      filtered = filtered.filter(country => country.region === selectedRegion);
    }
    // 上位10ヶ国のみ表示
    return filtered
      .filter(country => country.data[selectedCrimeType]['2024'] > 0)
      .sort((a, b) => b.data[selectedCrimeType]['2024'] - a.data[selectedCrimeType]['2024'])
      .slice(0, 10);
  }, [data.countries, selectedRegion, selectedCrimeType]);

  // 時系列チャートデータの準備（横軸：年度、縦軸：件数または割合、各線：国籍）
  const chartData = useMemo(() => {
    const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];
    
    if (displayMode === 'absolute') {
      // 絶対値表示
      const series = filteredCountries.map(country => ({
        name: country.name,
        data: years.map(year => country.data[selectedCrimeType][year] || 0)
      }));
      return { series, categories: years };
    } else {
      // 割合表示（全体に対する各国の割合）
      const series = filteredCountries.map(country => ({
        name: country.name,
        data: years.map(year => {
          const countryValue = country.data[selectedCrimeType][year] || 0;
          // その年の全体の合計を計算
          const totalForYear = filteredCountries.reduce((sum, c) => 
            sum + (c.data[selectedCrimeType][year] || 0), 0);
          return totalForYear > 0 ? Math.round((countryValue / totalForYear * 100) * 10) / 10 : 0;
        })
      }));
      return { series, categories: years };
    }
  }, [filteredCountries, selectedCrimeType, displayMode]);

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 450,
      zoom: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    title: {
      text: `来日外国人犯罪統計 - ${crimeTypeLabels[selectedCrimeType]} (${displayMode === 'absolute' ? '時系列推移' : '割合推移'})`,
      align: 'center',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#ffffff'
      }
    },
    subtitle: {
      text: selectedRegion === '全地域' ? '国籍別推移（上位10ヶ国）' : `${selectedRegion}地域の推移`,
      align: 'center',
      style: {
        fontSize: '14px',
        color: '#e5e7eb'
      }
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: '年度',
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#ffffff'
        }
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#ffffff'
        }
      },
      type: 'category'
    },
    yaxis: {
      title: {
        text: displayMode === 'absolute' 
          ? `${crimeTypeLabels[selectedCrimeType]} 検挙人員（人）`
          : `${crimeTypeLabels[selectedCrimeType]} 割合（%）`,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#ffffff'
        }
      },
      min: 0,
      max: displayMode === 'percentage' ? 100 : undefined,
      labels: {
        formatter: (value: number) => displayMode === 'absolute' 
          ? Math.round(value).toString()
          : `${Math.round(value * 10) / 10}%`,
        style: {
          colors: '#ffffff'
        }
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', 
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ],
    markers: {
      size: 6,
      strokeWidth: 2,
      fillOpacity: 1,
      strokeOpacity: 1,
      hover: {
        size: 8
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      fontWeight: 'normal',
      itemMargin: {
        horizontal: 15,
        vertical: 5
      },
      labels: {
        colors: '#ffffff' // 白色
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: 'dark',
      style: {
        fontSize: '12px',
        color: '#ffffff'
      },
      x: {
        formatter: (value: any) => `${value}年`
      },
      y: {
        formatter: (value: number, { seriesName }: { seriesName: string }) => 
          displayMode === 'absolute' ? `${value}人` : `${value}%`
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow p-6">
      {/* コントロールパネル */}
      <div className="mb-6 space-y-4">
        {/* 表示モード切り替えタブ */}
        <div className="flex justify-start mb-6 border-b border-gray-700">
          <button
            onClick={() => setDisplayMode('absolute')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              displayMode === 'absolute'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            件数
          </button>
          <button
            onClick={() => setDisplayMode('percentage')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              displayMode === 'percentage'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-400/5'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            割合
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-4xl mx-auto px-12">
          {/* 犯罪種別選択 */}
          <div className="w-full md:w-72">
            <select
              value={selectedCrimeType}
              onChange={(e) => setSelectedCrimeType(e.target.value as CrimeType)}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 hover:border-gray-500 transition-all duration-200 cursor-pointer"
            >
              <option value="" disabled className="bg-gray-800 text-gray-400">犯罪種別を選択</option>
              {Object.entries(crimeTypeLabels).map(([value, label]) => (
                <option key={value} value={value} className="bg-gray-800 text-white py-2">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 地域フィルター */}
          <div className="w-full md:w-72">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-lg text-white focus:outline-none focus:border-emerald-400 hover:border-gray-500 transition-all duration-200 cursor-pointer"
            >
              <option value="" disabled className="bg-gray-800 text-gray-400">地域を選択</option>
              {regions.map(region => (
                <option key={region} value={region} className="bg-gray-800 text-white py-2">
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* チャート */}
      <div className="h-[500px]">
        <Chart
          options={options}
          series={chartData.series}
          type="line"
          height="100%"
        />
      </div>

      {/* データソース */}
      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>データソース: {data.metadata.dataSource}</p>
        <p>対象期間: {data.metadata.period}</p>
        <p>定義: {data.metadata.definition}</p>
        <p>抽出日: {data.metadata.extractedDate}</p>
      </div>
    </div>
  );
};