import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { CrimeDataset } from '../../types/crime-data';

interface Props {
  data: CrimeDataset['foreignerCrimes']['byNationality'];
}

export const NationalityBarChart: React.FC<Props> = ({ data }) => {
  // データを総人員でソートして上位10カ国を取得
  const sortedData = [...data]
    .sort((a, b) => b.totalPersons - a.totalPersons)
    .slice(0, 10);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 400,
      toolbar: {
        show: true,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString(),
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['transparent'],
    },
    xaxis: {
      categories: sortedData.map(item => item.country),
      title: {
        text: '国・地域',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
    },
    yaxis: {
      title: {
        text: '検挙人員（人）',
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
      labels: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const dataIndex = opts.dataPointIndex;
          const item = sortedData[dataIndex];
          return `
            <div>
              <div>検挙人員: ${val.toLocaleString()}人</div>
              <div>重要犯罪: ${item.seriousCrimes.total}件</div>
              <div>重要窃盗: ${item.seriousTheft.total}件</div>
              <div>地域: ${item.region}</div>
            </div>
          `;
        },
      },
    },
    colors: ['#3B82F6', '#EF4444', '#10B981'],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
    },
  };

  const series = [
    {
      name: '総検挙人員',
      data: sortedData.map(item => item.totalPersons),
    },
    {
      name: '重要犯罪',
      data: sortedData.map(item => item.seriousCrimes.total),
    },
    {
      name: '重要窃盗犯',
      data: sortedData.map(item => item.seriousTheft.total),
    },
  ];

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">国籍別検挙状況</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        国籍別検挙状況（上位10カ国・地域）
      </h3>
      <ReactApexChart
        options={chartOptions}
        series={series}
        type="bar"
        height={400}
      />
      <div className="mt-4 text-sm text-gray-600">
        <p>💡 統計的公平性について: 人口規模の違いを考慮した比較が重要です</p>
        <p>📊 データは検挙ベース（起訴・有罪とは異なります）</p>
      </div>
    </div>
  );
};