'use client';

import { useRef } from 'react';
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
import { useChartAnimation } from '@/hooks/useChartAnimation';
import { getBaseChartOptions, getDatasetConfig, CHART_COLORS, PIXEL_FONT } from '@/utils/chart-config';

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

export default function ComparisonChart({ title, datasets }: ComparisonChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const dataLength = datasets[0]?.data.length || 0;
  const animationProgress = useChartAnimation(dataLength);

  const visibleDataCount = Math.floor(dataLength * animationProgress);
  const labels = datasets[0]?.data.slice(0, Math.max(1, visibleDataCount)).map(d => d.date) || [];

  const chartData = {
    labels,
    datasets: datasets.map((dataset, index) => {
      const color = dataset.color || CHART_COLORS[index % CHART_COLORS.length];
      return getDatasetConfig(
        dataset.label,
        dataset.data.slice(0, Math.max(1, visibleDataCount)).map(d => d.value),
        color,
        false // No fill for comparison charts
      );
    }),
  };

  const options = {
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      title: {
        display: true,
        text: title,
        color: '#00ff9f',
        font: {
          family: PIXEL_FONT,
          size: 12,
        },
        padding: 20,
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-6 bg-[#0a0e27] border-4 border-[#00ff9f] rounded-lg pixel-border">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

// Made with Bob
