# Troubleshooting Guide

This guide covers common issues and their solutions when working with the Urumi platform.

## Table of Contents

- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Kubernetes Issues](#kubernetes-issues)
- [Database Issues](#database-issues)
- [Store Provisioning Issues](#store-provisioning-issues)
- [Networking Issues](#networking-issues)

---

## Backend Issues

### Backend won't start

**Symptom**: Error when running `npm run dev`

**Possible Causes & Solutions**:

1. **Missing dependencies**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port already in use**
   ```bash
   # Find process using port 3000
   netstat -ano | findstr :3000

   # Kill process or change port in .env
   PORT=3001
   ```

3. **Missing .env file**
   ```bash
   cp .env.example .env
   ```

4. **Database connection error**
   - Verify PostgreSQL is running: `docker ps | grep postgres`
   - Check DATABASE_URL in `.env`

### Database migration errors

**Error**: `relation "stores" does not exist`

**Solution**:
```bash
cd backend
npm run migrate
```

**Error**: `Migration already run`

**Solution**:
```bash
# Rollback last migration
npm run migrate:rollback

# Run migrations again
npm run migrate
```

### Kubernetes connection errors

**Error**: `Failed to connect to Kubernetes cluster`

**Solution**:
1. Verify cluster is running:
   ```bash
   kubectl cluster-info
   ```

2. Check KUBECONFIG in `.env`:
   ```bash
   KUBECONFIG=C:\Users\utkar\.kube\config
   ```

3. Verify kubectl works:
   ```bash
   kubectl get nodes
   ```

### Helm errors

**Error**: `helm: command not found`

**Solution**:
```bash
# Install Helm
choco install kubernetes-helm

# Verify installation
helm version
```

**Error**: `chart not found`

**Solution**:
1. Verify chart path in `.env`:
   ```bash
   HELM_CHART_PATH=../helm/store
   ```

2. Check chart exists:
   ```bash
   ls helm/store/Chart.yaml
   ```

---

## Frontend Issues

### Dashboard won't start

**Symptom**: Error when running `npm run dev`

**Possible Solutions**:

1. **Missing dependencies**
   ```bash
   cd dashboard
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port already in use**
   - Change port in `vite.config.ts`
   - Update CORS_ORIGIN in backend `.env`

3. **Missing .env file**
   ```bash
   cp .env.example .env
   ```

### Cannot connect to backend

**Symptom**: "Failed to load stores" error in dashboard

**Solution**:
1. Verify backend is running on port 3000
2. Check VITE_API_URL in `dashboard/.env`
3. Check browser console for CORS errors
4. Verify CORS_ORIGIN in `backend/.env` matches dashboard URL

### Build errors

**Error**: TypeScript compilation errors

**Solution**:
```bash
cd dashboard
npm run build
```

Fix any TypeScript errors shown.

---

## Kubernetes Issues

### k3d cluster won't start

**Error**: `failed to create cluster`

**Solution**:
1. Delete existing cluster:
   ```bash
   k3d cluster delete urumi-local
   ```

2. Ensure Docker is running:
   ```bash
   docker ps
   ```

3. Create cluster again:
   ```bash
   k3d cluster create urumi-local --port "80:80@loadbalancer"
   ```

### Cannot access cluster

**Error**: `Unable to connect to the server`

**Solution**:
```bash
# Restart cluster
k3d cluster stop urumi-local
k3d cluster start urumi-local

# Update kubeconfig
k3d kubeconfig merge urumi-local --kubeconfig-switch-context
```

### Pods stuck in Pending state

**Symptom**: Store provisioning never completes

**Check pod status**:
```bash
kubectl get pods -n store-<store-id>
kubectl describe pod <pod-name> -n store-<store-id>
```

**Common causes**:

1. **Image pull errors**
   ```bash
   # Import image into k3d
   k3d image import urumi/wordpress-woocommerce:latest -c urumi-local
   ```

2. **Insufficient resources**
   ```bash
   # Check node resources
   kubectl describe node k3d-urumi-local-server-0
   ```

3. **PVC issues**
   ```bash
   # Check PVCs
   kubectl get pvc -n store-<store-id>
   kubectl describe pvc <pvc-name> -n store-<store-id>
   ```

### Pods in CrashLoopBackOff

**Check logs**:
```bash
kubectl logs <pod-name> -n store-<store-id>
kubectl logs <pod-name> -n store-<store-id> --previous
```

**Common causes**:

1. **MySQL not ready**
   - MySQL StatefulSet takes 30-60 seconds to start
   - WordPress will retry connection automatically

2. **Configuration errors**
   ```bash
   # Check secrets
   kubectl get secrets -n store-<store-id>
   kubectl describe secret mysql-secret -n store-<store-id>
   ```

---

## Database Issues

### Cannot connect to PostgreSQL

**Check if container is running**:
```bash
docker ps | grep postgres
```

**Start container if stopped**:
```bash
docker start urumi-postgres
```

**Check logs**:
```bash
docker logs urumi-postgres
```

**Test connection**:
```bash
docker exec -it urumi-postgres psql -U urumi -d urumi
```

### Database locked errors

**Solution**:
```bash
# Stop all connections to database
docker restart urumi-postgres

# Run migrations again
cd backend
npm run migrate
```

### Lost database data

**If using Docker container**, data is lost when container is removed.

**Solution for persistence**:
```bash
# Stop and remove old container
docker stop urumi-postgres
docker rm urumi-postgres

# Create with volume
docker run -d --name urumi-postgres \
  -e POSTGRES_DB=urumi \
  -e POSTGRES_USER=urumi \
  -e POSTGRES_PASSWORD=urumi123 \
  -p 5432:5432 \
  -v urumi-postgres-data:/var/lib/postgresql/data \
  postgres:15
```

---

## Store Provisioning Issues

### Store stuck at "Provisioning"

**Check backend logs**:
```bash
cd backend
tail -f logs/combined.log
```

**Check Helm release**:
```bash
helm list -n store-<store-id>
helm status <store-id> -n store-<store-id>
```

**Check pods**:
```bash
kubectl get pods -n store-<store-id>
kubectl describe pod <pod-name> -n store-<store-id>
```

**Common issues**:

1. **Timeout during Helm install**
   - Default timeout is 5 minutes
   - Check if pods are starting slowly
   - Increase timeout in `helm.service.ts`

2. **Readiness probe failing**
   - WordPress takes 60-90 seconds to become ready
   - Check readiness probe configuration in `values.yaml`

### Store provisioning fails immediately

**Check error message in database**:
```bash
docker exec -it urumi-postgres psql -U urumi -d urumi
SELECT id, status, error_message FROM stores WHERE id = '<store-id>';
\q
```

**Common errors**:

1. **"Maximum number of stores reached"**
   - Increase MAX_STORES in `backend/.env`

2. **"Maximum concurrent provisions reached"**
   - Wait for other provisions to complete
   - Increase MAX_CONCURRENT_PROVISIONS in `backend/.env`

3. **"Helm install failed"**
   - Check Helm chart syntax: `helm lint helm/store`
   - Check Helm logs in backend logs

### Store status never updates to "Ready"

**Verify monitoring service**:
```bash
# Check all resources in namespace
kubectl get all -n store-<store-id>

# All should show Running/Ready
```

**Check readiness conditions**:
```bash
# WordPress deployment
kubectl get deployment wordpress -n store-<store-id>

# MySQL StatefulSet
kubectl get statefulset mysql -n store-<store-id>
```

**Manual HTTP check**:
```bash
curl -I http://<store-id>.localhost
```

### WooCommerce not installed

**Check WordPress pod logs**:
```bash
kubectl logs -n store-<store-id> -l app=wordpress
```

Look for WooCommerce installation messages.

**Manual installation**:
```bash
kubectl exec -it <wordpress-pod> -n store-<store-id> -- bash
wp plugin install woocommerce --activate --allow-root --path=/var/www/html
```

---

## Networking Issues

### Cannot access store at *.localhost

**Windows DNS Resolution**:

**Option 1: Use nip.io** (Recommended)
```bash
# In backend/.env
LOCAL_INGRESS_SUFFIX=.127.0.0.1.nip.io
```

Restart backend. Access stores at: `http://<store-id>.127.0.0.1.nip.io`

**Option 2: Edit hosts file**

Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 <store-id>.localhost
```

**Option 3: Use port forwarding**
```bash
kubectl port-forward -n store-<store-id> svc/wordpress 8080:80
```

Access at: `http://localhost:8080`

### Ingress not working

**Check ingress resource**:
```bash
kubectl get ingress -n store-<store-id>
kubectl describe ingress wordpress-ingress -n store-<store-id>
```

**Check ingress controller**:
```bash
kubectl get pods -n kube-system | grep traefik
```

**Verify ingress class**:
```bash
kubectl get ingressclass
```

Should show `traefik` as default for k3d.

---

## Manual Cleanup

### Delete stuck namespace

```bash
# Try graceful delete
kubectl delete namespace store-<store-id>

# If stuck, force delete
kubectl delete namespace store-<store-id> --grace-period=0 --force
```

### Clean up orphaned resources

```bash
# List all store namespaces
kubectl get namespaces | grep store-

# Delete all stores
kubectl delete namespaces -l urumi.io/managed=true

# Clean up database
docker exec -it urumi-postgres psql -U urumi -d urumi
DELETE FROM stores;
\q
```

### Reset entire environment

```bash
# Stop services
# (Ctrl+C in backend and dashboard terminals)

# Delete k3d cluster
k3d cluster delete urumi-local

# Remove PostgreSQL
docker stop urumi-postgres
docker rm urumi-postgres
docker volume rm urumi-postgres-data

# Start fresh
# Follow local-setup.md from Step 2
```

---

## Logging and Debugging

### Enable debug logging

In `backend/.env`:
```bash
LOG_LEVEL=debug
```

Restart backend.

### Check backend logs

```bash
cd backend

# Combined logs
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Live grep
tail -f logs/combined.log | grep ERROR
```

### Check Kubernetes events

```bash
# All events in namespace
kubectl get events -n store-<store-id> --sort-by='.lastTimestamp'

# Pod-specific events
kubectl describe pod <pod-name> -n store-<store-id>
```

### Check container logs

```bash
# WordPress logs
kubectl logs -n store-<store-id> -l app=wordpress --tail=100

# MySQL logs
kubectl logs -n store-<store-id> -l app=mysql --tail=100

# Follow logs
kubectl logs -n store-<store-id> -l app=wordpress -f
```

---

## Performance Issues

### Slow provisioning

**Typical times**:
- MySQL ready: 30-60 seconds
- WordPress ready: 60-90 seconds
- WooCommerce installed: 90-120 seconds
- Total: 2-3 minutes

**If slower**:

1. Check system resources:
   ```bash
   docker stats
   ```

2. Reduce resource requests in `values-local.yaml`

3. Check disk I/O (especially on Windows with WSL2)

### Dashboard slow to update

**Default polling interval**: 5 seconds

**Change in `dashboard/src/hooks/useStores.ts`**:
```typescript
refetchInterval: 3000, // 3 seconds
```

---

## Getting More Help

If your issue isn't covered here:

1. **Check logs**:
   - Backend: `backend/logs/combined.log`
   - Frontend: Browser DevTools Console
   - Kubernetes: `kubectl logs` and `kubectl describe`

2. **Gather information**:
   ```bash
   # System info
   kubectl version
   helm version
   docker version

   # Cluster state
   kubectl get all --all-namespaces

   # Recent backend logs
   tail -n 100 backend/logs/combined.log
   ```

3. **Open a GitHub issue** with:
   - Description of the problem
   - Steps to reproduce
   - Relevant logs
   - System information

## Common Error Messages Reference

| Error Message | Likely Cause | Solution |
|--------------|-------------|----------|
| `ECONNREFUSED` | Service not running | Start the service |
| `404 Not Found` | Wrong URL/endpoint | Check API_URL configuration |
| `CORS error` | CORS misconfiguration | Verify CORS_ORIGIN setting |
| `ImagePullBackOff` | Image not available | Import image to k3d |
| `CrashLoopBackOff` | Application error | Check pod logs |
| `Pending` | Resource constraints | Check PVC/node resources |
| `relation does not exist` | Missing migration | Run `npm run migrate` |
| `helm: not found` | Helm not installed | Install Helm CLI |
| `Maximum stores reached` | Quota exceeded | Increase MAX_STORES |
