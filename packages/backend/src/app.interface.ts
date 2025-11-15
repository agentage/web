/**
 * App interfaces for server factory
 */

import { Express } from 'express';
import { AppServiceMap, ServiceProvider } from './services';

export interface AppInstance {
  server: Express;
  serviceProvider: ServiceProvider<AppServiceMap>;
}

export interface AppInterface {
  createServer: (serviceProvider: ServiceProvider<AppServiceMap>) => Promise<AppInstance>;
}
