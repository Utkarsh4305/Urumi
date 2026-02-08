import { Request, Response, NextFunction } from 'express';
import kubernetesService from '../services/kubernetes.service';
import helmService from '../services/helm.service';
import knex from 'knex';
import dbConfig from '../config/database';
import logger from '../utils/logger';

const db = knex(dbConfig[process.env.NODE_ENV || 'development']);

export class HealthController {
  /**
   * Health check endpoint
   * GET /api/health
   */
  async checkHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: false,
          kubernetes: false,
          helm: false
        }
      };

      // Check database
      try {
        await db.raw('SELECT 1');
        health.checks.database = true;
      } catch (error: any) {
        logger.error('Database health check failed', { error: error.message });
        health.status = 'unhealthy';
      }

      // Check Kubernetes
      try {
        const k8sHealthy = await kubernetesService.checkConnectivity();
        health.checks.kubernetes = k8sHealthy;
        if (!k8sHealthy) {
          health.status = 'unhealthy';
        }
      } catch (error: any) {
        logger.error('Kubernetes health check failed', { error: error.message });
        health.status = 'unhealthy';
      }

      // Check Helm
      try {
        const helmHealthy = await helmService.checkHelm();
        health.checks.helm = helmHealthy;
        if (!helmHealthy) {
          health.status = 'unhealthy';
        }
      } catch (error: any) {
        logger.error('Helm health check failed', { error: error.message });
        health.status = 'unhealthy';
      }

      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      next(error);
    }
  }
}

export default new HealthController();
