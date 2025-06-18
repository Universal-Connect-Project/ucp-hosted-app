import type { Aggregator } from "./aggregator";

interface AggregatorWithIndex extends Aggregator {
  aggregatorIndex: number;
}

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
  aggregators: AggregatorWithIndex[];
  performance: PerformanceDataPoint[];
}
