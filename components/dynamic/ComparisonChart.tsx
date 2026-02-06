'use client';

import { useChartAnimation } from '@/hooks/useChartAnimation';
import { getBaseChartOptions, getDatasetConfig, CHART_COLORS, PIXEL_FONT } from '@/utils/charts/chart-config';
import { BaseChart } from '@/components/shared';

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

export function ComparisonChart({ title, datasets }: ComparisonChartProps) {
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
        color: 'var(--color-primary)',
        font: {
          family: PIXEL_FONT,
          size: 12,
        },
        padding: 20,
      },
    },
  };

  return <BaseChart data={chartData} options={options} />;
}

// Made with Bob
