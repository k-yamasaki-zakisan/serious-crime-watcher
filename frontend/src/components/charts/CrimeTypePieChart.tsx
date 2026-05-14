import React from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import type { CrimeDataset } from '../../types/crime-data';

interface Props {
  data: CrimeDataset['foreignerCrimes']['byNationality'];
}

export const CrimeTypePieChart: React.FC<Props> = ({ data }) => {
  // 全体の犯罪種別を集計
  const crimeTypeData = data.reduce((acc, item) => {
    return {
      murder: acc.murder + item.seriousCrimes.murder,
      robbery: acc.robbery + item.seriousCrimes.robbery,
      arson: acc.arson + item.seriousCrimes.arson,
      sexualAssault: acc.sexualAssault + item.seriousCrimes.sexualAssault,
      abduction: acc.abduction + item.seriousCrimes.abduction,
      indecency: acc.indecency + item.seriousCrimes.indecency,
      burglary: acc.burglary + item.seriousTheft.burglary,
      autoTheft: acc.autoTheft + item.seriousTheft.autoTheft,
      snatching: acc.snatching + item.seriousTheft.snatching,
      pickpocketing: acc.pickpocketing + item.seriousTheft.pickpocketing,
    };
  }, {
    murder: 0, robbery: 0, arson: 0, sexualAssault: 0, 
    abduction: 0, indecency: 0, burglary: 0, autoTheft: 0,
    snatching: 0, pickpocketing: 0
  });

  const chartData = [
    { label: '殺人', value: crimeTypeData.murder, category: '重要犯罪' },
    { label: '強盗', value: crimeTypeData.robbery, category: '重要犯罪' },
    { label: '放火', value: crimeTypeData.arson, category: '重要犯罪' },
    { label: '不同意性交等', value: crimeTypeData.sexualAssault, category: '重要犯罪' },
    { label: '略取誘拐・人身売買', value: crimeTypeData.abduction, category: '重要犯罪' },
    { label: '不同意わいせつ', value: crimeTypeData.indecency, category: '重要犯罪' },
    { label: '侵入盗', value: crimeTypeData.burglary, category: '重要窃盗犯' },
    { label: '自動車盗', value: crimeTypeData.autoTheft, category: '重要窃盗犯' },
    { label: 'ひったくり', value: crimeTypeData.snatching, category: '重要窃盗犯' },
    { label: 'すり', value: crimeTypeData.pickpocketing, category: '重要窃盗犯' },
  ].filter(item => item.value > 0); // 0件のものは除外

  const chartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 450,
    },
    labels: chartData.map(item => item.label),
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts) => {
        const value = chartData[opts.seriesIndex].value;
        return `${val.toFixed(1)}%\n(${value}件)`;
      },
    },
    colors: [
      '#DC2626', '#EF4444', '#F87171', '#FCA5A5', // 重要犯罪（赤系）
      '#FBBF24', '#F59E0B', // 重要犯罪（黄系）
      '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE' // 重要窃盗犯（青系）
    ],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '13px',
      itemMargin: {
        horizontal: 5,
        vertical: 5,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number, opts) => {
          const dataIndex = opts.seriesIndex;
          const item = chartData[dataIndex];
          const total = chartData.reduce((sum, d) => sum + d.value, 0);
          const percentage = ((item.value / total) * 100).toFixed(1);
          return `
            <div>
              <div><strong>${item.category}</strong></div>
              <div>${item.value}件 (${percentage}%)</div>
            </div>
          `;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: 350,
          },
          legend: {
            fontSize: '11px',
          },
        },
      },
    ],
  };

  const series = chartData.map(item => item.value);

  if (data.length === 0 || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">犯罪種別構成</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          データがありません
        </div>
      </div>
    );
  }

  const totalCrimes = chartData.reduce((sum, item) => sum + item.value, 0);
  const seriousCrimes = chartData.filter(item => item.category === '重要犯罪')
    .reduce((sum, item) => sum + item.value, 0);
  const theftCrimes = chartData.filter(item => item.category === '重要窃盗犯')
    .reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        犯罪種別構成（重要犯罪・重要窃盗犯）
      </h3>
      
      {/* 概要統計 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-bold text-red-700">{seriousCrimes}</div>
          <div className="text-sm text-red-600">重要犯罪</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-700">{theftCrimes}</div>
          <div className="text-sm text-blue-600">重要窃盗犯</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-lg font-bold text-gray-700">{totalCrimes}</div>
          <div className="text-sm text-gray-600">合計</div>
        </div>
      </div>

      <ReactApexChart
        options={chartOptions}
        series={series}
        type="pie"
        height={450}
      />
      
      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>重要犯罪</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>重要窃盗犯</span>
          </div>
        </div>
        <p>⚖️ 重要犯罪: 殺人・強盗・放火・性犯罪等の重大な犯罪</p>
        <p>🔒 重要窃盗犯: 侵入盗・自動車盗等の組織的・計画的な窃盗</p>
      </div>
    </div>
  );
};