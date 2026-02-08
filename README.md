# Urumi - Kubernetes Ecommerce Store Provisioning Platform

A production-ready platform that provisions isolated WooCommerce stores on Kubernetes. Users can create on-demand ecommerce stores through a web dashboard, with each store running in its own Kubernetes namespace with dedicated WordPress, MySQL, and networking resources.

## Features

- 🚀 **One-Click Provisioning**: Create fully configured WooCommerce stores in 2-3 minutes
- 🔒 **Complete Isolation**: Each store runs in its own Kubernetes namespace
- 🎯 **Auto-Configuration**: WordPress and WooCommerce installed and configured automatically
- 📊 **Real-time Status**: Dashboard shows live provisioning status with automatic polling
- 🔄 **Works Everywhere**: Identical behavior in local (k3d) and production (k3s) environments
- 💻 **Modern Stack**: React dashboard + Node.js API + Helm charts

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
       ▼
┌──────────────────┐      ┌─────────────────┐
│ React Dashboard  │─────→│  Backend API    │
│  (Port 5173)     │      │  (Node.js:3000) │
└──────────────────┘      └────┬──────┬─────┘
                               │      │
                               ▼      ▼
                          ┌─────┐  ┌─────────────┐
                          │ DB  │  │ Kubernetes  │
                          └─────┘  │   Cluster   │
                                   └─────────────┘
```

## Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **kubectl** CLI tool
- **Helm 3** CLI tool
- **k3d** (for local development) or **k3s** (for production)
- **PostgreSQL 15** (or use Docker)

## Quick Start (Local Development)

### 1. Create k3d Cluster

```bash
k3d cluster create urumi-local --port "80:80@loadbalancer"
```

Verify cluster:
```bash
kubectl cluster-info
kubectl get nodes
```

### 2. Start PostgreSQL

```bash
docker run -d --name urumi-postgres \
  -e POSTGRES_DB=urumi \
  -e POSTGRES_USER=urumi \
  -e POSTGRES_PASSWORD=urumi123 \
  -p 5432:5432 \
  postgres:15
```

### 3. Build Custom WordPress Image

```bash
cd docker/wordpress-woocommerce
docker build -t urumi/wordpress-woocommerce:latest .

# Import into k3d cluster
k3d image import urumi/wordpress-woocommerce:latest -c urumi-local
```

### 4. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run migrations
npm run migrate

# Start backend
npm run dev
```

Backend will start on http://localhost:3000

### 5. Setup Dashboard

```bash
cd dashboard

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start dashboard
npm run dev
```

Dashboard will start on http://localhost:5173

### 6. Create Your First Store

1. Open http://localhost:5173 in your browser
2. Click "Create Store"
3. Select "WooCommerce"
4. Click "Create Store"
5. Wait 2-3 minutes for status to change to "Ready"
6. Click "Open Store" to view your store
7. Click "Admin" to access WordPress admin

## Project Structure

```
D:\Urumi\
├── dashboard/               # React frontend
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── components/     # React components
│   │   ├── hooks/          # React Query hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers
│   └── package.json
│
├── backend/                # Node.js API
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── routes/         # Express routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database operations
│   │   └── utils/          # Utilities
│   ├── migrations/         # Database migrations
│   └── package.json
│
├── helm/                   # Helm charts
│   └── store/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│
├── docker/                 # Docker images
│   └── wordpress-woocommerce/
│
└── kubernetes/             # K8s manifests
    └── rbac.yaml
```

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Query (data fetching)
- Axios (HTTP client)

### Backend
- Node.js 20 + TypeScript
- Express.js (web framework)
- @kubernetes/client-node (K8s API)
- Knex.js (database)
- PostgreSQL 15
- Winston (logging)
- Zod (validation)

### Infrastructure
- k3d/k3s (Kubernetes)
- Helm 3 (package manager)
- Traefik (ingress controller)

## API Endpoints

```
POST   /api/stores              # Create new store
GET    /api/stores              # List all stores
GET    /api/stores/:id          # Get specific store
GET    /api/stores/:id/status   # Get store status
DELETE /api/stores/:id          # Delete store
GET    /api/health              # Health check
```

## Configuration

### Backend Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://urumi:urumi123@localhost:5432/urumi

# Kubernetes
KUBECONFIG=C:\Users\utkar\.kube\config
ENVIRONMENT=local

# Paths
HELM_CHART_PATH=../helm/store

# Quotas
MAX_STORES=50
MAX_CONCURRENT_PROVISIONS=3

# Ingress
LOCAL_INGRESS_SUFFIX=.localhost
PROD_INGRESS_SUFFIX=.yourdomain.com

# Logging
LOG_LEVEL=debug

# Security
CORS_ORIGIN=http://localhost:5173
```

### Dashboard Environment Variables

```bash
VITE_API_URL=http://localhost:3000/api
```

## Development

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd dashboard
npm test
```

### Lint Code
```bash
# Backend
cd backend
npm run lint

# Dashboard
cd dashboard
npm run lint
```

## Production Deployment

See [docs/production-deployment.md](docs/production-deployment.md) for detailed production setup instructions.

## Troubleshooting

### Store provisioning stuck at "Provisioning"

Check backend logs:
```bash
cd backend
tail -f logs/combined.log
```

Check Kubernetes pods:
```bash
kubectl get pods -n store-<store-id>
kubectl describe pod <pod-name> -n store-<store-id>
```

### Cannot access store URL

Check ingress:
```bash
kubectl get ingress -n store-<store-id>
```

For local development on Windows, you may need to add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 <store-id>.localhost
```

### Database connection errors

Verify PostgreSQL is running:
```bash
docker ps | grep postgres
```

Test connection:
```bash
psql -h localhost -U urumi -d urumi
```

### Helm not found

Install Helm:
```bash
# Windows (with Chocolatey)
choco install kubernetes-helm

# Or download from https://github.com/helm/helm/releases
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.
