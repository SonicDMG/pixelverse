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
  ChartData,
  ChartOptions,
} from 'chart.js';
import { CHART_STYLES } from '@/constants/styles';

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

interface BaseChartProps {
  /** Chart data in Chart.js format */
  data: ChartData<'line'>;
  /** Chart options (will be merged with defaults) */
  options?: ChartOptions<'line'>;
  /** Additional CSS classes */
  className?: string;
  /** Chart container variant */
  variant?: 'container' | 'compact';
}

/**
 * BaseChart - A reusable Chart.js line chart component with consistent styling
 * 
 * Provides a standardized chart component that handles Chart.js setup and
 * applies consistent pixel-themed styling. Accepts custom data and options
 * that will be merged with sensible defaults.
 * 
 * @example
 * ```tsx
 * const chartData = {
 *   labels: ['Jan', 'Feb', 'Mar'],
 *   datasets: [{
 *     label: 'Sales',
 *     data: [100, 200, 150],
 *     borderColor: '#4169E1',
 *   }]
 * };
 * 
 * <BaseChart data={chartData} />
 * ```
 */
export function BaseChart({
  data,
  options,
  className = '',
  variant = 'container',
}: BaseChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const containerStyles = CHART_STYLES[variant];

  return (
    <div className={`${containerStyles} ${className}`}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}

// Made with Bob
