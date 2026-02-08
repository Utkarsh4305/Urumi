import path from 'path';
import { execCommand } from '../utils/exec';
import logger from '../utils/logger';

export interface HelmValues {
  storeId: string;
  dbPassword: string;
  wpAdminPassword: string;
  ingressHost: string;
}

export class HelmService {
  private chartPath: string;

  constructor() {
    this.chartPath = path.resolve(
      __dirname,
      process.env.HELM_CHART_PATH || '../../helm/store'
    );
    logger.info('Helm service initialized', { chartPath: this.chartPath });
  }

  /**
   * Install a Helm release
   */
  async install(
    releaseName: string,
    namespace: string,
    values: HelmValues
  ): Promise<void> {
    const valuesFile = process.env.ENVIRONMENT === 'production'
      ? 'values-prod.yaml'
      : 'values-local.yaml';

    const valuesFilePath = path.join(this.chartPath, valuesFile);

    const command = [
      'helm', 'install',
      releaseName,
      this.chartPath,
      '--namespace', namespace,
      '--create-namespace',
      '--values', `"${valuesFilePath}"`,
      '--set', `storeId=${values.storeId}`,
      '--set', `wordpress.adminPassword=${values.wpAdminPassword}`,
      '--set', `mysql.auth.rootPassword=${values.dbPassword}`,
      '--set', `mysql.auth.password=${values.dbPassword}`,
      '--set', `ingress.hosts[0].host=${values.ingressHost}`,
      '--wait',
      '--timeout', '5m'
    ].join(' ');

    logger.info('Installing Helm chart', {
      releaseName,
      namespace,
      chart: this.chartPath,
      valuesFile
    });

    try {
      const result = await execCommand(command, { timeout: 360000 }); // 6 minutes
      logger.info('Helm chart installed successfully', {
        releaseName,
        namespace,
        stdout: result.stdout
      });
    } catch (error: any) {
      logger.error('Helm install failed', {
        releaseName,
        namespace,
        error: error.message,
        stderr: error.stderr
      });
      throw new Error(`Helm install failed: ${error.stderr || error.message}`);
    }
  }

  /**
   * Uninstall a Helm release
   */
  async uninstall(releaseName: string, namespace: string): Promise<void> {
    const command = [
      'helm', 'uninstall',
      releaseName,
      '--namespace', namespace,
      '--wait',
      '--timeout', '3m'
    ].join(' ');

    logger.info('Uninstalling Helm chart', { releaseName, namespace });

    try {
      const result = await execCommand(command, { timeout: 240000 }); // 4 minutes
      logger.info('Helm chart uninstalled successfully', {
        releaseName,
        namespace,
        stdout: result.stdout
      });
    } catch (error: any) {
      logger.error('Helm uninstall failed', {
        releaseName,
        namespace,
        error: error.message,
        stderr: error.stderr
      });
      throw new Error(`Helm uninstall failed: ${error.stderr || error.message}`);
    }
  }

  /**
   * Get release status
   */
  async getStatus(releaseName: string, namespace: string): Promise<string | null> {
    const command = [
      'helm', 'status',
      releaseName,
      '--namespace', namespace,
      '--output', 'json'
    ].join(' ');

    try {
      const result = await execCommand(command);
      const status = JSON.parse(result.stdout);
      return status.info?.status || null;
    } catch (error: any) {
      if (error.stderr?.includes('not found')) {
        return null;
      }
      logger.error('Failed to get Helm release status', {
        releaseName,
        namespace,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Check if Helm is installed
   */
  async checkHelm(): Promise<boolean> {
    try {
      await execCommand('helm version');
      return true;
    } catch (error) {
      logger.error('Helm is not installed or not in PATH');
      return false;
    }
  }
}

export default new HelmService();
