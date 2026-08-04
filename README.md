# React Vite App — CI/CD to Amazon EKS with Jenkins

A complete CI/CD pipeline that builds, containerizes, and deploys a React (Vite) application to Amazon EKS. Every push to `main` is automatically built by Jenkins, packaged into a Docker image, pushed to Amazon ECR, and rolled out to a live Kubernetes deployment — with zero manual intervention.

![Architecture diagram](./architecture-diagram.png)

## What this project demonstrates

- Provisioning and managing an Amazon EKS cluster (control plane + managed node group)
- Hosting Jenkins on EC2 and configuring it for CI/CD (plugins, credentials, tools, pipeline jobs)
- Containerizing a frontend application with a multi-stage Dockerfile
- Pushing versioned images to Amazon ECR
- Deploying and updating Kubernetes workloads (Deployment + Service) via `kubectl`
- Fully automated continuous deployment triggered by Git pushes (Poll SCM)

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite |
| CI/CD | Jenkins (Declarative Pipeline) |
| Containerization | Docker (multi-stage build with Nginx) |
| Registry | Amazon ECR |
| Orchestration | Amazon EKS (Kubernetes) |
| Infra | AWS EC2, IAM |

## Pipeline stages

```
Git push → Checkout → Install Dependencies → Build React App
  → Build Docker Image → Push to ECR → Update K8s Deployment
```

Each build tags its image with the Jenkins `BUILD_NUMBER`, so every deployment is traceable back to a specific pipeline run. The final stage runs `kubectl set image` followed by `kubectl rollout status`, so the pipeline only reports success once the new pods are actually healthy and serving traffic.

## Repository structure

```
.
├── src/                    # React application source
├── public/
├── Dockerfile               # Multi-stage build: Node (build) → Nginx (serve)
├── .dockerignore
├── Jenkinsfile               # Pipeline definition
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
├── architecture-diagram.png
├── package.json
└── README.md
```

## Setup overview

1. **EKS cluster** — created with a managed node group (2+ worker nodes), verified with `kubectl get nodes`
2. **Jenkins on EC2** — Java, Git, Docker, AWS CLI, and kubectl installed; Jenkins user added to the `docker` group so pipeline builds can run Docker without sudo
3. **Jenkins credentials** — a GitHub PAT for repo checkout, and AWS access keys (IAM user with ECR + EKS permissions) for pushing images and updating the cluster
4. **IAM ↔ Kubernetes RBAC** — the IAM user used by Jenkins is mapped into the cluster's `aws-auth` ConfigMap; IAM permissions alone aren't enough for `kubectl` to work
5. **Pipeline job** — configured as "Pipeline script from SCM," pointing at this repo's `Jenkinsfile`
6. **Continuous deployment** — Jenkins polls this repo every 5 minutes (`H/5 * * * *`); any push to `main` triggers a full build → push → rollout automatically

## Notable issues hit and fixed

- **`libatomic.so.1` missing** — Node failed to run on the EC2 host until `libatomic` was installed via the package manager. This is a common gap on minimal Amazon Linux images.
- **Docker permission denied** — the `jenkins` system user couldn't talk to the Docker daemon until it was added to the `docker` group and the service was restarted.
- **`kubectl` unauthorized despite IAM AdministratorAccess** — IAM permissions and Kubernetes RBAC are separate systems; the IAM user still had to be explicitly mapped into `aws-auth` before `kubectl` commands would succeed.

## Result

A code change pushed to this repo is live on the EKS-hosted application, via the LoadBalancer URL, typically within minutes — fully automated, no manual steps.
