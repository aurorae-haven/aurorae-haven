#!/bin/bash
# Automated merge script for feature-routine_tab → main
# This script merges the feature-routine_tab branch into main using --allow-unrelated-histories
# and automatically resolves conflicts by accepting the feature-routine_tab version

set -e  # Exit on error

echo "=========================================="
echo "Merge Script: feature-routine_tab → main"
echo "=========================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Check if main branch exists
if ! git rev-parse --verify main > /dev/null 2>&1; then
    echo "Error: main branch does not exist"
    exit 1
fi

# Check if feature-routine_tab branch exists
if ! git rev-parse --verify feature-routine_tab > /dev/null 2>&1; then
    echo "Error: feature-routine_tab branch does not exist"
    echo "Fetching from remote..."
    git fetch origin feature-routine_tab:feature-routine_tab || {
        echo "Error: Could not fetch feature-routine_tab from remote"
        exit 1
    }
fi

# Confirm with user
echo "This script will:"
echo "1. Checkout the main branch"
echo "2. Merge feature-routine_tab using --allow-unrelated-histories"
echo "3. Automatically resolve all conflicts by accepting feature-routine_tab version"
echo "4. Commit the merge"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Merge cancelled"
    exit 0
fi

echo ""
echo "Step 1: Checking out main branch..."
git checkout main

echo ""
echo "Step 2: Starting merge with --allow-unrelated-histories..."
if git merge --no-commit --no-ff --allow-unrelated-histories feature-routine_tab; then
    echo "Merge completed successfully without conflicts!"
else
    echo "Merge has conflicts (expected). Resolving..."
    
    echo ""
    echo "Step 3: Resolving conflicts..."
    
    # Get list of conflicted files
    conflicted_files=$(git diff --name-only --diff-filter=U)
    
    if [ -z "$conflicted_files" ]; then
        echo "No conflicts to resolve"
    else
        conflict_count=$(echo "$conflicted_files" | wc -l)
        echo "Found $conflict_count conflicted files"
        echo ""
        
        # Resolve each conflict by accepting theirs (feature-routine_tab)
        current=0
        while IFS= read -r file; do
            current=$((current + 1))
            echo "[$current/$conflict_count] Resolving: $file"
            git checkout --theirs "$file"
            git add "$file"
        done <<< "$conflicted_files"
        
        echo ""
        echo "All conflicts resolved!"
    fi
fi

echo ""
echo "Step 4: Committing merge..."

# Prepare commit message
commit_message="Merge feature-routine_tab into main using --allow-unrelated-histories

- Resolved merge conflicts automatically
- Accepted feature-routine_tab versions (newer development)
- All conflicts were add/add type from unrelated histories

This merge brings in the routine functionality and all related updates."

git commit -m "$commit_message"

echo ""
echo "=========================================="
echo "Merge completed successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the merge with: git show HEAD"
echo "2. Run tests: npm test"
echo "3. Run linters: npm run lint"
echo "4. Build project: npm run build"
echo "5. If everything looks good: git push origin main"
echo ""
