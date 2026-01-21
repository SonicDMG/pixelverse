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

interface ComparisonChartProps {
  title: string;
  datasets: Array<{
    label: string;
    data: Array<{
      date: string;
      value: number;
    }>;
    color?: string;
  }>;
}

const COLORS = ['#00ff9f', '#ff00ff', '#00d4ff', '#ffff00'];

export default function ComparisonChart({ title, datasets }: ComparisonChartProps) {
  const labels = datasets[0]?.data.map(d => d.date) || [];

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data.map(d => d.value),
      borderColor: dataset.color || COLORS[index % COLORS.length],
      backgroundColor: `${dataset.color || COLORS[index % COLORS.length]}20`,
      borderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: dataset.color || COLORS[index % COLORS.length],
      pointBorderColor: '#0a0e27',
      pointBorderWidth: 2,
      tension: 0,
      fill: false,
    })),
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
      title: {
        display: true,
        text: title,
        color: '#00ff9f',
        font: {
          family: "'Press Start 2P', monospace",
          size: 12,
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: '#0a0e27',
        titleColor: '#00ff9f',
        bodyColor: '#ffffff',
        borderColor: '#00ff9f',
        borderWidth: 2,
        padding: 12,
        displayColors: true,
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
