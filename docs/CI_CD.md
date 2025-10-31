# CI/CD Pipeline Documentation

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline setup for the Ticket Ace Portal project.

## Overview

The CI/CD pipeline ensures code quality, type safety, and automated deployments. The pipeline supports multiple deployment platforms and environments.

## Pipeline Stages

```
┌─────────────┐
│   Commit    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│    Lint     │────▶│  Type Check  │
└─────────────┘     └──────┬───────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Build    │
                    └──────┬──────┘
                           │
                           ▼
              ┌──────────────────────┐
              │   Deploy (Manual)    │
              │  Production/Staging  │
              └──────────────────────┘
```

### 1. Lint Stage

**Purpose**: Check code quality and enforce style guidelines.

**Actions**:
- Runs ESLint on all source files
- Validates code style and best practices
- Checks for common errors and warnings

**Command**: `npm run lint`

**Failure**: Pipeline stops if linting errors are found

### 2. Type Check Stage

**Purpose**: Verify TypeScript type safety without building.

**Actions**:
- Runs TypeScript compiler in check-only mode
- Validates type definitions across the codebase
- Ensures no type errors before build

**Command**: `npm run typecheck` or `npx tsc --noEmit`

**Failure**: Pipeline stops if type errors are found

### 3. Build Stage

**Purpose**: Compile and bundle the application.

**Actions**:
- Installs dependencies
- Builds the application using Vite
- Generates production-ready static files in `dist/`
- Uploads build artifacts for deployment

**Command**: `npm run build`

**Artifacts**: `dist/` folder containing static assets

**Failure**: Pipeline stops if build fails

### 4. Deploy Stage

**Purpose**: Deploy built application to hosting platform.

**Environments**:
- **Production**: Deploys from `main` branch or version tags
- **Staging**: Deploys from `develop` branch

**Deployment Platforms**: See [Deployment Options](#deployment-options) below

## CI/CD Platforms

### GitHub Actions

GitHub Actions workflows are located in `.github/workflows/`:

#### Files

- **`.github/workflows/ci.yml`**: Continuous Integration
  - Runs on every push to `main`/`develop` and on pull requests
  - Executes lint, type check, and build stages
  - Uploads build artifacts

- **`.github/workflows/cd.yml`**: Continuous Deployment
  - Runs on pushes to `main` (production) or `develop` (staging)
  - Supports manual deployment via `workflow_dispatch`
  - Multiple deployment platform options

#### Setup

1. **Required Secrets** (Repository Settings → Secrets and variables → Actions):

   **For Production**:
   ```
   VITE_CHATWOOT_BASE_URL
   VITE_CHATWOOT_ACCESS_TOKEN
   VITE_CHATWOOT_ACCOUNT_ID
   ```

   **For Staging**:
   ```
   VITE_CHATWOOT_BASE_URL_STAGING
   VITE_CHATWOOT_ACCESS_TOKEN_STAGING
   VITE_CHATWOOT_ACCOUNT_ID_STAGING
   ```

   **Platform-specific secrets** (choose one):
   - **Vercel**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
   - **Netlify**: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
   - **AWS**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_CLOUDFRONT_DISTRIBUTION_ID`
   - **Custom SSH**: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`

2. **Required Variables** (Repository Settings → Secrets and variables → Actions → Variables):

   Enable your deployment platform:
   ```
   DEPLOY_TO_VERCEL=true
   # or
   DEPLOY_TO_NETLIFY=true
   # or
   DEPLOY_TO_AWS=true
   # or
   DEPLOY_TO_CUSTOM=true
   ```

#### Usage

**Automatic**:
- Push to `main` → Deploys to production
- Push to `develop` → Deploys to staging

**Manual**:
1. Go to Actions tab
2. Select "CD" workflow
3. Click "Run workflow"
4. Choose environment (production/staging)
5. Click "Run workflow"

### GitLab CI

GitLab CI configuration is in `.gitlab-ci.yml` at the repository root.

#### Setup

1. **Required Variables** (Settings → CI/CD → Variables):

   ```
   VITE_CHATWOOT_BASE_URL
   VITE_CHATWOOT_ACCESS_TOKEN
   VITE_CHATWOOT_ACCOUNT_ID
   DEPLOY_URL (production URL)
   DEPLOY_URL_STAGING (staging URL)
   ```

   **Platform-specific variables** (if using custom deployment):
   ```
   DEPLOY_USER
   DEPLOY_HOST
   DEPLOY_PATH
   ```

#### Usage

**Automatic**:
- Merge to `main` → Triggers production deployment (manual approval required)
- Push to `develop` → Triggers staging deployment (manual approval required)

**Manual**:
- Go to CI/CD → Pipelines
- Click "Run pipeline"
- Select branch
- Click "Run pipeline"
- Approve deployment job when it appears

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Zero-config, automatic HTTPS, edge network, preview deployments

**Setup**:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link`
4. Get tokens from Vercel dashboard:
   - Team Settings → General → Team ID
   - Project Settings → General → Project ID
   - User Settings → Tokens → Create Token

5. Add GitHub secrets:
   ```
   VERCEL_TOKEN=<your-token>
   VERCEL_ORG_ID=<your-team-id>
   VERCEL_PROJECT_ID=<your-project-id>
   ```

6. Set variable: `DEPLOY_TO_VERCEL=true`

**Manual Deployment**:
```bash
vercel --prod
```

### Option 2: Netlify

**Pros**: Automatic HTTPS, forms handling, serverless functions

**Setup**:

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Initialize: `netlify init`
4. Get tokens from Netlify dashboard:
   - User Settings → Applications → New access token
   - Site Settings → General → Site details → Site ID

5. Add GitHub secrets:
   ```
   NETLIFY_AUTH_TOKEN=<your-token>
   NETLIFY_SITE_ID=<your-site-id>
   ```

6. Set variable: `DEPLOY_TO_NETLIFY=true`

**Manual Deployment**:
```bash
netlify deploy --prod --dir=dist
```

### Option 3: AWS S3 + CloudFront

**Pros**: Scalable, cost-effective for high traffic, full control

**Setup**:

1. Create S3 bucket for static hosting
2. Configure CloudFront distribution
3. Set up IAM user with S3 and CloudFront permissions
4. Add GitHub secrets:
   ```
   AWS_ACCESS_KEY_ID=<access-key>
   AWS_SECRET_ACCESS_KEY=<secret-key>
   AWS_REGION=<region>
   AWS_S3_BUCKET=<bucket-name>
   AWS_CLOUDFRONT_DISTRIBUTION_ID=<distribution-id>
   ```

5. Set variable: `DEPLOY_TO_AWS=true`

**Manual Deployment**:
```bash
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 4: Custom Server (SSH)

**Pros**: Full control, custom infrastructure

**Setup**:

1. Generate SSH key pair:
   ```bash
   ssh-keygen -t ed25519 -C "ci@ticket-ace-portal"
   ```

2. Add public key to server: `~/.ssh/authorized_keys`
3. Add GitHub secrets:
   ```
   DEPLOY_HOST=<server-ip-or-domain>
   DEPLOY_USER=<ssh-user>
   DEPLOY_SSH_KEY=<private-key-content>
   DEPLOY_PATH=/var/www/ticket-ace-portal
   ```

4. Set variable: `DEPLOY_TO_CUSTOM=true`

**Manual Deployment**:
```bash
scp -r dist/* user@server:/var/www/ticket-ace-portal
```

## Local CI Simulation

Run the complete CI pipeline locally:

```bash
npm run ci
```

This runs:
1. `npm run lint` - Linting
2. `npm run typecheck` - Type checking
3. `npm run build` - Building

## Environment Variables

### Development
Set in `.env` file (not committed):
```env
VITE_CHATWOOT_BASE_URL=http://localhost:3000
VITE_CHATWOOT_ACCESS_TOKEN=your-token
VITE_CHATWOOT_ACCOUNT_ID=1
```

### Production/Staging
Set as secrets in your CI/CD platform. The build process injects these at build time (Vite requirement).

**Important**: Environment variables prefixed with `VITE_` are embedded in the build at compile time. They are not available at runtime.

## Branch Strategy

```
main (production)
  ↑
  │ (merge)
  │
develop (staging)
  ↑
  │ (pull request)
  │
feature/* (development)
```

- **`main`**: Production-ready code, auto-deploys to production
- **`develop`**: Integration branch, auto-deploys to staging
- **`feature/*`**: Feature branches, CI runs but no deployment

## Versioning and Tags

Create version tags for releases:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

Tagged releases trigger production deployment.

## Monitoring Deployments

### GitHub Actions
- Go to **Actions** tab
- View workflow runs
- Click on a run to see detailed logs
- Check deployment status and URLs

### GitLab CI
- Go to **CI/CD → Pipelines**
- View pipeline status
- Click on jobs to see logs
- Check environment deployments

## Troubleshooting

### Build Fails

1. **Check logs** in CI/CD platform
2. **Run locally**: `npm run ci`
3. **Common issues**:
   - Type errors → Fix TypeScript issues
   - Lint errors → Run `npm run lint:fix`
   - Missing dependencies → Run `npm install`

### Deployment Fails

1. **Check secrets**: Ensure all required secrets are set
2. **Check variables**: Verify deployment platform variable is set
3. **Check permissions**: Ensure tokens/keys have correct permissions
4. **Check logs**: Review deployment job logs for specific errors

### Environment Variables Not Working

- **Vite requirement**: Variables must start with `VITE_`
- **Build time**: Variables are embedded during build, not at runtime
- **Restart required**: After adding secrets, workflows need to re-run

## Future Enhancements

Planned improvements to the CI/CD pipeline:

- [ ] E2E testing with Playwright/Cypress
- [ ] Visual regression testing
- [ ] Performance budgets and Lighthouse CI
- [ ] Automated dependency updates (Dependabot/Renovate)
- [ ] Security scanning (npm audit, Snyk)
- [ ] Docker image builds for containerized deployments
- [ ] Multi-region deployment support
- [ ] Blue-green deployment strategy
- [ ] Rollback automation

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

