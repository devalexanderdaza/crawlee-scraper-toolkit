# Fix GitHub Release Asset Conflict

## Problem
The semantic-release CI/CD pipeline was failing with the error:
```
{"resource":"ReleaseAsset","code":"already_exists","field":"name"}
```

This occurred when trying to upload documentation files as GitHub release assets. The issue was that multiple `index.html` files existed in different subdirectories of the `docs/` folder (e.g., `docs/index.html`, `docs/coverage/index.html`, `docs/coverage/lcov-report/index.html`, etc.), and GitHub treats all files with the same basename as duplicate assets.

## Root Cause
The original semantic-release configuration attempted to upload all files in `docs/**/*` as individual assets:

```json
{
  "path": "docs/**/*",
  "label": "Documentation"
}
```

When semantic-release processes this glob pattern, it uploads each file individually to GitHub Releases. Since GitHub uses only the basename for asset names (not the full path), multiple files named `index.html` caused conflicts.

## Solution
Changed the asset strategy from uploading individual files to creating a single compressed archive:

### 1. Updated semantic-release configuration (`.releaserc.json`)
```json
{
  "path": "docs-archive.tar.gz",
  "label": "Documentation Archive"
}
```

### 2. Modified CI/CD workflow (`.github/workflows/ci-cd.yml`)
Added a step to create the documentation archive before semantic-release:

```yaml
- name: 📦 Create documentation archive
  run: |
    cd docs
    tar -czf ../docs-archive.tar.gz .
    cd ..
    echo "📦 Documentation archive created: $(du -h docs-archive.tar.gz)"
```

### 3. Created packaging script (`scripts/package-docs.sh`)
Added a reusable script for local documentation packaging with:
- Automated documentation generation if needed
- Archive creation with compression
- Size and content reporting
- Error handling and validation

### 4. Added npm script
```json
"docs:package": "./scripts/package-docs.sh"
```

### 5. Updated .gitignore
Added patterns to exclude documentation archives from git:
```
# Documentation archives
docs-archive.tar.gz
*.docs.tar.gz
```

## Benefits
1. **Eliminates asset conflicts**: Single archive file prevents naming conflicts
2. **Smaller release assets**: Compressed archive is more efficient than multiple files
3. **Better download experience**: Users get complete documentation in one download
4. **Consistent naming**: Archive name is predictable and unique
5. **Local tooling**: Developers can package documentation locally for testing

## Usage
- **Local packaging**: `pnpm run docs:package`
- **CI/CD**: Automatic during release process
- **Download**: Single `.tar.gz` file in GitHub releases

## File Structure
```
docs-archive.tar.gz
├── index.html              # Main documentation
├── api/                    # API documentation  
├── coverage/               # Test coverage reports
└── html/                   # Generated HTML docs
```

This solution maintains all documentation functionality while eliminating the GitHub asset conflict error.
