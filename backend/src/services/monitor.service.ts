import axios from 'axios';
import kubernetesService from './kubernetes.service';
import logger from '../utils/logger';

export interface MonitorOptions {
  timeout: number; // milliseconds
  pollInterval?: number; // milliseconds
}

export class MonitorService {
  private defaultPollInterval = 5000; // 5 seconds

  /**
   * Wait for store to be ready
   */
  async waitForReady(namespace: string, options: MonitorOptions): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = options.pollInterval || this.defaultPollInterval;

    logger.info('Starting readiness check', { namespace, timeout: options.timeout });

    while (Date.now() - startTime < options.timeout) {
      const isReady = await this.checkReadiness(namespace);

      if (isReady) {
        logger.info('Store is ready', {
          namespace,
          duration: Date.now() - startTime
        });
        return true;
      }

      logger.debug('Store not ready yet, retrying...', {
        namespace,
        elapsed: Date.now() - startTime
      });

      await this.sleep(pollInterval);
    }

    logger.warn('Store readiness timeout', {
      namespace,
      timeout: options.timeout
    });
    return false;
  }

  /**
   * Check if store is ready
   */
  private async checkReadiness(namespace: string): Promise<boolean> {
    try {
      // Check if namespace exists
      const namespaceExists = await kubernetesService.namespaceExists(namespace);
      if (!namespaceExists) {
        logger.debug('Namespace does not exist yet', { namespace });
        return false;
      }

      // Check WordPress Deployment
      const wpReady = await kubernetesService.getDeploymentStatus(namespace, 'wordpress');
      if (!wpReady) {
        logger.debug('WordPress deployment not ready', { namespace });
        return false;
      }

      // Check MySQL StatefulSet
      const mysqlReady = await kubernetesService.getStatefulSetStatus(namespace, 'mysql');
      if (!mysqlReady) {
        logger.debug('MySQL StatefulSet not ready', { namespace });
        return false;
      }

      // Check all pods are ready
      const allPodsReady = await kubernetesService.areAllPodsReady(namespace);
      if (!allPodsReady) {
        logger.debug('Not all pods are ready', { namespace });
        return false;
      }

      /*
      // Optional: HTTP check to verify WordPress is responding
      const httpReady = await this.checkHttpEndpoint(namespace);
      if (!httpReady) {
        logger.debug('HTTP endpoint not ready', { namespace });
        return false;
      }
      */

      return true;
    } catch (error: any) {
      logger.error('Error during readiness check', {
        namespace,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Check if HTTP endpoint is responding
   */
  private async checkHttpEndpoint(namespace: string): Promise<boolean> {
    try {
      // Get the ingress host
      const host = await kubernetesService.getIngressHost(namespace, 'wordpress-ingress');
      if (!host) {
        logger.debug('Ingress host not found', { namespace });
        return false;
      }

      // Try to make an HTTP request
      const url = `http://${host}`;
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: (status) => status < 500, // Accept any status < 500
        maxRedirects: 5
      });

      logger.debug('HTTP endpoint check', {
        namespace,
        url,
        status: response.status
      });

      return response.status < 500;
    } catch (error: any) {
      logger.debug('HTTP endpoint not accessible', {
        namespace,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new MonitorService();
