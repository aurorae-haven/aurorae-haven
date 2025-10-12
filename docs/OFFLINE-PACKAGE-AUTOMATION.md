# Offline Package Automation

This document explains the automated offline package upload system implemented for Aurorae Haven.

## Overview

The offline package is automatically generated and uploaded to multiple locations on every build, making it easily accessible for users without requiring them to navigate through GitHub Actions artifacts.

## Upload Locations

### 1. Repository Branch (`offline-releases`)

**Purpose**: Continuous availability of the latest build

**Workflow**: `.github/workflows/upload-pages-artifact.yml`

**Trigger**: Every push to `main`, `feature-*`, or `hotfix-*` branches

**Process**:

1. Build the offline package with relative paths
2. Create/update the `offline-releases` orphan branch
3. Upload the `.tar.gz` and `.zip` packages
4. Generate an `index.html` for easy browsing
5. Push to the branch

**Access**:

- Branch: <https://github.com/aurorae-haven/aurorae-haven/tree/offline-releases>
- Direct download (tar.gz): `https://github.com/aurorae-haven/aurorae-haven/raw/offline-releases/aurorae-haven-offline-v{VERSION}.tar.gz`
- Direct download (zip): `https://github.com/aurorae-haven/aurorae-haven/raw/offline-releases/aurorae-haven-offline-v{VERSION}.zip`

**Benefits**:

- Always available (no expiration)
- Latest build from main branch
- Easy to access and download
- Includes simple HTML interface

### 2. GitHub Releases

**Purpose**: Versioned, stable releases with changelogs

**Workflow**: `.github/workflows/release-offline-package.yml`

**Trigger**:

- Automatic: Push to version tags (e.g., `v1.0.0`, `v1.1.0`)
- Manual: `workflow_dispatch` (builds package but skips release creation)

**Process**:

1. Build the offline package
2. Extract version from package name
3. Create GitHub Release with tag (only when triggered by version tag)
4. Attach `.tar.gz` and `.zip` as release assets
5. Generate release notes with installation instructions

**Note**: Manual workflow runs (`workflow_dispatch`) will build the package successfully but skip release creation. This is useful for testing the build process without creating a release.

**Access**:

- Releases page: <https://github.com/aurorae-haven/aurorae-haven/releases>

**Benefits**:

- Versioned and tagged
- Includes changelog
- Professional release presentation
- Permanent availability

### 3. GitHub Actions Artifacts

**Purpose**: Development builds and CI/CD testing

**Workflow**: `.github/workflows/upload-pages-artifact.yml`

**Trigger**: Every workflow run

**Process**:

1. Build the offline package
2. Upload as workflow artifact
3. Retain for 90 days

**Access**:

- Actions page → Workflow run → Artifacts section

**Benefits**:

- Includes all development builds
- Useful for testing
- Automatic cleanup after 90 days

## Implementation Details

### Offline Package Creation

The offline package is built using `scripts/create-offline-package.js`:

```bash
npm run build:offline
```

**Build Process**:

1. Clean previous builds
2. Build with Vite using relative paths (`VITE_BASE_URL='./'`)
3. Generate PWA assets (service worker, manifest)
4. Create `.tar.gz` and '.zip` archive
5. Output to `dist-offline/` directory

**Package Contents**:

- `index.html` - Main entry point
- `assets/` - JavaScript bundles and CSS
- `sw.js` - Service worker
- `manifest.webmanifest` - PWA manifest
- `icons/` - App icons
- `404.html` - Fallback page

### Branch Upload Implementation

The upload to `offline-releases` branch uses git commands:

```bash
# Configure git
git config --global user.name "github-actions[bot]"
git config --global user.email "github-actions[bot]@users.noreply.github.com"

# Create or checkout orphan branch
git fetch origin offline-releases:offline-releases || git checkout --orphan offline-releases
git checkout offline-releases

# Clean and upload new package
git rm -rf .
cp package.tar.gz .
cp package.zip .
cat > index.html <<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Offline Package Download</title>
</head>
<body>
  <h1>Download Offline Package</h1>
  <p>
    <a href="package.tar.gz" download>Click here to download the latest offline package (tarball)</a>
    <a href="package.zip" download>Click here to download the latest offline package (zip)</a>

  </p>
</body>
</html>
EOF

# Commit and push
git add .
git commit -m "Update offline package"
git push -f origin offline-releases
```

**Why orphan branch?**

- No history from main branch
- Keeps repository size small
- Clear separation of concerns

### Release Creation Implementation

The release workflow uses `softprops/action-gh-release@v2`:

```yaml
- name: Create Release
  uses: softprops/action-gh-release@v2
  with:
    files:
      - dist-offline/*.tar.gz
      - dist-offline/*.zip
    tag_name: ${{ github.ref_name }}
    name: Aurorae Haven v${{ steps.package.outputs.version }}
    body: |
      # Release notes markdown
    draft: false
    prerelease: false
```

## Usage Examples

### For End Users

**Download latest build:**

```bash
# Set version (check offline-releases branch for available versions)
VERSION="1.0.0"  # Replace with actual version

# From offline-releases branch
wget https://github.com/aurorae-haven/aurorae-haven/raw/offline-releases/aurorae-haven-offline-v${VERSION}.tar.gz
# or
wget https://github.com/aurorae-haven/aurorae-haven/raw/offline-releases/aurorae-haven-offline-v${VERSION}.zip

# Extract
tar -xzf aurorae-haven-offline-v${VERSION}.tar.gz
# or
unzip aurorae-haven-offline-v${VERSION}.zip

# Open in browser
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

**Download stable release:**

1. Visit <https://github.com/aurorae-haven/aurorae-haven/releases>
2. Click on the latest release
3. Download the `.tar.gz` file under "Assets"
4. Download the `.zip` file under "Assets"

### For Developers

**Create a new release:**

```bash
# Tag a new version
git tag v1.1.0
git push origin v1.1.0

# Workflow automatically:
# 1. Builds offline package
# 2. Creates GitHub Release
# 3. Attaches package as asset
```

**Test locally:**

```bash
# Build offline package
npm run build:offline

# Package is in dist-offline/
ls -lh dist-offline/
```

## Troubleshooting

### Branch upload fails

**Symptom**: Workflow fails at "Upload offline package to repository branch"

**Possible causes**:

- Insufficient permissions (needs `contents: write`)
- Branch protection rules blocking force push
- Git configuration issues

**Solution**:

- Check workflow permissions in `.github/workflows/upload-pages-artifact.yml`
- Ensure `GITHUB_TOKEN` has write access
- Verify no branch protection on `offline-releases`

### Release not created

**Symptom**: Tag pushed but no release created

**Possible causes**:

- Tag name doesn't match pattern (`v*.*.*`)
- Workflow permissions insufficient
- Build failed

**Solution**:

- Verify tag format: `v1.0.0`, `v1.2.3`, etc.
- Check workflow run logs
- Ensure `contents: write` permission

### Package not found

**Symptom**: "No offline package found!" error

**Possible causes**:

- Build failed before package creation
- `dist-offline/` directory empty
- Package script error

**Solution**:

- Check build logs
- Verify `npm run build:offline` works locally
- Review `scripts/create-offline-package.js` for errors

### Cannot upload assets to immutable release

**Symptom**: "Cannot upload assets to an immutable release" error

**Possible causes**:

- Workflow manually triggered from a branch/tag that already has a release
- Trying to update an existing release that is immutable

**Solution**:

- The workflow now automatically skips release creation when not triggered by a version tag
- To create a new release, push a version tag: `git tag v1.0.1 && git push origin v1.0.1`
- Manual workflow runs (`workflow_dispatch`) will build the package but skip release creation
- This is expected behavior and not an error

## Maintenance

### Updating the workflow

When modifying the workflows:

1. **Test locally first**:

   ```bash
   npm run build:offline
   ```

2. **Validate YAML syntax**:

   ```bash
   npx yaml-lint .github/workflows/*.yml
   ```

3. **Validate with actionlint**:

   ```bash
   actionlint .github/workflows/*.yml
   ```

4. **Test in a feature branch** before merging to main

### Monitoring

**Check upload success**:

- Visit <https://github.com/aurorae-haven/aurorae-haven/tree/offline-releases>
- Verify package exists and timestamp is recent

**Check releases**:

- Visit <https://github.com/aurorae-haven/aurorae-haven/releases>
- Verify releases have attached assets

**Check artifacts**:

- Visit <https://github.com/aurorae-haven/aurorae-haven/actions>
- Click on recent workflow run
- Verify "offline-package" artifact exists

## Security Considerations

### Branch Protection

The `offline-releases` branch:

- Uses orphan branch (no shared history)
- Force push is required (updates replace entire branch)
- No sensitive data should be committed
- Public read access is safe (contains only built artifacts)

### Release Security

- Releases are created by GitHub Actions bot
- Packages are built in CI/CD environment
- No manual uploads required
- All changes tracked in git history

### Package Integrity

- Packages do not currently include checksums in release notes
- For integrity assurance, users may review the workflow logs to confirm the package was built and published by the automated CI/CD process.
- All build steps are transparent in workflow logs

## Future Improvements

Potential enhancements:

1. **Package signing**: GPG-sign packages for integrity verification
2. **Checksums file**: Generate and upload SHA256 checksums
3. **CDN hosting**: Mirror packages on a CDN for faster downloads
4. **Changelog automation**: Auto-generate changelogs from commits
5. **Size tracking**: Monitor package size over time

## Related Documentation

- [Offline Download Guide](./OFFLINE-DOWNLOAD.md) - User-facing download instructions
- [Deployment Architecture](./ARC-APP-COMPLIANCE.md) - Full CI/CD documentation
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute

## References

- [GitHub Actions: Upload Artifact](https://github.com/actions/upload-artifact)
- [GitHub Actions: Create Release](https://github.com/softprops/action-gh-release)
- [Git Orphan Branches](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnewbranchgt)

---

**Implemented in**: v1.0.0
