# Urumi Local Development Setup Script
# This script automates the setup of the Urumi platform for local development

param(
    [switch]$SkipCluster,
    [switch]$SkipDatabase,
    [switch]$SkipDeps
)

$ErrorActionPreference = "Stop"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Urumi Local Setup Script        " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Function to wait for user confirmation
function Wait-Continue {
    param($Message)
    Write-Host ""
    Write-Host $Message -ForegroundColor Yellow
    $null = Read-Host "Press Enter to continue"
}

# Step 1: Check prerequisites
Write-Host "[1/8] Checking prerequisites..." -ForegroundColor Green

$missing = @()

if (-not (Test-Command "node")) {
    $missing += "Node.js"
}

if (-not (Test-Command "docker")) {
    $missing += "Docker"
}

if (-not (Test-Command "kubectl")) {
    $missing += "kubectl"
}

if (-not (Test-Command "helm")) {
    $missing += "Helm"
}

if (-not (Test-Command "k3d")) {
    $missing += "k3d"
}

if ($missing.Count -gt 0) {
    Write-Host "Missing prerequisites: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Please install the missing tools and run this script again." -ForegroundColor Red
    Write-Host "See docs/local-setup.md for installation instructions." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ All prerequisites found!" -ForegroundColor Green

# Step 2: Create k3d cluster
if (-not $SkipCluster) {
    Write-Host ""
    Write-Host "[2/8] Creating k3d cluster..." -ForegroundColor Green

    # Check if cluster already exists
    $clusterExists = k3d cluster list | Select-String "urumi-local"

    if ($clusterExists) {
        Write-Host "Cluster 'urumi-local' already exists." -ForegroundColor Yellow
        $response = Read-Host "Do you want to delete and recreate it? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Deleting existing cluster..." -ForegroundColor Yellow
            k3d cluster delete urumi-local
            Write-Host "Creating new cluster..." -ForegroundColor Yellow
            k3d cluster create urumi-local --port "80:80@loadbalancer"
        }
        else {
            Write-Host "Using existing cluster." -ForegroundColor Green
        }
    }
    else {
        k3d cluster create urumi-local --port "80:80@loadbalancer"
    }

    Write-Host "✓ Cluster ready!" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "[2/8] Skipping cluster creation (--SkipCluster)" -ForegroundColor Yellow
}

# Step 3: Build and import Docker image
Write-Host ""
Write-Host "[3/8] Building WordPress+WooCommerce Docker image..." -ForegroundColor Green

Push-Location docker/wordpress-woocommerce
docker build -t urumi/wordpress-woocommerce:latest .
Pop-Location

Write-Host "Importing image into k3d cluster..." -ForegroundColor Green
k3d image import urumi/wordpress-woocommerce:latest -c urumi-local

Write-Host "✓ Docker image ready!" -ForegroundColor Green

# Step 4: Start PostgreSQL
if (-not $SkipDatabase) {
    Write-Host ""
    Write-Host "[4/8] Starting PostgreSQL..." -ForegroundColor Green

    # Check if container already exists
    $containerExists = docker ps -a --format "{{.Names}}" | Select-String "urumi-postgres"

    if ($containerExists) {
        Write-Host "PostgreSQL container already exists." -ForegroundColor Yellow
        $response = Read-Host "Do you want to remove and recreate it? (y/N)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Removing existing container..." -ForegroundColor Yellow
            docker stop urumi-postgres 2>$null
            docker rm urumi-postgres 2>$null
            Write-Host "Creating new container..." -ForegroundColor Yellow
            docker run -d --name urumi-postgres `
                -e POSTGRES_DB=urumi `
                -e POSTGRES_USER=urumi `
                -e POSTGRES_PASSWORD=urumi123 `
                -p 5432:5432 `
                postgres:15
        }
        else {
            Write-Host "Starting existing container..." -ForegroundColor Green
            docker start urumi-postgres 2>$null
        }
    }
    else {
        docker run -d --name urumi-postgres `
            -e POSTGRES_DB=urumi `
            -e POSTGRES_USER=urumi `
            -e POSTGRES_PASSWORD=urumi123 `
            -p 5432:5432 `
            postgres:15
    }

    # Wait for PostgreSQL to be ready
    Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5

    Write-Host "✓ PostgreSQL ready!" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "[4/8] Skipping database setup (--SkipDatabase)" -ForegroundColor Yellow
}

# Step 5: Setup backend
Write-Host ""
Write-Host "[5/8] Setting up backend..." -ForegroundColor Green

Push-Location backend

if (-not $SkipDeps) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
}
else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

# Create logs directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run migrate

Pop-Location

Write-Host "✓ Backend setup complete!" -ForegroundColor Green

# Step 6: Setup dashboard
Write-Host ""
Write-Host "[6/8] Setting up dashboard..." -ForegroundColor Green

Push-Location dashboard

if (-not $SkipDeps) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
}
else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

Pop-Location

Write-Host "✓ Dashboard setup complete!" -ForegroundColor Green

# Step 7: Verify setup
Write-Host ""
Write-Host "[7/8] Verifying setup..." -ForegroundColor Green

# Check k3d cluster
$clusterRunning = kubectl cluster-info 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Kubernetes cluster is running" -ForegroundColor Green
}
else {
    Write-Host "✗ Kubernetes cluster check failed" -ForegroundColor Red
}

# Check PostgreSQL
$pgRunning = docker ps --format "{{.Names}}" | Select-String "urumi-postgres"
if ($pgRunning) {
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
}
else {
    Write-Host "✗ PostgreSQL is not running" -ForegroundColor Red
}

# Check Docker image
$imageExists = docker images --format "{{.Repository}}:{{.Tag}}" | Select-String "urumi/wordpress-woocommerce:latest"
if ($imageExists) {
    Write-Host "✓ Docker image is built" -ForegroundColor Green
}
else {
    Write-Host "✗ Docker image not found" -ForegroundColor Red
}

# Step 8: Print next steps
Write-Host ""
Write-Host "[8/8] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "        Next Steps                  " -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In a new terminal, start the dashboard:" -ForegroundColor White
Write-Host "   cd dashboard" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Click 'Create Store' to provision your first store!" -ForegroundColor White
Write-Host ""
Write-Host "For troubleshooting, see: docs/troubleshooting.md" -ForegroundColor Yellow
Write-Host ""
