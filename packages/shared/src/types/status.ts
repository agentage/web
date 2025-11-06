export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
}

export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

export interface SystemStatus {
  backend: HealthStatus & {
    environment: string;
    node_version: string;
    memory: MemoryUsage;
  };
  environment: string;
}
