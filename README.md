# Netflix Clone — DevSecOps Edition

A pixel-close Netflix UI clone (React + Vite) — black theme, hero banner, hover-scaling
carousel rows, animated navbar, and a real Netflix-style login page — pulling real
movie/TV data from **TMDB** so it actually feels populated like the real thing.

Ships with a full **DevSecOps CI/CD pipeline** (GitHub Actions) and Kubernetes
manifests for **three deployment targets**: a single EC2 instance, a local
**kind** cluster, and **AWS EKS**. Comment out whichever target(s) you don't need.

```
netflix-clone/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── api/tmdb.js        # TMDB API client
│   │   ├── components/        # Navbar, Banner, Row, Footer
│   │   └── pages/Login.jsx    # Netflix-style sign-in page
│   ├── Dockerfile             # multi-stage, non-root, nginx:alpine
│   └── nginx.conf
├── docker-compose.yml         # EC2 deploy target
├── kubernetes/
│   ├── kind/                  # local kind cluster manifests
│   └── eks/                   # AWS EKS manifests (HPA, ALB ingress)
├── .github/workflows/ci-cd.yml
└── sonar-project.properties
```

---

## 1. Get a free TMDB API key

The UI is driven by real data — you need a free key so posters/titles load.

1. Create an account at https://www.themoviedb.org/
2. Go to **Settings → API** and request a free "Developer" API key (v3 auth).
3. Copy `frontend/.env.example` to `frontend/.env` and paste it in:

```bash
cp frontend/.env.example frontend/.env
# edit frontend/.env
VITE_TMDB_API_KEY=your_real_key_here
```

Without a key the app still renders (nav, banner skeleton, login page) but shows
a banner reminding you no key is set instead of real posters.

---

## 2. Run it locally (fastest way to see it)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — full Netflix homepage with a random Originals
hero banner, 8 genre rows, hover-to-preview cards, and `/login` for the sign-in page.

---

## 3. Run it with Docker (single container)

```bash
cd frontend
docker build -t netflix-clone-frontend:local \
  --build-arg VITE_TMDB_API_KEY=your_real_key_here .
docker run -p 8080:8080 netflix-clone-frontend:local
```

Open http://localhost:8080

---

## 4. Deploy target A — EC2 (docker compose)

On a fresh EC2 instance (Ubuntu, Docker + Docker Compose plugin installed):

```bash
git clone https://github.com/<you>/netflix-clone.git
cd netflix-clone
mkdir -p ~/netflix-clone && cp docker-compose.yml ~/netflix-clone/
cd ~/netflix-clone
export VITE_TMDB_API_KEY=your_real_key_here
docker compose up -d --build
```

Open the EC2 instance's public IP on port 80. Open port 80 in its security group.

For CI/CD: the `deploy-ec2` job in `ci-cd.yml` SSHes in and runs
`docker compose pull && up -d` automatically on every push to `main`. It needs
these GitHub repo secrets:

| Secret | Value |
|---|---|
| `EC2_HOST` | public IP or DNS of the instance |
| `EC2_USERNAME` | e.g. `ubuntu` |
| `EC2_SSH_KEY` | private key (PEM) with access to the instance |
| `DOCKERHUB_USERNAME` / `DOCKERHUB_TOKEN` | so the instance can pull the image |

If you're **not** deploying to EC2, delete/comment the `deploy-ec2` job in
`.github/workflows/ci-cd.yml`.

---

## 5. Deploy target B — local kind cluster

```bash
# 1. Create the cluster (with ingress-ready node labels)
kind create cluster --name netflix-clone --config kubernetes/kind/kind-cluster-config.yaml

# 2. Build the image locally and load it into kind (kind can't pull from your
#    local docker daemon on its own — it needs an explicit load)
docker build -t netflix-clone-frontend:local \
  --build-arg VITE_TMDB_API_KEY=your_real_key_here ./frontend
kind load docker-image netflix-clone-frontend:local --name netflix-clone

# 3. Apply the manifests
kubectl apply -f kubernetes/kind/namespace.yaml
kubectl apply -f kubernetes/kind/deployment.yaml
kubectl apply -f kubernetes/kind/service.yaml

# 4. Access it (NodePort 30080 mapped onto the kind node)
kubectl get nodes -o wide   # find the node's internal port mapping, or:
kubectl port-forward -n netflix-clone svc/netflix-frontend-svc 8080:80
```

Open http://localhost:8080

Optional: if you install `ingress-nginx` in kind, also
`kubectl apply -f kubernetes/kind/ingress.yaml` and add `127.0.0.1 netflix.local`
to `/etc/hosts`.

CI/CD note: kind only exists on your machine, so the pipeline's `deploy-kind`
job is **disabled by default** (`if: false`) and targets a `self-hosted`
runner. For local dev, just run the `kubectl apply` commands above by hand —
that's the normal way to work with kind. Delete that job entirely if you don't
plan to wire up a self-hosted runner.

---

## 6. Deploy target C — AWS EKS

Assumes you already have an EKS cluster and `kubectl`/`aws` configured, plus
the AWS Load Balancer Controller installed (for the ALB Ingress).

```bash
aws eks update-kubeconfig --name <your-cluster-name> --region <your-region>

# point the deployment at your pushed image first (see CI/CD below, or edit
# kubernetes/eks/deployment.yaml manually), then:
kubectl apply -f kubernetes/eks/namespace.yaml
kubectl apply -f kubernetes/eks/deployment.yaml   # includes an HPA (3-8 replicas)
kubectl apply -f kubernetes/eks/service.yaml
kubectl apply -f kubernetes/eks/ingress.yaml      # provisions an ALB

kubectl get ingress -n netflix-clone   # grab the ALB DNS name once it's ready
```

For CI/CD: the `deploy-eks` job needs these repo secrets:

| Secret | Value |
|---|---|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user/role with EKS + ECR access |
| `AWS_REGION` | e.g. `ap-south-1` |
| `EKS_CLUSTER_NAME` | your cluster's name |

If you're **not** deploying to EKS, delete/comment the `deploy-eks` job.
If you'd rather pull from ECR than Docker Hub, uncomment the ECR block inside
`docker-build-scan-push` in `ci-cd.yml` and update the `sed` target in
`deploy-eks` to match your ECR repo URI.

---

## 7. The CI/CD pipeline (`.github/workflows/ci-cd.yml`)

Runs on every push/PR to `main`, in this order:

1. **Build & Lint** — `npm ci`, ESLint, `vite build`
2. **DevSecOps gates** (run in parallel):
   - **Semgrep** — SAST (OWASP Top 10 + React + JS rulesets)
   - **Gitleaks** — secret scanning across the git history
   - **npm audit + Trivy filesystem scan** — dependency vulnerabilities
   - **SonarCloud** — static code quality/maintainability
3. **Docker build → Trivy image scan → push to Docker Hub**
   (SARIF results upload to the repo's Security tab)
4. **Deploy** — three independent jobs, `deploy-ec2`, `deploy-kind`, `deploy-eks`,
   all gated on the same built/scanned image.

### Making it "comfortable for all three" targets

Every deploy job is self-contained — comment out (or delete) whichever job(s)
you don't need for your setup. For example, if you're only doing EC2 + EKS:

```yaml
# deploy-kind:
#   ... (leave commented, or delete the whole block)
```

### Required GitHub repo secrets (Settings → Secrets and variables → Actions)

| Secret | Used by |
|---|---|
| `VITE_TMDB_API_KEY` | build job (bakes real movie data into the bundle) |
| `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` | image push + EC2/EKS pulls |
| `SONAR_TOKEN` | SonarCloud job (skip if not using it) |
| `EC2_HOST`, `EC2_USERNAME`, `EC2_SSH_KEY` | EC2 deploy job only |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `EKS_CLUSTER_NAME` | EKS deploy job only |

Any severity gate currently set to "report only" (`exit-code: '0'`, `|| true`)
can be flipped to hard-fail the pipeline once you're ready to enforce it —
those spots are commented inline in `ci-cd.yml`.

---

## 8. Security notes baked into this repo

- Containers run as a **non-root user**, with a **read-only root filesystem**
  and all Linux capabilities dropped (Dockerfile, docker-compose, and both
  K8s deployments).
- `nginx.conf` sets `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, and a basic `Permissions-Policy`.
- Secrets (TMDB key, registry creds, SSH keys, AWS creds) are never committed —
  they're GitHub Actions secrets, injected at build/deploy time only.
- `.env` is git-ignored; only `.env.example` (no real key) is committed.

## 9. Attribution

This is a personal/portfolio clone for learning DevSecOps + Kubernetes
deployment patterns. It is not affiliated with or endorsed by Netflix, Inc.
Movie/TV metadata and images are served from TMDB
(https://www.themoviedb.org) — this product uses the TMDB API but is not
endorsed or certified by TMDB.
