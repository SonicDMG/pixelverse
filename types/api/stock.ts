/**
 * Stock API Types
 * Types for stock data and queries
 */

import type { ComponentSpec } from '../ui';

// Stock data point for charts
export interface StockDataPoint {
  date: string;
  price: number;
  volume?: number;
}

// Stock query result
export interface StockQueryResult {
  answer: string;
  stockData?: StockDataPoint[];
  symbol?: string;
  error?: string;
  components?: ComponentSpec[];
}

// Made with Bob