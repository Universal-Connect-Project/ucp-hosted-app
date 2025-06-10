export interface PerformanceDataPoint {
  midpoint: string;
  start: string;
  stop: string;
  [key: string]: string;
}

export interface GraphMetricsResponse {
  performance: PerformanceDataPoint[];
}