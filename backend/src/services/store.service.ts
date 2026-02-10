import storeRepository from '../repositories/store.repository';
import kubernetesService from './kubernetes.service';
import helmService from './helm.service';
import monitorService from './monitor.service';
import { Store, StoreType } from '../models/store.model';
import { generateStoreId, generatePassword, generateNamespace } from '../utils/crypto';
import logger from '../utils/logger';

const MAX_STORES = parseInt(process.env.MAX_STORES || '50');
const MAX_CONCURRENT_PROVISIONS = parseInt(process.env.MAX_CONCURRENT_PROVISIONS || '3');

export class StoreService {
  private provisioningCount = 0;

  /**
   * Create a new store
   */
  async createStore(type: StoreType): Promise<Store> {
    // Check if we've reached the maximum number of stores
    const totalStores = await storeRepository.count();
    if (totalStores >= MAX_STORES) {
      throw new Error(`Maximum number of stores (${MAX_STORES}) reached`);
    }

    // Check if we're at concurrent provisioning limit
    if (this.provisioningCount >= MAX_CONCURRENT_PROVISIONS) {
      throw new Error(
        `Maximum concurrent provisions (${MAX_CONCURRENT_PROVISIONS}) reached. Please try again later.`
      );
    }

    // Generate unique store ID
    const storeId = generateStoreId(12);
    const namespace = generateNamespace(storeId);

    // Create DB record with "Provisioning" status
    const store = await storeRepository.create({
      id: storeId,
      type,
      namespace,
      status: 'Provisioning',
      url: null
    });

    logger.info('Store creation initiated', { storeId, type });

    // Start async provisioning (don't block API response)
    this.provisionStoreAsync(store).catch((err) => {
      logger.error('Provisioning failed', { storeId, error: err.message });
      storeRepository.updateStatus(storeId, 'Failed', err.message);
    });

    return store;
  }

  /**
   * Provision store asynchronously
   */
  private async provisionStoreAsync(store: Store): Promise<void> {
    this.provisioningCount++;

    try {
      logger.info('Starting async provisioning', { storeId: store.id });

      // 1. Create Kubernetes namespace
      await kubernetesService.createNamespace(store.namespace);

      // 2. Generate secure credentials
      const dbPassword = generatePassword(24);
      const wpAdminPassword = generatePassword(24);

      // 3. Determine ingress host based on environment
      const ingressSuffix = process.env.ENVIRONMENT === 'production'
        ? process.env.PROD_INGRESS_SUFFIX || '.yourdomain.com'
        : process.env.LOCAL_INGRESS_SUFFIX || '.localhost';
      const ingressHost = `${store.id}${ingressSuffix}`;

      // 4. Install Helm chart with generated values
      await helmService.install(store.id, store.namespace, {
        storeId: store.id,
        dbPassword,
        wpAdminPassword,
        ingressHost
      });

      // 5. Wait for resources to be ready (max 5 minutes)
      const isReady = await monitorService.waitForReady(store.namespace, {
        timeout: 600000 // 10 minutes
      });

      if (!isReady) {
        // Collect diagnostic info before throwing
        const pods = await kubernetesService.getPods(store.namespace);
        const podDiagnostics = await Promise.all(pods.map(async (p) => {
          const name = p.metadata?.name || 'unknown';
          const status = p.status?.phase;
          const containerStatuses = p.status?.containerStatuses?.map(cs => ({
            name: cs.name,
            state: cs.state,
            ready: cs.ready,
            restartCount: cs.restartCount
          }));

          // Fetch logs if the pod isn't running properly
          let logs = 'Pod is running';
          if (status !== 'Running' || containerStatuses?.some(cs => !cs.ready)) {
            logs = await kubernetesService.getPodLogs(store.namespace, name);
          }

          return { name, status, containerStatuses, logs };
        }));

        logger.error('Store readiness timeout diagnostics', {
          storeId: store.id,
          namespace: store.namespace,
          pods: podDiagnostics
        });

        throw new Error('Store did not become ready within timeout (10 minutes). Detailed diagnostics and POD LOGS have been written to logs/provisioning.log');
      }

      // 6. Update status to "Ready"
      await storeRepository.updateStatus(store.id, 'Ready', null, ingressHost);

      logger.info('Store provisioning completed successfully', {
        storeId: store.id,
        url: ingressHost
      });
    } catch (error: any) {
      logger.error('Provisioning failed, starting cleanup', {
        storeId: store.id,
        error: error.message
      });

      // Cleanup on failure
      await this.cleanupFailedStore(store.namespace);

      // Update status to Failed
      await storeRepository.updateStatus(
        store.id,
        'Failed',
        error.message || 'Unknown error during provisioning'
      );

      throw error;
    } finally {
      this.provisioningCount--;
    }
  }

  /**
   * Get all stores
   */
  async getAllStores(): Promise<Store[]> {
    return storeRepository.findAll();
  }

  /**
   * Get a store by ID
   */
  async getStoreById(id: string): Promise<Store | null> {
    return storeRepository.findById(id);
  }

  /**
   * Get store status
   */
  async getStoreStatus(id: string): Promise<{
    id: string;
    status: string;
    url: string | null;
    error_message: string | null;
  } | null> {
    const store = await storeRepository.findById(id);

    if (!store) {
      return null;
    }

    return {
      id: store.id,
      status: store.status,
      url: store.url,
      error_message: store.error_message
    };
  }

  /**
   * Delete a store
   */
  async deleteStore(id: string): Promise<void> {
    const store = await storeRepository.findById(id);

    if (!store) {
      throw new Error(`Store ${id} not found`);
    }

    logger.info('Starting store deletion', { storeId: id });

    // Update status to Deleting
    await storeRepository.updateStatus(id, 'Deleting');

    try {
      // Uninstall Helm release
      await helmService.uninstall(store.id, store.namespace);

      // Delete namespace (this will delete all resources)
      await kubernetesService.deleteNamespace(store.namespace);

      // Delete from database
      await storeRepository.delete(id);

      logger.info('Store deleted successfully', { storeId: id });
    } catch (error: any) {
      logger.error('Failed to delete store', {
        storeId: id,
        error: error.message
      });

      // Update status back to Failed if deletion fails
      await storeRepository.updateStatus(
        id,
        'Failed',
        `Deletion failed: ${error.message}`
      );

      throw error;
    }
  }

  /**
   * Cleanup failed store
   */
  private async cleanupFailedStore(namespace: string): Promise<void> {
    try {
      logger.info('Cleaning up failed store', { namespace });

      // Try to uninstall Helm release
      const storeId = namespace.replace('store-', '');
      try {
        await helmService.uninstall(storeId, namespace);
      } catch (error) {
        logger.warn('Failed to uninstall Helm release during cleanup', {
          namespace,
          error
        });
      }

      // Try to delete namespace
      try {
        await kubernetesService.deleteNamespace(namespace);
      } catch (error) {
        logger.warn('Failed to delete namespace during cleanup', {
          namespace,
          error
        });
      }

      logger.info('Cleanup completed', { namespace });
    } catch (error: any) {
      logger.error('Cleanup failed', { namespace, error: error.message });
    }
  }
}

export default new StoreService();
