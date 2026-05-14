import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { CrimeDataset } from '../../types/crime-data';

interface Props {
  data: CrimeDataset['foreignerCrimes']['byPrefecture'];
}

export const PrefectureDonutChart: React.FC<Props> = ({ data }) => {
  // データを総件数でソートして上位8都道府県を取得、残りはその他に集約
  const sortedData = [...data].sort((a, b) => b.totalCases - a.totalCases);
  const top8 = sortedData.slice(0, 8);
  const others = sortedData.slice(8);
  
  const othersTotal = others.reduce((sum, item) => sum + item.totalCases, 0);
  
  const chartData = [
    ...top8.map(item => ({
      label: item.prefecture,
      value: item.totalCases,
    })),
    ...(othersTotal > 0 ? [{
      label: 'その他',
      value: othersTotal,
    }] : []),
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 400,
    },
    labels: chartData.map(item => item.label),
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts) => {
        const value = chartData[opts.seriesIndex].value;
        return `${val.toFixed(1)}%\n(${value.toLocaleString()}件)`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: '総件数',
              formatter: () => {
                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                return total.toLocaleString() + '件';
              },
            },
          },
        },
      },
    },
    colors: [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6', '#F97316'
    ],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
    },
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const dataIndex = opts.seriesIndex;
          const item = chartData[dataIndex];
          const percentage = ((item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);
          return `${item.value.toLocaleString()}件 (${percentage}%)`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 300,
          },
          legend: {
            fontSize: '12px',
          },
        },
      },
    ],
  };

  const series = chartData.map(item => item.value);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">都道府県別分布</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        都道府県別検挙件数分布
      </h3>
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="donut"
        height={400}
      />
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-600">
          <p>📍 上位8都道府県と「その他」で表示</p>
          <p>🏙️ 都市部に集中する傾向は人口密度や外国人人口と相関</p>
        </div>
        
        {/* 詳細データテーブル */}
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">順位</th>
                <th className="px-3 py-2 text-left">都道府県</th>
                <th className="px-3 py-2 text-right">件数</th>
                <th className="px-3 py-2 text-right">構成比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {top8.map((item, index) => {
                const total = data.reduce((sum, d) => sum + d.totalCases, 0);
                const percentage = ((item.totalCases / total) * 100).toFixed(1);
                return (
                  <tr key={item.prefecture} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{index + 1}</td>
                    <td className="px-3 py-2">{item.prefecture}</td>
                    <td className="px-3 py-2 text-right">{item.totalCases.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};