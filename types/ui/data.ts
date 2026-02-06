/**
 * Data Display UI Component Types
 * Types for data tables, metrics, and text displays
 */

import { UIComponentSpec } from './base';

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

export interface TextSpec extends UIComponentSpec {
  type: 'text';
  props: {
    content: string;
    format?: 'plain' | 'markdown';
  };
}

export interface TextBlockSpec extends UIComponentSpec {
  type: 'text-block';
  props: {
    content: string;
    format?: 'plain' | 'markdown';
  };
}

// Made with Bob