# Merge Resolution Guide for feature-routine_tab → main

## Problem

The `feature-routine_tab` branch was created with grafted commits (unrelated history to `main`), causing Git to refuse merging with the error:

```text
fatal: refusing to merge unrelated histories
```

## Solution

Use the `--allow-unrelated-histories` flag when merging. This allows Git to merge branches that don't share a common ancestor.

## Merge Steps

### Option 1: Command Line (Local)

```bash
# Checkout main branch
git checkout main

# Merge with allow-unrelated-histories flag
git merge --allow-unrelated-histories feature-routine_tab

# Resolve conflicts (52 files)
# For most conflicts, accept the feature-routine_tab version (theirs)
git checkout --theirs <conflicted-file>
git add <conflicted-file>

# Or resolve all conflicts by accepting feature-routine_tab version:
for file in $(git diff --name-only --diff-filter=U); do
  git checkout --theirs "$file"
  git add "$file"
done

# Commit the merge
git commit -m "Merge feature-routine_tab into main"

# Push to remote
git push origin main
```

### Option 2: GitHub Web Interface

Unfortunately, GitHub's web interface doesn't provide an option to use `--allow-unrelated-histories`. You'll need to:

1. Perform the merge locally using the command line steps above
2. Push the merged result to GitHub

### Option 3: GitHub CLI

```bash
# Fetch the latest changes
gh repo sync

# Checkout main and merge
git checkout main
git merge --allow-unrelated-histories feature-routine_tab

# Resolve conflicts and commit
# (follow steps from Option 1)

# Push
git push origin main
```

## Conflict Summary

When merging with `--allow-unrelated-histories`, there are **52 merge conflicts** to resolve:

### Conflict Categories

1. **Configuration Files (7)**: .github/\*, .gitignore, .markdownlint.json
2. **Documentation (11)**: CONTRIBUTING.md, README.md, docs/\*
3. **Build Configuration (6)**: eslint.config.js, package.json, etc.
4. **Source Files (15)**: src/components/_, src/pages/_, src/utils/\*
5. **Test Files (11)**: src/**tests**/\*
6. **Other (2)**: Scripts and public files

### Recommended Resolution Strategy

For most files, accept the **feature-routine_tab version** (`--theirs`) because:

- It represents the newer development work
- It includes all the routine functionality
- It has updated dependencies and configurations
- All conflicts are "add/add" type (both branches independently created similar files)

### Files Requiring Manual Review

These files might need manual merge consideration:

- `package.json` and `package-lock.json` - Check for dependency conflicts
- Configuration files (.eslintrc, jest.config, etc.) - Ensure settings are compatible
- GitHub workflows - Verify CI/CD configurations work together

## Testing After Merge

After completing the merge, run:

```bash
# Install dependencies
npm install

# Run linters
npm run lint
npm run lint:md
npm run lint:css

# Run tests
npm test

# Build the project
npm run build

# Test the build
npm run test:offline
```

## Verification

The merge has been tested successfully on a test branch (`merge-work`). The merge commit is `934e8b5`.

You can inspect the merge result:

```bash
git show 934e8b5
```

## Questions?

If you need assistance with the merge process, please comment on this PR.
