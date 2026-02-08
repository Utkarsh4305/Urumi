# Local Development Setup Guide

This guide walks you through setting up the Urumi platform on your local Windows machine using k3d.

## Prerequisites Installation

### 1. Install Node.js

Download and install Node.js 20+ from https://nodejs.org/

Verify installation:
```bash
node --version  # Should show v20.x.x or higher
npm --version
```

### 2. Install Docker Desktop

Download and install Docker Desktop from https://www.docker.com/products/docker-desktop/

Start Docker Desktop and ensure it's running.

Verify installation:
```bash
docker --version
docker ps
```

### 3. Install kubectl

Using Chocolatey (recommended):
```bash
choco install kubernetes-cli
```

Or download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/

Verify installation:
```bash
kubectl version --client
```

### 4. Install Helm

Using Chocolatey:
```bash
choco install kubernetes-helm
```

Or download from: https://github.com/helm/helm/releases

Verify installation:
```bash
helm version
```

### 5. Install k3d

Using Chocolatey:
```bash
choco install k3d
```

Or download from: https://github.com/k3d-io/k3d/releases

Verify installation:
```bash
k3d --version
```

## Setup Steps

### Step 1: Clone and Navigate to Project

```bash
cd D:\Urumi
```

### Step 2: Create k3d Cluster

```bash
# Create cluster with port mapping for ingress
k3d cluster create urumi-local --port "80:80@loadbalancer"

# Verify cluster is running
kubectl cluster-info
kubectl get nodes

# Should see output like:
# NAME                       STATUS   ROLES                  AGE   VERSION
# k3d-urumi-local-server-0   Ready    control-plane,master   1m    v1.x.x
```

### Step 3: Build and Import Custom WordPress Image

```bash
cd docker/wordpress-woocommerce

# Build the Docker image
docker build -t urumi/wordpress-woocommerce:latest .

# Import image into k3d cluster
k3d image import urumi/wordpress-woocommerce:latest -c urumi-local

cd ../..
```

### Step 4: Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker run -d --name urumi-postgres \
  -e POSTGRES_DB=urumi \
  -e POSTGRES_USER=urumi \
  -e POSTGRES_PASSWORD=urumi123 \
  -p 5432:5432 \
  postgres:15

# Verify it's running
docker ps | grep postgres

# Test connection (optional)
# docker exec -it urumi-postgres psql -U urumi -d urumi
```

### Step 5: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env if needed (default values should work)
# Make sure DATABASE_URL points to localhost:5432

# Run database migrations
npm run migrate

# Start backend in development mode
npm run dev
```

You should see output like:
```
Server started on port 3000
Configuration: {...}
```

Keep this terminal open. Backend is now running on http://localhost:3000

### Step 6: Setup Dashboard

Open a new terminal:

```bash
cd dashboard

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start dashboard in development mode
npm run dev
```

You should see output like:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Keep this terminal open. Dashboard is now running on http://localhost:5173

### Step 7: Verify Setup

1. Open http://localhost:5173 in your browser
2. You should see the Urumi dashboard
3. Click the "Create Store" button to test

### Step 8: Create Your First Store

1. In the dashboard, click "Create Store"
2. Select "WooCommerce" (Medusa is coming soon)
3. Click "Create Store"
4. Status will show "Provisioning" with a spinner
5. Wait 2-3 minutes (the dashboard polls every 5 seconds for updates)
6. Status will change to "Ready" with a green badge
7. Click "Open Store" to view your WooCommerce store
8. Click "Admin" to access WordPress admin panel

Default WordPress admin credentials:
- Username: `admin`
- Password: (randomly generated, not stored - you can reset it in WordPress)

## Accessing Stores

### Via Ingress (Recommended)

Stores are accessible at: `http://<store-id>.localhost`

For example: `http://abc123def456.localhost`

### DNS Resolution Issues

If `*.localhost` doesn't resolve automatically on your Windows machine:

**Option 1: Use nip.io**

Modify `backend/.env`:
```bash
LOCAL_INGRESS_SUFFIX=.127.0.0.1.nip.io
```

Restart the backend. Stores will now be at: `http://<store-id>.127.0.0.1.nip.io`

**Option 2: Modify hosts file**

For each store, add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 abc123def456.localhost
```

(You'll need administrator privileges to edit this file)

## Verifying the Setup

### Check Backend Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "checks": {
    "database": true,
    "kubernetes": true,
    "helm": true
  }
}
```

### Check Kubernetes Cluster

```bash
# List all namespaces (should see store namespaces)
kubectl get namespaces

# List all pods across namespaces
kubectl get pods --all-namespaces

# Check a specific store namespace
kubectl get pods -n store-<store-id>
```

### Check Database

```bash
# Connect to database
docker exec -it urumi-postgres psql -U urumi -d urumi

# List stores
SELECT id, type, status, url FROM stores;

# Exit
\q
```

## Development Workflow

### Making Backend Changes

1. Edit files in `backend/src/`
2. Backend automatically reloads (using tsx watch)
3. Test changes at http://localhost:3000

### Making Frontend Changes

1. Edit files in `dashboard/src/`
2. Frontend automatically hot-reloads (using Vite HMR)
3. See changes instantly at http://localhost:5173

### Database Migrations

Create a new migration:
```bash
cd backend
npm run migrate:make <migration_name>
```

Run migrations:
```bash
npm run migrate
```

Rollback last migration:
```bash
npm run migrate:rollback
```

## Cleanup

### Delete a Store

Use the dashboard "Delete" button, or via API:
```bash
curl -X DELETE http://localhost:3000/api/stores/<store-id>
```

### Stop Services

```bash
# Stop backend (Ctrl+C in backend terminal)

# Stop dashboard (Ctrl+C in dashboard terminal)

# Stop PostgreSQL
docker stop urumi-postgres
docker rm urumi-postgres

# Delete k3d cluster
k3d cluster delete urumi-local
```

## Troubleshooting

### Port 5173 already in use

Change port in `dashboard/vite.config.ts`:
```typescript
server: {
  port: 5174,  // Change to available port
  host: true
}
```

Update `CORS_ORIGIN` in `backend/.env` accordingly.

### Port 3000 already in use

Change port in `backend/.env`:
```bash
PORT=3001
```

Update `VITE_API_URL` in `dashboard/.env` accordingly.

### Cannot connect to PostgreSQL

Check if container is running:
```bash
docker ps | grep postgres
```

Check connection:
```bash
docker logs urumi-postgres
```

Verify port 5432 is not in use:
```bash
netstat -ano | findstr :5432
```

### Helm command not found

Verify Helm is in PATH:
```bash
where helm
```

If not found, reinstall Helm or add to PATH.

### Store stuck at "Provisioning"

Check backend logs:
```bash
cd backend
cat logs/combined.log
```

Check Kubernetes pods:
```bash
kubectl get pods -n store-<store-id>
kubectl describe pod <pod-name> -n store-<store-id>
kubectl logs <pod-name> -n store-<store-id>
```

### Image pull errors

Ensure image was imported into k3d:
```bash
k3d image import urumi/wordpress-woocommerce:latest -c urumi-local
```

List images in k3d:
```bash
docker exec k3d-urumi-local-server-0 crictl images
```

## Next Steps

- Read [architecture.md](architecture.md) to understand the system
- Check [troubleshooting.md](troubleshooting.md) for common issues
- See [production-deployment.md](production-deployment.md) for deploying to production

## Getting Help

If you encounter issues not covered here:

1. Check backend logs: `backend/logs/combined.log`
2. Check frontend console in browser DevTools
3. Check Kubernetes resources: `kubectl get all -n store-<store-id>`
4. Open a GitHub issue with error details
