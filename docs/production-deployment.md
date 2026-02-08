# Production Deployment Guide

This guide covers deploying Urumi to a production environment using k3s on a VPS.

## Prerequisites

- **VPS**: Ubuntu 22.04 LTS with at least 4GB RAM, 2 CPU cores, 40GB disk
- **Domain**: A domain name with DNS access
- **SSH Access**: Root or sudo access to the VPS

## Architecture Overview

```
Internet
   │
   ▼
[Domain] → [DNS A Record]
   │
   ▼
[VPS with k3s]
   ├─ Backend API (Node.js)
   ├─ PostgreSQL
   └─ Store Namespaces
      ├─ store-abc123
      ├─ store-def456
      └─ ...
```

## Step 1: VPS Setup

### 1.1 Connect to VPS

```bash
ssh root@your-vps-ip
```

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Install Dependencies

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install k3s
curl -sfL https://get.k3s.io | sh -
```

### 1.4 Verify k3s Installation

```bash
kubectl get nodes

# Should show:
# NAME       STATUS   ROLES                  AGE   VERSION
# your-vps   Ready    control-plane,master   1m    v1.x.x
```

## Step 2: DNS Configuration

### 2.1 Create DNS Records

In your domain's DNS settings, create:

**A Record**:
```
Type: A
Name: *
Value: <your-vps-ip>
TTL: 300
```

This creates a wildcard subdomain pointing to your VPS.

**Verification**:
```bash
# From your local machine
nslookup abc123.yourdomain.com
# Should return your VPS IP
```

## Step 3: Database Setup

### 3.1 Install PostgreSQL

```bash
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql
```

### 3.2 Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell
CREATE DATABASE urumi;
CREATE USER urumi WITH ENCRYPTED PASSWORD 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE urumi TO urumi;
\q
```

### 3.3 Configure PostgreSQL

Edit `/etc/postgresql/*/main/pg_hba.conf`:

```
# Add this line (replace with your secure password)
host    urumi           urumi           127.0.0.1/32            md5
```

Restart PostgreSQL:
```bash
systemctl restart postgresql
```

## Step 4: Backend Deployment

### 4.1 Clone Repository

```bash
cd /opt
git clone <your-repo-url> urumi
cd urumi
```

### 4.2 Build Docker Image

```bash
cd /opt/urumi/docker/wordpress-woocommerce
docker build -t urumi/wordpress-woocommerce:latest .

# Import into k3s
ctr -n k8s.io image import <(docker save urumi/wordpress-woocommerce:latest)
```

### 4.3 Setup Backend

```bash
cd /opt/urumi/backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000

DATABASE_URL=postgresql://urumi:SECURE_PASSWORD_HERE@localhost:5432/urumi

KUBECONFIG=/etc/rancher/k3s/k3s.yaml
ENVIRONMENT=production

HELM_CHART_PATH=/opt/urumi/helm/store

MAX_STORES=100
MAX_CONCURRENT_PROVISIONS=5

LOCAL_INGRESS_SUFFIX=.localhost
PROD_INGRESS_SUFFIX=.yourdomain.com

LOG_LEVEL=info

CORS_ORIGIN=https://dashboard.yourdomain.com
EOF

# Run migrations
npm run migrate

# Build backend
npm run build
```

### 4.4 Create Systemd Service

Create `/etc/systemd/system/urumi-backend.service`:

```ini
[Unit]
Description=Urumi Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/urumi/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
systemctl daemon-reload
systemctl enable urumi-backend
systemctl start urumi-backend
systemctl status urumi-backend
```

## Step 5: Dashboard Deployment

### 5.1 Build Dashboard

```bash
cd /opt/urumi/dashboard

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=https://api.yourdomain.com/api
EOF

# Build dashboard
npm run build
```

### 5.2 Install NGINX

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### 5.3 Configure NGINX

Create `/etc/nginx/sites-available/urumi-dashboard`:

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    root /opt/urumi/dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Create `/etc/nginx/sites-available/urumi-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable sites:
```bash
ln -s /etc/nginx/sites-available/urumi-dashboard /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/urumi-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 5.4 Setup SSL with Let's Encrypt

```bash
certbot --nginx -d dashboard.yourdomain.com
certbot --nginx -d api.yourdomain.com
```

Follow the prompts to configure SSL.

## Step 6: RBAC Configuration

### 6.1 Apply RBAC Manifests

```bash
cd /opt/urumi
kubectl apply -f kubernetes/rbac.yaml
```

### 6.2 Update Backend to Use ServiceAccount

Edit `/opt/urumi/backend/.env`:

```bash
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
```

Restart backend:
```bash
systemctl restart urumi-backend
```

## Step 7: Ingress Controller Configuration

k3s comes with Traefik by default. Update Helm values to use proper ingress class.

Edit `/opt/urumi/helm/store/values-prod.yaml`:

```yaml
ingress:
  className: traefik
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
  hosts:
    - host: ""  # Will be set dynamically
      paths:
        - path: /
          pathType: Prefix
```

## Step 8: Firewall Configuration

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow SSH (if not already allowed)
ufw allow 22/tcp

# Enable firewall
ufw enable
```

## Step 9: Verification

### 9.1 Check Backend

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "kubernetes": true,
    "helm": true
  }
}
```

### 9.2 Check Dashboard

Visit `https://dashboard.yourdomain.com` in your browser.

### 9.3 Create Test Store

1. Open dashboard
2. Click "Create Store"
3. Wait for provisioning
4. Store should be accessible at `https://<store-id>.yourdomain.com`

## Step 10: Monitoring and Logging

### 10.1 Check Backend Logs

```bash
journalctl -u urumi-backend -f
```

### 10.2 Check Application Logs

```bash
tail -f /opt/urumi/backend/logs/combined.log
```

### 10.3 Check Kubernetes Resources

```bash
kubectl get all --all-namespaces
kubectl get pods -n store-<store-id>
```

## Step 11: Backups

### 11.1 Database Backup

Create backup script `/opt/urumi/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/urumi/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

sudo -u postgres pg_dump urumi > $BACKUP_DIR/urumi_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "urumi_*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
chmod +x /opt/urumi/backup-db.sh
crontab -e

# Add this line (daily backup at 2 AM)
0 2 * * * /opt/urumi/backup-db.sh
```

### 11.2 Kubernetes Backup (Optional)

For production, consider using Velero for Kubernetes backup:

```bash
# Install Velero
wget https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz
tar -xvf velero-v1.12.0-linux-amd64.tar.gz
mv velero-v1.12.0-linux-amd64/velero /usr/local/bin/

# Configure Velero with your storage provider (S3, GCS, etc.)
```

## Step 12: Performance Tuning

### 12.1 Increase Resource Limits

Edit `/opt/urumi/helm/store/values-prod.yaml`:

```yaml
wordpress:
  resources:
    requests:
      memory: "512Mi"
      cpu: "200m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

mysql:
  resources:
    requests:
      memory: "512Mi"
      cpu: "200m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
```

### 12.2 Adjust Concurrent Provisions

Edit `/opt/urumi/backend/.env`:

```bash
MAX_CONCURRENT_PROVISIONS=5
```

Restart backend:
```bash
systemctl restart urumi-backend
```

## Step 13: Security Hardening

### 13.1 Secure PostgreSQL

Edit `/etc/postgresql/*/main/pg_hba.conf`:

```
# Remove or comment out:
# host all all 0.0.0.0/0 md5

# Only allow localhost
host    urumi    urumi    127.0.0.1/32    md5
```

### 13.2 Enable Network Policies

Create `/opt/urumi/kubernetes/network-policy.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: store-isolation
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
  egress:
  - to:
    - namespaceSelector: {}
```

Apply per namespace when creating stores.

### 13.3 Rotate Secrets

Regularly rotate:
- Database passwords
- Store WordPress admin passwords (users can reset via WP)

## Troubleshooting

### Backend won't start

Check logs:
```bash
journalctl -u urumi-backend -n 50 --no-pager
```

### Stores not accessible

Check ingress:
```bash
kubectl get ingress --all-namespaces
```

Check DNS:
```bash
nslookup <store-id>.yourdomain.com
```

### High resource usage

Check resource usage:
```bash
kubectl top nodes
kubectl top pods --all-namespaces
```

## Maintenance

### Update Backend

```bash
cd /opt/urumi
git pull
cd backend
npm install
npm run build
systemctl restart urumi-backend
```

### Update Dashboard

```bash
cd /opt/urumi/dashboard
npm install
npm run build
# Dashboard is static, no restart needed
```

### Update Docker Image

```bash
cd /opt/urumi/docker/wordpress-woocommerce
docker build -t urumi/wordpress-woocommerce:latest .
ctr -n k8s.io image import <(docker save urumi/wordpress-woocommerce:latest)
```

New stores will use the updated image.

## Scaling

### Vertical Scaling

- Upgrade VPS to more CPU/RAM
- Increase resource limits in Helm values
- Increase MAX_STORES

### Horizontal Scaling

- Deploy multiple backend replicas
- Use load balancer
- Setup PostgreSQL replication

## Monitoring (Advanced)

For production monitoring, consider:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Loki**: Log aggregation
- **Alertmanager**: Alerting

## Cost Estimation

Approximate monthly costs:

- **VPS** (4GB RAM, 2 CPU): $20-40
- **Domain**: $10-15/year
- **Storage** (varies by store count): Included in VPS
- **SSL**: Free (Let's Encrypt)

**Total**: ~$25-50/month for 10-20 stores

## Next Steps

- Setup monitoring and alerting
- Configure automated backups
- Implement CI/CD pipeline
- Add TLS for store ingresses
- Setup backup retention policies

## Support

For production issues:
- Check logs: `/opt/urumi/backend/logs/`
- Check system status: `systemctl status urumi-backend`
- Check k3s status: `kubectl get nodes`

For help, open a GitHub issue with:
- System logs
- Error messages
- Kubernetes resource status
