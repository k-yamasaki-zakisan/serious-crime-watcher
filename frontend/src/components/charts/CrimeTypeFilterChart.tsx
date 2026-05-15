import React, { useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import type { CrimeType } from '../../types/crime-data';

interface CrimeTypeFilterChartProps {
  data: CrimeType[];
  title?: string;
}

export const CrimeTypeFilterChart: React.FC<CrimeTypeFilterChartProps> = ({ 
  data, 
  title = "犯罪種別フィルター" 
}) => {
  const [selectedCrimes, setSelectedCrimes] = useState<string[]>(
    data.slice(0, 5).map(crime => crime.code)
  );
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  const filteredData = useMemo(() => {
    return data.filter(crime => selectedCrimes.includes(crime.code));
  }, [data, selectedCrimes]);

  const chartData = useMemo(() => {
    return [
      {
        name: '認知件数',
        data: filteredData.map(crime => ({
          x: crime.name,
          y: crime.recognized
        }))
      },
      {
        name: '検挙件数', 
        data: filteredData.map(crime => ({
          x: crime.name,
          y: crime.arrested
        }))
      }
    ];
  }, [filteredData]);

  const options: ApexOptions = {
    chart: {
      type: chartType,
      height: 400,
      toolbar: {
        show: true
      },
      background: 'transparent'
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: chartType === 'line' ? 3 : 1
    },
    colors: ['#ef4444', '#10b981'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    xaxis: {
      type: 'category',
      title: {
        text: '犯罪種別',
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
        text: '件数',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        formatter: (value) => `${Math.round(value / 1000)}K`
      }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (value) => `${value.toLocaleString()}件`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    responsive: [{
      breakpoint: 768,
      options: {
        xaxis: {
          labels: {
            rotate: -90
          }
        }
      }
    }]
  };

  const handleCrimeToggle = (crimeCode: string) => {
    setSelectedCrimes(prev => 
      prev.includes(crimeCode)
        ? prev.filter(code => code !== crimeCode)
        : [...prev, crimeCode]
    );
  };

  const handleSelectAll = () => {
    setSelectedCrimes(data.map(crime => crime.code));
  };

  const handleClearAll = () => {
    setSelectedCrimes([]);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        
        {/* Chart Type Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['bar', 'line', 'area'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                chartType === type
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {type === 'bar' ? '棒' : type === 'line' ? '線' : 'エリア'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">犯罪種別フィルター ({selectedCrimes.length}選択中)</span>
          <div className="space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              全選択
            </button>
            <button
              onClick={handleClearAll}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              全解除
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
          {data.map((crime) => (
            <label
              key={crime.code}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
            >
              <input
                type="checkbox"
                checked={selectedCrimes.includes(crime.code)}
                onChange={() => handleCrimeToggle(crime.code)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 truncate">{crime.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Chart */}
      {filteredData.length > 0 ? (
        <Chart
          options={options}
          series={chartData}
          type={chartType}
          height={400}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>犯罪種別を選択してください</p>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      {filteredData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-red-600">
              {filteredData.reduce((sum, crime) => sum + crime.recognized, 0).toLocaleString()}
            </div>
            <div className="text-xs text-red-500">総認知件数</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {filteredData.reduce((sum, crime) => sum + crime.arrested, 0).toLocaleString()}
            </div>
            <div className="text-xs text-green-500">総検挙件数</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {Math.round((filteredData.reduce((sum, crime) => sum + crime.arrested, 0) / 
                           filteredData.reduce((sum, crime) => sum + crime.recognized, 0)) * 100)}%
            </div>
            <div className="text-xs text-blue-500">平均検挙率</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {filteredData.length}
            </div>
            <div className="text-xs text-purple-500">選択中の種別</div>
          </div>
        </div>
      )}
    </div>
  );
};