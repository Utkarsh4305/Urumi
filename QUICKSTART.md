# Quick Start Guide

Get your Urumi platform running in under 10 minutes!

## Prerequisites

Install these tools first:

- **Node.js 20+**: https://nodejs.org/
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **kubectl**: `choco install kubernetes-cli`
- **Helm**: `choco install kubernetes-helm`
- **k3d**: `choco install k3d`
- **Supabase Account**: https://supabase.com (free tier works)

## Step 1: Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Open the **SQL Editor** in your Supabase dashboard
3. Run the schema from `docs/supabase-schema.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS stores (
     id VARCHAR(16) PRIMARY KEY,
     type VARCHAR(20) NOT NULL,
     namespace VARCHAR(64) NOT NULL UNIQUE,
     status VARCHAR(20) NOT NULL,
     url VARCHAR(255),
     error_message TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
     updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
   CREATE INDEX IF NOT EXISTS idx_stores_created_at ON stores(created_at);
   ```
4. Get your credentials from **Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

## Step 2: Automated Setup (Recommended)

Run the setup script:

```powershell
cd D:\Urumi
.\setup-local.ps1
```

This script will:
1. ✓ Check prerequisites
2. ✓ Create k3d cluster
3. ✓ Build Docker image
4. ✓ Setup backend
5. ✓ Setup dashboard
6. ✓ Verify everything

## Step 3: Configure Backend

```powershell
cd backend
cp .env.example .env
```

Edit `backend/.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Step 4: Start Services

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Dashboard:**
```powershell
cd dashboard
npm run dev
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

### Database connection issues?

Verify your Supabase credentials in `backend/.env`:
- Check `SUPABASE_URL` matches your project URL
- Check `SUPABASE_SERVICE_KEY` is the **service_role** key (not anon key)

### Need more help?

See [docs/troubleshooting.md](docs/troubleshooting.md)

## Cleanup

To remove everything:

```bash
# Delete cluster
k3d cluster delete urumi-local

# Remove image
docker rmi urumi/wordpress-woocommerce:latest
```

---

**That's it! You're ready to provision stores!** 🚀
