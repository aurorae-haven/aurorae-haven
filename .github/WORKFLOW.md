# CI/CD Workflow Documentation

## Overview

This repository uses GitHub Actions to automatically test, build, and deploy the Stellar Journey application to GitHub Pages.

## Workflow: Build, Test & Deploy to GitHub Pages

**File**: `.github/workflows/upload-pages-artifact.yml`

### Triggers

- **Push** to `main` or `feature-*` branches
- **Manual trigger** via workflow_dispatch

### Jobs

#### 1. Test Job

Runs comprehensive testing and security checks before allowing deployment.

**Steps**:

1. **Checkout code**: Gets the latest code from the repository
2. **Setup Node.js**: Installs Node.js 18 with npm cache
3. **Install dependencies**: Runs `npm ci` for clean install
4. **Run linter**:
   - Checks all code for style issues
   - Allows warnings in legacy code
   - **FAILS** if new code (src/pages/, src/utils/, src/**tests**/) has errors
5. **Run tests**:
   - Executes all Jest tests with coverage
   - **FAILS** if any test fails
6. **Security vulnerability scan**:
   - Runs `npm audit` to check for vulnerabilities
   - **BLOCKS deployment** for HIGH or CRITICAL vulnerabilities
   - **ALLOWS** moderate/low vulnerabilities in dev dependencies (documented in SECURITY.md)
   - Specifically checks for webpack-dev-server (known acceptable dev-only vulnerability)

**Exit Conditions**:

- ❌ Fails if: Tests fail, new code has linting errors, or HIGH/CRITICAL vulnerabilities found
- ✅ Passes if: All tests pass, new code is clean, only acceptable vulnerabilities present

#### 2. Build Job

Builds the production-ready application.

**Dependencies**: Requires `test` job to pass first

**Steps**:

1. **Checkout code**
2. **Setup Node.js**
3. **Install dependencies**
4. **Build React PWA**:
   - Runs `npm run build`
   - Sets PUBLIC_URL to '/my-stellar-trail'
5. **Verify build output**:
   - Checks that `dist/` directory exists
   - Verifies `index.html` is present
   - Confirms `manifest.json` exists
   - Validates `static/` directory
   - **FAILS** if any critical file is missing
6. **Upload artifact**: Prepares the build for deployment

**Exit Conditions**:

- ❌ Fails if: Build fails or required files are missing
- ✅ Passes if: Build completes and all critical files exist

#### 3. Deploy Job

Deploys the built application to GitHub Pages.

**Dependencies**: Requires `build` job to pass first

**Steps**:

1. **Deploy to Pages**: Uses GitHub's deploy-pages action
2. **Verify deployment**: Confirms deployment and outputs the site URL

**Environment**:

- Name: `github-pages`
- URL: Automatically set by GitHub Pages

## Security Checks

### Known Vulnerabilities

See `.github/SECURITY.md` for details on accepted vulnerabilities.

**webpack-dev-server** (Moderate):

- ✅ **ACCEPTED** - Development dependency only
- Not included in production builds
- End users are never exposed to this vulnerability
- Documented risk assessment in SECURITY.md

### Blocking Conditions

Deployment will be **BLOCKED** if:

- HIGH or CRITICAL severity vulnerabilities are found
- Tests fail
- Build fails
- New code has linting errors
- Critical build artifacts are missing

### Allowed Conditions

Deployment will **PROCEED** if:

- Only moderate/low severity vulnerabilities in dev dependencies
- All tests pass
- Build completes successfully
- New code passes linting

## Local Testing

Before pushing, you can run the same checks locally:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Check security vulnerabilities
npm audit --audit-level=moderate

# Build the application
npm run build

# Verify build output
ls -la dist/
```

## Monitoring Deployments

1. **Check workflow status**: Navigate to the "Actions" tab in GitHub
2. **View job details**: Click on any workflow run to see detailed logs
3. **Monitor site**: Visit https://ayanimea.github.io/my-stellar-trail/

## Troubleshooting

### Tests Failing

- Check the test job logs in GitHub Actions
- Run tests locally: `npm test`
- Ensure all dependencies are installed: `npm ci`

### Build Failing

- Check the build job logs
- Verify PUBLIC_URL is set correctly in package.json
- Run build locally: `npm run build`

### Security Vulnerabilities Blocking Deployment

- Review the vulnerability report in the test job logs
- Check SECURITY.md to see if it's a known acceptable vulnerability
- If it's HIGH or CRITICAL:
  - Update the vulnerable package if possible
  - Document why it's acceptable (if it is)
  - Update SECURITY.md with the justification

### Deployment Not Updating

- Check that all jobs passed (test → build → deploy)
- Verify GitHub Pages is enabled in repository settings
- Check that the workflow has necessary permissions
- Allow a few minutes for GitHub Pages to update

## Maintenance

### Adding New Tests

1. Add test files to `src/__tests__/`
2. Follow existing test patterns
3. Ensure tests pass locally before pushing

### Updating Dependencies

1. Run `npm audit` to check for vulnerabilities
2. Update package.json
3. Test locally
4. Update SECURITY.md if new vulnerabilities are introduced

### Modifying Workflow

1. Edit `.github/workflows/upload-pages-artifact.yml`
2. Test changes on a feature branch first
3. Document any new security checks or requirements
4. Update this documentation if workflow changes significantly
