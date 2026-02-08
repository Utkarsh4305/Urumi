# Architecture Documentation

This document provides an in-depth look at the Urumi platform architecture, design decisions, and technical implementation.

## System Overview

Urumi is a Kubernetes-native platform for provisioning isolated ecommerce stores on-demand. It consists of three main layers:

1. **Presentation Layer**: React-based dashboard for user interaction
2. **Application Layer**: Node.js API for business logic and orchestration
3. **Infrastructure Layer**: Kubernetes cluster with Helm-managed store deployments

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Layer                          │
│                                                             │
│  ┌─────────────┐                                           │
│  │   Browser   │                                           │
│  └──────┬──────┘                                           │
│         │ HTTP/REST                                        │
└─────────┼──────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│                                                             │
│  ┌──────────────────┐      ┌─────────────────┐           │
│  │ React Dashboard  │─────→│  Backend API    │           │
│  │  (Port 5173)     │      │  (Node.js:3000) │           │
│  │                  │      │                 │           │
│  │ - React Query    │      │ - Express       │           │
│  │ - Axios          │      │ - TypeScript    │           │
│  │ - Tailwind CSS   │      │ - Zod           │           │
│  └──────────────────┘      └────┬──────┬─────┘           │
│                                  │      │                 │
└──────────────────────────────────┼──────┼─────────────────┘
                                   │      │
          ┌────────────────────────┘      └────────────────┐
          │                                                 │
          ▼                                                 ▼
┌─────────────────────┐                    ┌─────────────────────┐
│   Data Layer        │                    │ Infrastructure Layer│
│                     │                    │                     │
│  ┌──────────────┐  │                    │  ┌──────────────┐  │
│  │ PostgreSQL   │  │                    │  │  Kubernetes  │  │
│  │              │  │                    │  │   Cluster    │  │
│  │ - Stores     │  │                    │  │              │  │
│  │ - Metadata   │  │                    │  │ - Namespaces │  │
│  └──────────────┘  │                    │  │ - Helm       │  │
│                     │                    │  │ - Ingress    │  │
└─────────────────────┘                    │  └──────────────┘  │
                                           │                     │
                                           │  ┌──────────────┐  │
                                           │  │ Store Deploy │  │
                                           │  │              │  │
                                           │  │ - WordPress  │  │
                                           │  │ - MySQL      │  │
                                           │  │ - WooCommerce│  │
                                           │  └──────────────┘  │
                                           └─────────────────────┘
```

## Component Details

### 1. Dashboard (Frontend)

**Technology Stack**:
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Query for server state
- Axios for HTTP requests

**Key Features**:
- Real-time status updates via polling (5-second interval)
- Responsive design
- Error handling and loading states
- Type-safe API integration

**Directory Structure**:
```
dashboard/src/
├── api/            # API client and endpoints
├── components/     # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

**Data Flow**:
1. User triggers action (e.g., "Create Store")
2. Component calls React Query mutation
3. Mutation invokes API client
4. API client sends HTTP request to backend
5. Response updates React Query cache
6. UI automatically re-renders with new data

### 2. Backend API

**Technology Stack**:
- Node.js 20 with TypeScript
- Express.js web framework
- @kubernetes/client-node for K8s API
- Knex.js for database operations
- Winston for logging
- Zod for request validation

**Architecture Layers**:

```
Routes → Controllers → Services → Repositories
                     ↓
              External Systems
              (K8s, Helm, DB)
```

**Key Services**:

1. **StoreService** (`services/store.service.ts`)
   - Core business logic
   - Orchestrates provisioning workflow
   - Manages concurrency limits

2. **KubernetesService** (`services/kubernetes.service.ts`)
   - Wraps @kubernetes/client-node
   - Provides high-level K8s operations
   - Handles namespace, deployment, and pod management

3. **HelmService** (`services/helm.service.ts`)
   - Wraps Helm CLI via child_process
   - Installs and uninstalls Helm releases
   - Manages chart values injection

4. **MonitorService** (`services/monitor.service.ts`)
   - Polls Kubernetes for readiness
   - Checks deployment, StatefulSet, and pod status
   - Performs HTTP health checks

**Request Flow Example** (Create Store):

```
1. POST /api/stores
   └─> StoreController.createStore()
       └─> StoreService.createStore()
           ├─> Generate store ID
           ├─> Repository.create() → DB INSERT
           ├─> Launch provisionStoreAsync() [async]
           └─> Return 202 Accepted

2. provisionStoreAsync() [background]
   ├─> KubernetesService.createNamespace()
   ├─> Generate passwords
   ├─> HelmService.install()
   │   └─> Execute: helm install <release> <chart>
   │       └─> K8s creates: Namespace, Secrets, PVC,
   │                        StatefulSet, Deployment,
   │                        Services, Ingress
   ├─> MonitorService.waitForReady()
   │   └─> Poll every 5s for 5 minutes
   │       ├─> Check Deployment status
   │       ├─> Check StatefulSet status
   │       ├─> Check all pods ready
   │       └─> Check HTTP endpoint
   └─> Repository.updateStatus() → DB UPDATE

3. GET /api/stores [polling from dashboard]
   └─> Return updated status
```

### 3. Helm Charts

**Chart Structure**:
```
helm/store/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default values
├── values-local.yaml       # Local overrides
├── values-prod.yaml        # Production overrides
└── templates/
    ├── namespace.yaml      # Namespace definition
    ├── secrets.yaml        # Credentials
    ├── mysql-pvc.yaml      # MySQL storage
    ├── mysql-statefulset.yaml  # MySQL workload
    ├── mysql-service.yaml  # MySQL networking
    ├── wordpress-deployment.yaml  # WordPress workload
    ├── wordpress-service.yaml  # WordPress networking
    ├── ingress.yaml        # External access
    └── resourcequota.yaml  # Resource limits
```

**Values Injection**:

Dynamic values are passed via `--set` flags:
- `storeId`: Unique store identifier
- `wordpress.adminPassword`: Generated WordPress admin password
- `mysql.auth.rootPassword`: Generated MySQL root password
- `ingress.hosts[0].host`: Store URL (e.g., abc123.localhost)

**Resource Topology** (per store):

```
Namespace: store-<id>
├── Secrets
│   ├── mysql-secret (DB credentials)
│   └── wordpress-secret (WP admin credentials)
├── PersistentVolumeClaim
│   └── mysql-pvc (5Gi for MySQL data)
├── StatefulSet
│   └── mysql (MySQL 8.0)
│       └── Pod: mysql-0
├── Deployment
│   └── wordpress (Custom WP+WooCommerce image)
│       └── Pod: wordpress-<hash>
├── Services
│   ├── mysql (ClusterIP:3306)
│   └── wordpress (ClusterIP:80)
├── Ingress
│   └── wordpress-ingress (<store-id>.localhost)
└── ResourceQuota (optional)
    └── CPU/Memory limits per namespace
```

### 4. Custom Docker Image

**Purpose**: Automatically install WooCommerce after WordPress setup.

**Base Image**: `wordpress:6.4-php8.2-apache`

**Added Components**:
- WP-CLI (WordPress command-line tool)
- Installation script (`install-woocommerce.sh`)
- Custom entrypoint (`docker-entrypoint.sh`)

**Initialization Flow**:
```
1. Container starts
   └─> custom-entrypoint.sh
       ├─> Start WordPress (background)
       └─> Start install-woocommerce.sh (background)

2. install-woocommerce.sh
   ├─> Wait for WordPress core installation (polls wp core is-installed)
   ├─> Install WooCommerce plugin via WP-CLI
   ├─> Configure basic WooCommerce settings
   └─> Exit

3. WordPress serves requests
```

## Data Model

### Database Schema

**Table: stores**

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR(16) | Primary key, unique store ID |
| type | VARCHAR(20) | Store type (woocommerce/medusa) |
| namespace | VARCHAR(64) | Kubernetes namespace name |
| status | VARCHAR(20) | Provisioning/Ready/Failed/Deleting |
| url | VARCHAR(255) | Store URL (nullable) |
| error_message | TEXT | Error details if Failed (nullable) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Unique index on `namespace`
- Index on `status` (for filtering)
- Index on `created_at` (for ordering)

### Status State Machine

```
[Initial]
   │
   ▼
Provisioning ──────┐
   │               │
   │ (success)     │ (failure)
   ▼               ▼
 Ready          Failed
   │               │
   │ (delete)      │ (delete)
   ▼               ▼
Deleting ─────> [Deleted]
```

**Status Transitions**:
- `Provisioning` → `Ready`: Successful provisioning
- `Provisioning` → `Failed`: Error during provisioning
- `Ready` → `Deleting`: User-initiated deletion
- `Failed` → `Deleting`: User-initiated cleanup
- `Deleting` → (removed from DB): Successful deletion

## Provisioning Workflow

### Phase 1: Initiation (< 1 second)

1. **API Request**: POST /api/stores with `{ type: "woocommerce" }`
2. **Validation**: Zod schema validates request
3. **Quota Check**: Verify total stores < MAX_STORES
4. **Concurrency Check**: Verify active provisions < MAX_CONCURRENT_PROVISIONS
5. **ID Generation**: Generate unique 12-character hex ID
6. **Database Insert**: Create store record with status "Provisioning"
7. **Response**: Return 202 Accepted with store object
8. **Async Launch**: Start provisionStoreAsync() in background

### Phase 2: Namespace Creation (1-2 seconds)

1. **Create Namespace**: Call Kubernetes API to create namespace
2. **Label Namespace**: Add labels for tracking and management

### Phase 3: Credential Generation (< 1 second)

1. **Generate DB Password**: 24-character random base64 string
2. **Generate WP Admin Password**: 24-character random base64 string
3. **Determine Ingress Host**: Based on environment (local vs. prod)

### Phase 4: Helm Installation (60-120 seconds)

1. **Build Helm Command**: Construct command with all --set flags
2. **Execute Helm Install**: Shell out to `helm install`
3. **Kubernetes Processing**:
   - Create Secrets
   - Create PVC (if enabled)
   - Create MySQL StatefulSet
   - Wait for MySQL to be ready
   - Create WordPress Deployment
   - Create Services
   - Create Ingress
4. **Helm Wait**: Block until resources report ready

### Phase 5: Readiness Monitoring (60-180 seconds)

**Poll every 5 seconds, max 5 minutes**:

1. **Check Namespace**: Verify namespace exists
2. **Check MySQL StatefulSet**: `readyReplicas == replicas`
3. **Check WordPress Deployment**: `readyReplicas == replicas`
4. **Check Pod Readiness**: All pods have `Ready` condition
5. **HTTP Health Check**: GET request to ingress URL returns < 500

**WooCommerce Installation** (happens in parallel):
- WordPress pod runs `install-woocommerce.sh`
- Script waits for WordPress core to be installed
- Installs WooCommerce via WP-CLI
- Configures basic settings

### Phase 6: Completion (< 1 second)

1. **Update Database**: Set status to "Ready", add URL
2. **Log Success**: Record completion in logs
3. **Dashboard Update**: Next poll cycle shows "Ready" status

### Total Time

**Typical**: 2-3 minutes
**Breakdown**:
- Phase 1: < 1s
- Phase 2: 1-2s
- Phase 3: < 1s
- Phase 4: 60-120s (MySQL + WordPress startup)
- Phase 5: 60-180s (readiness checks + WooCommerce install)

## Security Considerations

### 1. Credential Management

- **Generation**: All passwords generated via `crypto.randomBytes()`
- **Storage**: Stored only in Kubernetes Secrets (not in platform DB)
- **Transmission**: Secrets never sent to frontend
- **Access**: Only accessible within store namespace

### 2. Namespace Isolation

- Each store runs in dedicated namespace
- Network policies can restrict inter-namespace communication
- Resource quotas prevent resource exhaustion

### 3. RBAC

- Backend uses ServiceAccount with ClusterRole
- Principle of least privilege (only necessary permissions)
- Cannot access resources outside managed namespaces

### 4. Input Validation

- All API inputs validated with Zod schemas
- Store IDs validated before use in K8s operations
- Prevents injection attacks

### 5. Error Handling

- Sensitive data not leaked in error messages
- Stack traces only in development mode
- Errors logged securely on server

## Scalability

### Current Limits

- **MAX_STORES**: 50 (configurable)
- **MAX_CONCURRENT_PROVISIONS**: 3 (configurable)
- **Provisioning Timeout**: 5 minutes

### Scaling Considerations

**Vertical Scaling** (single cluster):
- Increase node resources
- Adjust resource quotas per namespace
- Increase MAX_STORES limit

**Horizontal Scaling** (multiple replicas):
- Backend API: Stateless, can run multiple replicas
- Database: Use PostgreSQL replication
- Shared Kubernetes cluster

**Multi-Cluster** (advanced):
- Deploy multiple clusters
- Route provisioning requests to different clusters
- Requires cluster selection logic

## Monitoring and Observability

### Logging

**Backend Logs** (`backend/logs/`):
- `combined.log`: All log levels
- `error.log`: Errors only
- Format: JSON with timestamps
- Rotation: 5 files x 5MB

**Log Levels**:
- `error`: Failures and exceptions
- `warn`: Degraded functionality
- `info`: Normal operations
- `debug`: Detailed debugging (dev only)

**Key Logged Events**:
- Store creation/deletion requests
- Provisioning start/completion
- Kubernetes operations
- Helm commands
- HTTP requests/responses

### Metrics (Future Enhancement)

Potential metrics to track:
- Provisioning success rate
- Average provisioning time
- Active stores count
- API request rate
- Error rate by endpoint

### Health Checks

**Endpoint**: GET /api/health

**Checks**:
1. Database connectivity (PostgreSQL)
2. Kubernetes cluster connectivity
3. Helm CLI availability

**Response**:
```json
{
  "status": "healthy|unhealthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "checks": {
    "database": true,
    "kubernetes": true,
    "helm": true
  }
}
```

## Technology Choices Rationale

### Why Node.js?

- Excellent Kubernetes client library
- Fast I/O for orchestration tasks
- Easy integration with shell commands (Helm)
- Strong TypeScript support

### Why PostgreSQL?

- Reliable ACID compliance
- Better for structured data than NoSQL
- Native JSON support for future flexibility
- Widely supported and mature

### Why Helm?

- De facto standard for Kubernetes packaging
- Templating reduces code duplication
- Built-in rollback capabilities
- No official Node.js SDK, so CLI is the way

### Why React Query?

- Automatic polling for status updates
- Built-in caching and refetching
- Reduces boilerplate for async state
- Optimistic updates support

### Why k3d/k3s?

- Lightweight Kubernetes distributions
- Fast startup for development
- Production-ready (k3s used by enterprises)
- Minimal resource requirements

## Future Enhancements

### 1. Medusa Store Type

- Add Medusa backend deployment
- Integrate Medusa admin UI
- PostgreSQL database for Medusa

### 2. TLS/HTTPS Support

- Integrate cert-manager
- Automatic Let's Encrypt certificates
- HTTPS ingress rules

### 3. Backup and Restore

- Automated database backups
- Velero integration for K8s backups
- Restore functionality in dashboard

### 4. Multi-tenancy

- User authentication (OAuth, JWT)
- Per-user store isolation
- Resource quotas per user

### 5. Cost Management

- Resource usage tracking
- Cost estimation per store
- Budget alerts

### 6. Advanced Monitoring

- Prometheus metrics
- Grafana dashboards
- Alerting (PagerDuty, Slack)

### 7. CI/CD Integration

- Automated testing
- Docker image builds
- Helm chart testing
- E2E tests in pipeline

## References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [k3d Documentation](https://k3d.io/)
- [WooCommerce Documentation](https://woocommerce.com/documentation/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Express.js Documentation](https://expressjs.com/)
