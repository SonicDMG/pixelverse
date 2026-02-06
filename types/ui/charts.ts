/**
 * Chart UI Component Types
 * Types for chart-based visualizations
 */

import { UIComponentSpec } from './base';

export interface LineChartSpec extends UIComponentSpec {
  type: 'line-chart';
  props: {
    title: string;
    data: Array<{
      date: string;
      value: number;
      label?: string;
    }>;
    symbol?: string;
    color?: string;
    showVolume?: boolean;
  };
}

export interface ComparisonChartSpec extends UIComponentSpec {
  type: 'comparison-chart';
  props: {
    title: string;
    datasets: Array<{
      label: string;
      data: Array<{
        date: string;
        value: number;
      }>;
      color?: string;
    }>;
  };
}

// Made with Bob