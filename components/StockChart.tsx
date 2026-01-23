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
import { StockDataPoint } from '@/types';
import { useChartAnimation } from '@/hooks/useChartAnimation';
import { getBaseChartOptions, getDatasetConfig, CHART_COLORS } from '@/utils/chart-config';

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
  const chartRef = useRef<ChartJS<'line'>>(null);
  const animationProgress = useChartAnimation(data.length);

  const visibleDataCount = Math.floor(data.length * animationProgress);
  const visibleData = data.slice(0, Math.max(1, visibleDataCount));

  const chartData = {
    labels: visibleData.map(d => d.date),
    datasets: [
      getDatasetConfig(
        symbol ? `${symbol} Stock Price` : 'Stock Price',
        visibleData.map(d => d.price),
        CHART_COLORS[0],
        true
      ),
    ],
  };

  const options = {
    ...getBaseChartOptions(),
    plugins: {
      ...getBaseChartOptions().plugins,
      tooltip: {
        ...getBaseChartOptions().plugins.tooltip,
        displayColors: false,
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-6 bg-[#0a0e27] border-4 border-[#4169E1] rounded-lg pixel-border">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}

// Made with Bob
