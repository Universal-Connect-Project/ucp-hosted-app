import type { Aggregator } from "./aggregator";

export interface PerformanceDataPoint {
  midpoint: string;
  start: string;
  stop: string;
  [key: string]: string;
}

export interface GraphMetricsResponse {
  performance: PerformanceDataPoint[];
}

export interface AggregatorGraphMetricsResponse {
  aggregators: Aggregator[];
  performance: PerformanceDataPoint[];
}
