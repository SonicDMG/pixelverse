'use client';

import { StockDataPoint } from '@/types';
import { useChartAnimation } from '@/hooks/useChartAnimation';
import { getBaseChartOptions, getDatasetConfig, CHART_COLORS } from '@/utils/charts/chart-config';
import { BaseChart } from '@/components/shared';

interface StockChartProps {
  data: StockDataPoint[];
  symbol?: string;
}

export function StockChart({ data, symbol }: StockChartProps) {
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

  return <BaseChart data={chartData} options={options} />;
}

// Made with Bob
