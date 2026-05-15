import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import type { YearlyTrend } from '../../types/crime-data';

interface TimeSeriesChartProps {
  data: YearlyTrend[];
  title?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, title = "犯罪統計推移" }) => {
  const chartData = [
    {
      name: '認知件数',
      data: data.map(item => ({
        x: item.year,
        y: item.totalRecognized
      }))
    },
    {
      name: '検挙件数',
      data: data.map(item => ({
        x: item.year,
        y: item.totalArrested
      }))
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: {
        enabled: true
      },
      toolbar: {
        show: true
      },
      background: 'transparent'
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#3b82f6', '#10b981'],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    markers: {
      size: 5,
      hover: {
        size: 7
      }
    },
    xaxis: {
      type: 'numeric',
      title: {
        text: '年度',
        style: {
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151'
        }
      },
      labels: {
        formatter: (value) => `${value}年`
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
      x: {
        formatter: (value) => `${value}年`
      },
      y: {
        formatter: (value) => `${value.toLocaleString()}件`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <Chart
        options={options}
        series={chartData}
        type="line"
        height={350}
      />
    </div>
  );
};