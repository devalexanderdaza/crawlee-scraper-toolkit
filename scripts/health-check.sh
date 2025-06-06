#!/bin/bash

# CI/CD Health Check Script
# Verifies that all automation components are properly configured

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 CI/CD Configuration Health Check${NC}"
echo ""

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "  ✅ $1"
        return 0
    else
        echo -e "  ❌ $1 (missing)"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "  ✅ $1/"
        return 0
    else
        echo -e "  ❌ $1/ (missing)"
        return 1
    fi
}

# Function to check npm script exists
check_script() {
    if node -p "require('./package.json').scripts['$1']" >/dev/null 2>&1; then
        echo -e "  ✅ npm script: $1"
        return 0
    else
        echo -e "  ❌ npm script: $1 (missing)"
        return 1
    fi
}

# Track issues
ISSUES=0

echo -e "${BLUE}📋 Configuration Files${NC}"
check_file "package.json" || ISSUES=$((ISSUES+1))
check_file ".releaserc.json" || ISSUES=$((ISSUES+1))
check_file ".commitlintrc.json" || ISSUES=$((ISSUES+1))
check_file "tsconfig.json" || ISSUES=$((ISSUES+1))
check_file "jest.config.js" || ISSUES=$((ISSUES+1))
echo ""

echo -e "${BLUE}🚀 GitHub Workflows${NC}"
check_dir ".github/workflows" || ISSUES=$((ISSUES+1))
check_file ".github/workflows/ci-cd.yml" || ISSUES=$((ISSUES+1))
check_file ".github/workflows/docs.yml" || ISSUES=$((ISSUES+1))
check_file ".github/workflows/release-preview.yml" || ISSUES=$((ISSUES+1))
echo ""

echo -e "${BLUE}📜 Scripts${NC}"
check_dir "scripts" || ISSUES=$((ISSUES+1))
check_file "scripts/build.sh" || ISSUES=$((ISSUES+1))
check_file "scripts/docs.sh" || ISSUES=$((ISSUES+1))
check_file "scripts/changelog.sh" || ISSUES=$((ISSUES+1))
check_file "scripts/release.sh" || ISSUES=$((ISSUES+1))
echo ""

echo -e "${BLUE}📚 Documentation${NC}"
check_dir "docs" || ISSUES=$((ISSUES+1))
check_file "docs/RELEASE.md" || ISSUES=$((ISSUES+1))
check_file "README.md" || ISSUES=$((ISSUES+1))
echo ""

echo -e "${BLUE}📦 NPM Scripts${NC}"
check_script "build" || ISSUES=$((ISSUES+1))
check_script "test" || ISSUES=$((ISSUES+1))
check_script "lint" || ISSUES=$((ISSUES+1))
check_script "docs:build" || ISSUES=$((ISSUES+1))
check_script "release" || ISSUES=$((ISSUES+1))
check_script "release:analyze" || ISSUES=$((ISSUES+1))
check_script "release:dry" || ISSUES=$((ISSUES+1))
check_script "release:dry-full" || ISSUES=$((ISSUES+1))
check_script "changelog" || ISSUES=$((ISSUES+1))
echo ""

echo -e "${BLUE}🔧 Dependencies${NC}"
if node -p "require('./package.json').devDependencies['semantic-release']" >/dev/null 2>&1; then
    echo -e "  ✅ semantic-release"
else
    echo -e "  ❌ semantic-release (missing)"
    ISSUES=$((ISSUES+1))
fi

if node -p "require('./package.json').devDependencies['@commitlint/cli']" >/dev/null 2>&1; then
    echo -e "  ✅ @commitlint/cli"
else
    echo -e "  ❌ @commitlint/cli (missing)"
    ISSUES=$((ISSUES+1))
fi

if node -p "require('./package.json').devDependencies['husky']" >/dev/null 2>&1; then
    echo -e "  ✅ husky"
else
    echo -e "  ❌ husky (missing)"
    ISSUES=$((ISSUES+1))
fi

if node -p "require('./package.json').devDependencies['conventional-changelog-cli']" >/dev/null 2>&1; then
    echo -e "  ✅ conventional-changelog-cli"
else
    echo -e "  ❌ conventional-changelog-cli (missing)"
    ISSUES=$((ISSUES+1))
fi
echo ""

echo -e "${BLUE}🪝 Git Hooks${NC}"
check_file ".husky/pre-commit" || ISSUES=$((ISSUES+1))
check_file ".husky/commit-msg" || ISSUES=$((ISSUES+1))
echo ""

echo -e "${BLUE}🎯 Semantic Release Configuration${NC}"
if node -p "require('./.releaserc.json').branches.includes('main')" >/dev/null 2>&1; then
    echo -e "  ✅ main branch configured"
else
    echo -e "  ❌ main branch not configured"
    ISSUES=$((ISSUES+1))
fi

if node -p "require('./.releaserc.json').plugins.some(p => p === '@semantic-release/npm' || (Array.isArray(p) && p[0] === '@semantic-release/npm'))" >/dev/null 2>&1; then
    echo -e "  ✅ npm plugin configured"
else
    echo -e "  ❌ npm plugin not configured"
    ISSUES=$((ISSUES+1))
fi

if node -p "require('./.releaserc.json').plugins.some(p => p === '@semantic-release/github' || (Array.isArray(p) && p[0] === '@semantic-release/github'))" >/dev/null 2>&1; then
    echo -e "  ✅ github plugin configured"
else
    echo -e "  ❌ github plugin not configured"
    ISSUES=$((ISSUES+1))
fi
echo ""

echo -e "${BLUE}🧪 Functional Tests${NC}"
echo -e "  🔍 Testing release analysis..."
if pnpm run release:analyze >/dev/null 2>&1; then
    echo -e "  ✅ release analysis works"
else
    echo -e "  ❌ release analysis failed"
    ISSUES=$((ISSUES+1))
fi

echo -e "  🔍 Testing release dry-run..."
# Note: This will fail locally due to git permissions, but succeeds in CI/CD
if pnpm run release:dry 2>&1 | grep -q "EGITNOPERMISSION"; then
    echo -e "  ⚠️  semantic-release dry-run: Git permission expected (normal in local env)"
elif pnpm run release:dry >/dev/null 2>&1; then
    echo -e "  ✅ semantic-release dry-run works"
else
    echo -e "  ❌ semantic-release dry-run failed (unexpected error)"
    ISSUES=$((ISSUES+1))
fi

echo -e "  🔍 Testing changelog generation..."
if pnpm run changelog >/dev/null 2>&1; then
    echo -e "  ✅ changelog generation works"
else
    echo -e "  ❌ changelog generation failed"
    ISSUES=$((ISSUES+1))
fi

echo -e "  🔍 Testing documentation build..."
if pnpm run docs:build >/dev/null 2>&1; then
    echo -e "  ✅ documentation build works"
else
    echo -e "  ❌ documentation build failed"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Summary
echo -e "${BLUE}📊 Health Check Summary${NC}"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! CI/CD automation is properly configured.${NC}"
    echo ""
    echo -e "${BLUE}🚀 Ready for automated releases!${NC}"
    echo "To trigger a release:"
    echo "  1. Make changes with conventional commits"
    echo "  2. Push to main branch"
    echo "  3. CI/CD will handle the rest automatically"
else
    echo -e "${RED}❌ Found $ISSUES issues that need to be resolved.${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Next steps:${NC}"
    echo "  1. Fix the issues listed above"
    echo "  2. Run this script again to verify"
    echo "  3. Test the release process with: pnpm run release:analyze"
    exit 1
fi

echo ""
echo -e "${BLUE}💡 Release Command Guide:${NC}"
echo -e "  ${GREEN}For Development (Local):${NC}"
echo "    pnpm run release:analyze    # Fast offline analysis ⚡"
echo "    pnpm run release:dry        # Safe simulation (no auth needed) 🛡️"
echo ""
echo -e "  ${YELLOW}For Testing (Optional Auth):${NC}"
echo "    pnpm run release:dry-full   # Full simulation (may need auth) 🔍"
echo ""
echo -e "  ${CYAN}For CI/CD (GitHub Actions):${NC}"
echo "    pnpm run release:preview    # CI-based preview 🔄"
echo "    pnpm run release            # Actual release 🚀"
echo ""
echo -e "${BLUE}🔒 Additional Checks:${NC}"
echo "  - Ensure GITHUB_TOKEN has proper permissions in CI"
echo "  - Verify NPM_TOKEN is configured in repository secrets"
echo "  - Test with conventional commits (feat:, fix:, etc.)"
echo "  - Monitor first automated release closely"
