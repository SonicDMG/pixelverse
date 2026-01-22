/**
 * Shared Chart.js configuration and utilities
 * Eliminates duplication between StockChart and ComparisonChart
 */

export const CHART_COLORS = ['#00ff9f', '#ff00ff', '#00d4ff', '#ffff00'] as const;
export const PIXEL_FONT = "'Press Start 2P', monospace";

/**
 * Base Chart.js options shared across all chart components
 */
export const getBaseChartOptions = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0, // Disable default animation since we use custom progressive drawing
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: '#00ff9f',
        font: {
          family: PIXEL_FONT,
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
      displayColors: true,
      titleFont: {
        family: PIXEL_FONT,
        size: 10,
      },
      bodyFont: {
        family: PIXEL_FONT,
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
          family: PIXEL_FONT,
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
          family: PIXEL_FONT,
          size: 8,
        },
        callback: function(value: any) {
          return '$' + value.toFixed(2);
        },
      },
    },
  },
});

/**
 * Get chart dataset configuration with pixel art styling
 */
export const getDatasetConfig = (
  label: string,
  data: number[],
  color: string,
  fill: boolean = true
) => ({
  label,
  data,
  borderColor: color,
  backgroundColor: fill ? `${color}20` : 'transparent',
  borderWidth: 3,
  pointRadius: 6,
  pointHoverRadius: 8,
  pointBackgroundColor: color,
  pointBorderColor: '#0a0e27',
  pointBorderWidth: 2,
  tension: 0, // No curve for pixel art effect
  fill,
});

// Made with Bob