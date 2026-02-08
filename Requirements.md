You are a senior DevOps + fullstack engineer. Build this entire project from scratch following the spec below.


Build a platform that provisions isolated ecommerce stores (WooCommerce fully implemented in Round 1, Medusa stub-ready) on Kubernetes using Helm.

The system must run locally on Kubernetes (k3d/kind/minikube) and deploy to production-like environments (k3s on VPS) using the same Helm charts with different values files.

High-Level Architecture

Frontend (React Dashboard)
→ Backend API (Node.js + TypeScript)
→ Kubernetes Cluster
→ Helm Charts provision isolated store environments

Each store must run in its own Kubernetes namespace and include:

WooCommerce (WordPress + WooCommerce plugin)

MySQL database with persistent volume

Ingress exposing a stable HTTP URL

Kubernetes Secrets for credentials

Required Capabilities
Dashboard (React + Tailwind)

View all provisioned stores

Show store status: Provisioning, Ready, Failed

Show store URL(s)

Show created timestamp

Button to create store (select type: WooCommerce or Medusa)

Button to delete store

Backend API (Node.js + TypeScript)

Responsibilities:

Accept store create/delete requests

Track store state in PostgreSQL

Generate unique store IDs

Create Kubernetes namespace per store

Trigger Helm install/uninstall commands

Monitor readiness (via Kubernetes API or HTTP checks)

Update store status accordingly

Enforce simple quotas (max stores per user)

Endpoints (example):

POST /stores
DELETE /stores/:id
GET /stores

Kubernetes & Helm (MANDATORY)

Helm charts must provision:

Namespace per store

WordPress Deployment

MySQL StatefulSet

PersistentVolumeClaim for DB

Service for WordPress

Ingress exposing store

Helm must support:

values.yaml (base)

values-local.yaml

values-prod.yaml

Ingress host pattern:

Local:
<store-id>.localhost
or
<store-id>.127.0.0.1.nip.io

Production:
<store-id>.yourdomain.com

WooCommerce Setup

WordPress container must automatically:

Install WooCommerce plugin

Activate WooCommerce

Be usable immediately for testing orders

Default theme/storefront is fine.

Definition of Done (must work)

For each created store:

Open storefront

Add product to cart

Checkout using test-friendly method

Confirm order exists in WooCommerce admin

Isolation & Reliability

Each store must:

Run in its own namespace

Have its own secrets

Have its own PVC

Be deletable cleanly (no resource leaks)

Add:

Readiness probes

Liveness probes

Optional but recommended:

ResourceQuota per namespace

LimitRange defaults

Secrets Handling

No secrets hardcoded in repo

Use Kubernetes Secrets via Helm templates

Local-to-Production Parity

Local cluster:

k3d/kind/minikube

nginx ingress controller

Production-like:

k3s on VPS

same Helm charts

only values files change

Project Structure (required)

Root:

/dashboard → React frontend
/backend → Node.js API
/helm → Helm charts
README.md

Helm Structure

/helm/store/

templates:

namespace.yaml

wordpress-deployment.yaml

mysql-statefulset.yaml

pvc.yaml

service.yaml

ingress.yaml

secrets.yaml

resourcequota.yaml (optional)

values.yaml
values-local.yaml
values-prod.yaml

Backend Responsibilities in Detail

Use Kubernetes client or shell out to Helm

Generate store namespace name (store-<id>)

Helm install with store-specific values

Poll readiness (ingress reachable + pods ready)

Update status in PostgreSQL

Database Schema (platform DB)

stores table:

id
type
namespace
status
url
created_at

Clean Teardown

Deleting a store must:

Helm uninstall release

Delete namespace

Ensure PVCs removed

Observability (basic)

Log provisioning steps

Capture errors and expose failure reason in dashboard

Security (basic)

Backend uses Kubernetes ServiceAccount

RBAC with limited permissions (create namespaces, deploy resources)

Secrets only mounted where required

Scaling Expectations (documented + optionally implemented)

Backend API horizontally scalable

Dashboard stateless

Provisioning concurrency control

Deliverables Required

Fully working local setup

README with:

Local setup instructions
Production-like setup instructions
Store creation flow
Order test flow

System design & tradeoffs doc

Stretch Goals (optional but impressive)

TLS with cert-manager

NetworkPolicies per namespace

Metrics for provisioning time

Activity logs in UI

Helm rollback example

Development Assumptions

Use official Docker images where possible

Prefer simplicity over overengineering

Prioritize Kubernetes-native workflows

WooCommerce must be real (not mocked)

Final Instruction to LLM

Generate the full project starting from an empty folder including:

Folder structure

Frontend React code

Backend Node.js API code

Helm charts with templates

Kubernetes manifests

README documentation

Ensure the system runs locally on Kubernetes and provisions real WooCommerce stores with functional checkout.