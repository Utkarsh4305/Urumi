import { Request, Response, NextFunction } from 'express';
import kubernetesService from '../services/kubernetes.service';
import helmService from '../services/helm.service';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export class HealthController {
  /**
   * Health check endpoint
   * GET /api/health
   */
  async checkHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
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

      // Check database (Supabase)
      try {
        const { error } = await supabase.from('stores').select('id').limit(1);
        health.checks.database = !error;
        if (error) {
          logger.error('Database health check failed', { error: error.message });
          health.status = 'unhealthy';
        }
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
