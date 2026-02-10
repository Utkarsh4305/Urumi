import * as k8s from '@kubernetes/client-node';
import logger from '../utils/logger';

export class KubernetesService {
  private kc: k8s.KubeConfig;
  private coreApi: k8s.CoreV1Api | null = null;
  private appsApi: k8s.AppsV1Api | null = null;
  private networkingApi: k8s.NetworkingV1Api | null = null;
  private initialized: boolean = false;

  constructor() {
    this.kc = new k8s.KubeConfig();
    try {
      this.kc.loadFromDefault();
      this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api);
      this.appsApi = this.kc.makeApiClient(k8s.AppsV1Api);
      this.networkingApi = this.kc.makeApiClient(k8s.NetworkingV1Api);
      this.initialized = true;
      logger.info('Kubernetes client initialized successfully');
    } catch (error: any) {
      logger.warn('Kubernetes not available - kubeconfig not found or invalid', {
        error: error.message
      });
      this.initialized = false;
    }
  }

  isAvailable(): boolean {
    return this.initialized;
  }

  private ensureAvailable(): void {
    if (!this.initialized || !this.coreApi || !this.appsApi || !this.networkingApi) {
      throw new Error('Kubernetes is not available - kubeconfig not found or invalid');
    }
  }

  /**
   * Create a new namespace
   */
  async createNamespace(name: string): Promise<void> {
    this.ensureAvailable();
    try {
      const namespace: k8s.V1Namespace = {
        metadata: {
          name,
          labels: {
            'app.kubernetes.io/managed-by': 'urumi',
            'urumi.io/store': name
          }
        }
      };

      await this.coreApi!.createNamespace(namespace);
      logger.info('Namespace created', { namespace: name });
    } catch (error: any) {
      if (error.statusCode === 409) {
        logger.warn('Namespace already exists', { namespace: name });
        return;
      }
      logger.error('Failed to create namespace', {
        namespace: name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Delete a namespace
   */
  async deleteNamespace(name: string): Promise<void> {
    this.ensureAvailable();
    try {
      await this.coreApi!.deleteNamespace(name);
      logger.info('Namespace deleted', { namespace: name });
    } catch (error: any) {
      if (error.statusCode === 404) {
        logger.warn('Namespace does not exist', { namespace: name });
        return;
      }
      logger.error('Failed to delete namespace', {
        namespace: name,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check if namespace exists
   */
  async namespaceExists(name: string): Promise<boolean> {
    this.ensureAvailable();
    try {
      await this.coreApi!.readNamespace(name);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(namespace: string, name: string): Promise<boolean> {
    if (!this.initialized) return false;
    try {
      const response = await this.appsApi!.readNamespacedDeployment(name, namespace);
      const deployment = response.body;

      const ready = deployment.status?.readyReplicas || 0;
      const desired = deployment.spec?.replicas || 0;

      return ready === desired && ready > 0;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      logger.error('Failed to get deployment status', {
        namespace,
        name,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get StatefulSet status
   */
  async getStatefulSetStatus(namespace: string, name: string): Promise<boolean> {
    if (!this.initialized) return false;
    try {
      const response = await this.appsApi!.readNamespacedStatefulSet(name, namespace);
      const statefulSet = response.body;

      const ready = statefulSet.status?.readyReplicas || 0;
      const desired = statefulSet.spec?.replicas || 0;

      return ready === desired && ready > 0;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      logger.error('Failed to get StatefulSet status', {
        namespace,
        name,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get all pods in a namespace
   */
  async getPods(namespace: string): Promise<k8s.V1Pod[]> {
    this.ensureAvailable();
    try {
      const response = await this.coreApi!.listNamespacedPod(namespace);
      return response.body.items;
    } catch (error: any) {
      logger.error('Failed to get pods', { namespace, error: error.message });
      throw error;
    }
  }

  /**
   * Check if all pods in namespace are ready
   */
  async areAllPodsReady(namespace: string): Promise<boolean> {
    try {
      const pods = await this.getPods(namespace);

      if (pods.length === 0) {
        return false;
      }

      return pods.every(pod => {
        const conditions = pod.status?.conditions || [];
        const readyCondition = conditions.find(c => c.type === 'Ready');
        return readyCondition?.status === 'True';
      });
    } catch (error: any) {
      logger.error('Failed to check pod readiness', {
        namespace,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get ingress hostname
   */
  async getIngressHost(namespace: string, name: string): Promise<string | null> {
    if (!this.initialized) return null;
    try {
      const response = await this.networkingApi!.readNamespacedIngress(name, namespace);
      const ingress = response.body;

      const host = ingress.spec?.rules?.[0]?.host || null;
      return host;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      logger.error('Failed to get ingress', { namespace, name, error: error.message });
      return null;
    }
  }

  /**
   * Get logs for a specific pod
   */
  async getPodLogs(namespace: string, podName: string): Promise<string> {
    this.ensureAvailable();
    try {
      const response = await this.coreApi!.readNamespacedPodLog(podName, namespace);
      return response.body as unknown as string;
    } catch (error: any) {
      logger.warn('Failed to get pod logs', { namespace, podName, error: error.message });
      return `Failed to fetch logs: ${error.message}`;
    }
  }

  /**
   * Check cluster connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    if (!this.initialized) return false;
    try {
      await this.coreApi!.listNamespace();
      return true;
    } catch (error: any) {
      logger.error('Failed to connect to Kubernetes cluster', {
        error: error.message
      });
      return false;
    }
  }
}

export default new KubernetesService();
