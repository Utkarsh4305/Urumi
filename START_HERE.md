# 🚀 START HERE - Urumi Platform

Welcome to Urumi! This is your starting point for getting the platform running.

## What is Urumi?

Urumi is a platform that lets you create isolated WooCommerce stores on Kubernetes with a single click. Each store gets its own WordPress, MySQL, and networking - fully isolated and ready to use in 2-3 minutes.

## Choose Your Path

### 🎯 I Want to Get Started Quickly (10 minutes)

**Prerequisites**: Windows with Docker Desktop installed

1. **Run the setup script**:
   ```powershell
   .\setup-local.ps1
   ```

2. **Start the backend** (Terminal 1):
   ```powershell
   cd backend
   npm run dev
   ```

3. **Start the dashboard** (Terminal 2):
   ```powershell
   cd dashboard
   npm run dev
   ```

4. **Open your browser**:
   ```
   http://localhost:5173
   ```

5. **Create your first store**:
   - Click "Create Store"
   - Select "WooCommerce"
   - Wait 2-3 minutes
   - Click "Open Store" when ready!

**See [QUICKSTART.md](QUICKSTART.md) for details.**

---

### 📚 I Want to Understand the System First

Read these in order:

1. **[README.md](README.md)** - Overview, features, and architecture
2. **[docs/architecture.md](docs/architecture.md)** - Deep dive into how it works
3. **[docs/local-setup.md](docs/local-setup.md)** - Detailed setup instructions

---

### 🏗️ I Want to Deploy to Production

**Prerequisites**: VPS with Ubuntu 22.04, domain name

Follow the production deployment guide:
**[docs/production-deployment.md](docs/production-deployment.md)**

This covers:
- VPS setup with k3s
- DNS configuration
- SSL certificates
- Backend deployment
- Dashboard deployment

---

### 🐛 Something's Not Working

Check the troubleshooting guide:
**[docs/troubleshooting.md](docs/troubleshooting.md)**

Common issues:
- Can't access `*.localhost` URLs → See DNS Resolution section
- Store stuck at "Provisioning" → Check backend logs
- Port already in use → Change port in configuration

---

### 🔧 I Want to Extend or Modify

The codebase is organized as follows:

```
backend/       - Node.js API (TypeScript)
dashboard/     - React frontend (TypeScript)
helm/store/    - Kubernetes templates
docker/        - Custom Docker images
kubernetes/    - RBAC and platform configs
docs/          - Documentation
```

Key files to understand:
- `backend/src/services/store.service.ts` - Core provisioning logic
- `dashboard/src/components/StoreCard.tsx` - Main UI component
- `helm/store/templates/` - Kubernetes resource templates

---

## What Can I Do With Urumi?

✅ **Create WooCommerce stores** - Fully configured in 2-3 minutes
✅ **Complete isolation** - Each store in its own namespace
✅ **Real-time monitoring** - Watch provisioning in the dashboard
✅ **Full control** - Access WordPress admin and storefront
✅ **Easy cleanup** - Delete stores with one click

## System Requirements

### Local Development
- Node.js 20+
- Docker Desktop
- kubectl CLI
- Helm 3
- k3d    
- 8GB RAM recommended

### Production
- VPS with 4GB RAM, 2 CPU
- Ubuntu 22.04 LTS
- Domain name
- 40GB disk space

## Quick Commands Reference

### Start Services
```powershell
# Backend (terminal 1)
cd backend
npm run dev

# Dashboard (terminal 2)
cd dashboard
npm run dev
```

### Check Status
```powershell
# Kubernetes cluster
kubectl cluster-info
kubectl get nodes

# Backend logs
cat backend/logs/combined.log

# Store namespaces
kubectl get namespaces | grep store-
```

### Clean Up
```powershell
# Delete cluster
k3d cluster delete urumi-local
```

## Project Structure

```
D:\Urumi\
├── backend/                 # Node.js API
│   ├── src/                # Source code
│   └── migrations/         # Database schema
├── dashboard/              # React frontend
│   └── src/                # Components and hooks
├── helm/                   # Kubernetes charts
│   └── store/              # Store deployment chart
├── docker/                 # Custom Docker images
│   └── wordpress-woocommerce/
├── kubernetes/             # Platform manifests
└── docs/                   # Documentation
```

## Technology Stack

**Frontend**: React + TypeScript + Tailwind CSS + React Query
**Backend**: Node.js + Express + Supabase + Winston
**Infrastructure**: Kubernetes (k3d/k3s) + Helm + Docker

## Success Metrics

When everything is working, you should be able to:

1. ✅ Create a store via the dashboard
2. ✅ See status change from "Provisioning" to "Ready"
3. ✅ Open the storefront in your browser
4. ✅ Access the WordPress admin panel
5. ✅ Add a product and complete a checkout
6. ✅ Delete the store cleanly

**Typical provisioning time**: 2-3 minutes

## Getting Help

### Documentation
- 📖 [README.md](README.md) - Main documentation
- 🚀 [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- 🏗️ [docs/architecture.md](docs/architecture.md) - Architecture details
- 🔧 [docs/local-setup.md](docs/local-setup.md) - Setup instructions
- 🐛 [docs/troubleshooting.md](docs/troubleshooting.md) - Troubleshooting
- 🌐 [docs/production-deployment.md](docs/production-deployment.md) - Production

### Logs and Debugging
```powershell
# Backend logs
cat backend/logs/combined.log
cat backend/logs/error.log

# Kubernetes logs
kubectl logs -n store-<id> -l app=wordpress
kubectl logs -n store-<id> -l app=mysql

# Pod status
kubectl get pods -n store-<id>
kubectl describe pod <pod-name> -n store-<id>
```

### Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Can't access *.localhost | Add to hosts file or use nip.io |
| Port 3000 in use | Change PORT in backend/.env |
| Port 5173 in use | Change port in vite.config.ts |
| Store stuck provisioning | Check backend logs and K8s pods |
| Database connection error | Verify PostgreSQL is running |

## What's Next?

After getting started:

1. **Create a few stores** - Test the provisioning workflow
2. **Explore the code** - Understand the architecture
3. **Customize** - Modify Helm charts, add features
4. **Deploy to production** - Follow production guide
5. **Extend** - Add Medusa support, metrics, backups

## Key Features to Try

### Dashboard Features
- Create multiple stores
- Watch real-time status updates
- Open storefronts and admin panels
- Delete stores cleanly

### WooCommerce Features
- Add products in WP admin
- Configure shipping and payment
- Test checkout flow
- View orders

### Platform Features
- Multiple isolated stores
- Automatic WooCommerce setup
- Resource quota management
- Health monitoring

## Project Status

✅ **Production-Ready**: All features implemented and tested
✅ **Well-Documented**: 7 comprehensive documentation files
✅ **Easy Setup**: Automated setup script included
✅ **Extensible**: Clean architecture for adding features

## Support

For questions or issues:
1. Check [docs/troubleshooting.md](docs/troubleshooting.md)
2. Review backend logs
3. Check Kubernetes resources
4. Open a GitHub issue

## License

MIT License - Free to use, modify, and distribute

---

## Ready to Start?

### Option 1: Quick Start (Recommended)
```powershell
.\setup-local.ps1
```

### Option 2: Manual Setup
See [QUICKSTART.md](QUICKSTART.md)

### Option 3: Understand First
Read [README.md](README.md) and [docs/architecture.md](docs/architecture.md)

---

**Welcome to Urumi! Let's provision some stores! 🚀**
