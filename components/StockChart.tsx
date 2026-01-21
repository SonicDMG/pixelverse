'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { StockDataPoint } from '@/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  data: StockDataPoint[];
  symbol?: string;
}

export default function StockChart({ data, symbol }: StockChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: symbol ? `${symbol} Stock Price` : 'Stock Price',
        data: data.map(d => d.price),
        borderColor: '#00ff9f',
        backgroundColor: 'rgba(0, 255, 159, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#00ff9f',
        pointBorderColor: '#0a0e27',
        pointBorderWidth: 2,
        tension: 0, // No curve for pixel art effect
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#00ff9f',
          font: {
            family: "'Press Start 2P', monospace",
            size: 10,
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: '#0a0e27',
        titleColor: '#00ff9f',
        bodyColor: '#ffffff',
        borderColor: '#00ff9f',
        borderWidth: 2,
        padding: 12,
        displayColors: false,
        titleFont: {
          family: "'Press Start 2P', monospace",
          size: 10,
        },
        bodyFont: {
          family: "'Press Start 2P', monospace",
          size: 8,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 255, 159, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#00ff9f',
          font: {
            family: "'Press Start 2P', monospace",
            size: 8,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 255, 159, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: '#00ff9f',
          font: {
            family: "'Press Start 2P', monospace",
            size: 8,
          },
          callback: function(value: any) {
            return '$' + value.toFixed(2);
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-6 bg-[#0a0e27] border-4 border-[#00ff9f] rounded-lg pixel-border">
      <Line data={chartData} options={options} />
    </div>
  );
}

// Made with Bob
