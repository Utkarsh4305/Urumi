# Quick Start Guide

Get your Urumi platform running in under 10 minutes!

## Prerequisites

Install these tools first:

- **Node.js 20+**: https://nodejs.org/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **kubectl**: `choco install kubernetes-cli`
- **Helm**: `choco install kubernetes-helm`
- **k3d**: `choco install k3d`

## Automated Setup (Recommended)

Run the setup script:

```powershell
cd D:\Urumi
.\setup-local.ps1
```

This script will:
1. ✓ Check prerequisites
2. ✓ Create k3d cluster
3. ✓ Build Docker image
4. ✓ Start PostgreSQL
5. ✓ Setup backend
6. ✓ Setup dashboard
7. ✓ Run migrations
8. ✓ Verify everything

## Manual Setup

If you prefer manual setup:

### 1. Create Cluster

```bash
k3d cluster create urumi-local --port "80:80@loadbalancer"
```

### 2. Build Image

```bash
cd docker/wordpress-woocommerce
docker build -t urumi/wordpress-woocommerce:latest .
k3d image import urumi/wordpress-woocommerce:latest -c urumi-local
```

### 3. Start Database

```bash
docker run -d --name urumi-postgres \
  -e POSTGRES_DB=urumi \
  -e POSTGRES_USER=urumi \
  -e POSTGRES_PASSWORD=urumi123 \
  -p 5432:5432 \
  postgres:15
```

### 4. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev  # Keep this running
```

### 5. Setup Dashboard

```bash
cd dashboard
npm install
cp .env.example .env
npm run dev  # Keep this running
```

## Usage

1. Open http://localhost:5173
2. Click **"Create Store"**
3. Select **"WooCommerce"**
4. Click **"Create Store"**
5. Wait 2-3 minutes for provisioning
6. Click **"Open Store"** when ready!

## Your First Store

Once provisioning completes:

- **Storefront**: Click "Open Store"
- **Admin Panel**: Click "Admin"
- **Default URL**: `http://<store-id>.localhost`

## Troubleshooting

### Can't access *.localhost URLs?

Add to your hosts file (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 <store-id>.localhost
```

Or use nip.io in `backend/.env`:
```
LOCAL_INGRESS_SUFFIX=.127.0.0.1.nip.io
```

### Store stuck at "Provisioning"?

Check backend logs:
```bash
cd backend
cat logs/combined.log
```

Check Kubernetes:
```bash
kubectl get pods -n store-<store-id>
```

### Need more help?

See [docs/troubleshooting.md](docs/troubleshooting.md)

## What's Next?

- Read [docs/architecture.md](docs/architecture.md) to understand the system
- Check [docs/local-setup.md](docs/local-setup.md) for detailed setup
- See [README.md](README.md) for full documentation

## Cleanup

To remove everything:

```bash
# Delete cluster
k3d cluster delete urumi-local

# Remove database
docker stop urumi-postgres
docker rm urumi-postgres

# Remove image
docker rmi urumi/wordpress-woocommerce:latest
```

---

**That's it! You're ready to provision stores!** 🚀
