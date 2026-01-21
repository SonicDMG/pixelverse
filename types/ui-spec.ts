/**
 * UI Specification Types
 * These define the structure for dynamic UI components that the Langflow agent can return
 */

// Base UI component specification
export interface UIComponentSpec {
  type: string;
  props: Record<string, any>;
  id?: string;
}

// Specific component types

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

export interface DataTableSpec extends UIComponentSpec {
  type: 'data-table';
  props: {
    title: string;
    headers: string[];
    rows: Array<Array<string | number>>;
    highlightColumn?: number;
  };
}

export interface ComparisonTableSpec extends UIComponentSpec {
  type: 'comparison-table';
  props: {
    title: string;
    items: Array<{
      label: string;
      value1: string | number;
      value2: string | number;
      change?: number;
    }>;
    column1Label: string;
    column2Label: string;
  };
}

export interface MetricCardSpec extends UIComponentSpec {
  type: 'metric-card';
  props: {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    subtitle?: string;
  };
}

export interface MetricGridSpec extends UIComponentSpec {
  type: 'metric-grid';
  props: {
    metrics: Array<{
      label: string;
      value: string | number;
      change?: number;
      icon?: string;
    }>;
  };
}

export interface AlertBoxSpec extends UIComponentSpec {
  type: 'alert-box';
  props: {
    message: string;
    severity: 'info' | 'warning' | 'success' | 'error';
    title?: string;
  };
}

export interface TextBlockSpec extends UIComponentSpec {
  type: 'text-block';
  props: {
    content: string;
    format?: 'plain' | 'markdown';
  };
}

// Union type of all possible component specs
export type ComponentSpec =
  | LineChartSpec
  | ComparisonChartSpec
  | DataTableSpec
  | ComparisonTableSpec
  | MetricCardSpec
  | MetricGridSpec
  | AlertBoxSpec
  | TextBlockSpec;

// Response from Langflow with UI specifications
export interface UIResponse {
  text: string;
  components?: ComponentSpec[];
}

// Made with Bob
