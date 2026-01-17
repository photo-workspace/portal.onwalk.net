# Portal CI/CD Deploy How-to

This guide describes how to run the `portal-cicd.yml` workflow and wire secrets for each deployment target.

## Workflow

File: `.github/workflows/portal-cicd.yml`

Triggers:
- `push` to `main` (CI + container publish)
- `workflow_dispatch` (CI + optional CD)

Dispatch inputs:
- `environment`: `dev` or `prod`
- `deploy_target`: `portal`, `vm`, `container`, `k8s`, or `all`
- `image_tag`: optional; defaults to commit SHA

## Required Secrets

### Vercel (portal)
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### VM (SSH)
- `VM_HOST`
- `VM_USER`
- `VM_PORT` (optional; default 22)
- `VM_SSH_KEY`
- `VM_DEPLOY_COMMAND` (e.g., docker compose/PM2/systemd rollout)

### K3S/K8S
- `KUBECONFIG_B64` (base64 of kubeconfig)

## Examples

### Trigger deployment (GitHub CLI)

```bash
gh workflow run portal-cicd.yml \
  -f environment=prod \
  -f deploy_target=portal
```

### Trigger all targets

```bash
gh workflow run portal-cicd.yml \
  -f environment=prod \
  -f deploy_target=all
```

## Notes

- The workflow builds and publishes a GHCR image before VM/K8S/CD steps.
- VM/K8S/container deployments are templates; replace the placeholder steps with your rollout scripts.
- Vercel deployment uses `vercel deploy --prod --force`.
