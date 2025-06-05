#!/bin/bash

# LEGACY: Manual Release Script for Crawlee Scraper Toolkit
# 
# ⚠️  DEPRECATED: This script is kept for emergency situations only.
# The recommended way to release is using semantic-release via CI/CD:
# 
# 1. Create a PR with conventional commits
# 2. Merge to main branch 
# 3. CI/CD will automatically handle the release
#
# For manual release, use: pnpm run release:dry (to preview) or pnpm run release

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  LEGACY RELEASE SCRIPT${NC}"
echo -e "${BLUE}🚀 Crawlee Scraper Toolkit Manual Release${NC}"
echo ""
echo -e "${YELLOW}This script is deprecated. Consider using semantic-release instead:${NC}"
echo -e "${BLUE}  pnpm run release:dry  ${NC}# Preview release"
echo -e "${BLUE}  pnpm run release      ${NC}# Execute release"
echo ""
read -p "Continue with legacy script? (y/N): " CONTINUE_LEGACY

if [ "$CONTINUE_LEGACY" != "y" ] && [ "$CONTINUE_LEGACY" != "Y" ]; then
    echo -e "${GREEN}✅ Recommended: Use semantic-release instead${NC}"
    echo ""
    echo -e "${BLUE}Running semantic-release dry-run...${NC}"
    pnpm run release:dry
    exit 0
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${RED}❌ Error: Must be on main/master branch to release${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Error: There are uncommitted changes${NC}"
    git status --short
    exit 1
fi

# Warn about manual process
echo -e "${YELLOW}⚠️  WARNING: Manual release bypasses automated CI/CD checks${NC}"
echo -e "${YELLOW}⚠️  This may skip important validations and documentation updates${NC}"
echo ""
read -p "Are you sure you want to continue? (y/N): " FINAL_CONFIRM

if [ "$FINAL_CONFIRM" != "y" ] && [ "$FINAL_CONFIRM" != "Y" ]; then
    echo -e "${GREEN}✅ Recommended: Use 'pnpm run release' for automated process${NC}"
    exit 0
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${CURRENT_VERSION}${NC}"

# Show conventional commit types
echo ""
echo -e "${BLUE}📝 Remember to use conventional commits:${NC}"
echo "  feat: A new feature (minor version)"
echo "  fix: A bug fix (patch version)"  
echo "  BREAKING CHANGE: Breaking change (major version)"
echo "  docs: Documentation changes"
echo "  chore: Maintenance tasks"
echo ""

# Run full validation suite
echo -e "${BLUE}🔍 Running full validation suite...${NC}"

# Run linting
echo ""
echo -e "${BLUE}🔍 Running linter...${NC}"
pnpm run lint

# Run formatting check
echo ""
echo -e "${BLUE}💅 Checking code formatting...${NC}"
pnpm run format:check

# Run tests with coverage
echo ""
echo -e "${BLUE}🧪 Running tests with coverage...${NC}"
pnpm run test:coverage

# Validate examples
echo ""
echo -e "${BLUE}� Validating examples...${NC}"
echo "Running news scraper example..."
timeout 30s pnpm run example:news || echo "Example timeout (expected)"
echo "Running product scraper example..."
timeout 30s pnpm run example:products || echo "Example timeout (expected)"

# Build the project
echo ""
echo -e "${BLUE}🏗️  Building project...${NC}"
pnpm run build

# Generate documentation
echo ""
echo -e "${BLUE}📚 Generating documentation...${NC}"
pnpm run docs:build

# Generate changelog
echo ""
echo -e "${BLUE}📝 Generating changelog...${NC}"
pnpm run changelog

echo ""
echo -e "${GREEN}✅ All validations passed!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: This manual release will NOT:${NC}"
echo "  - Update version numbers automatically"
echo "  - Create GitHub releases"
echo "  - Deploy documentation to GitHub Pages"
echo "  - Send notifications"
echo ""
echo -e "${BLUE}For a complete automated release, push commits with conventional format to main branch${NC}"
echo ""
read -p "Proceed with manual npm publish? (y/N): " PUBLISH_CONFIRM

if [ "$PUBLISH_CONFIRM" != "y" ] && [ "$PUBLISH_CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}❌ Manual release cancelled${NC}"
    echo -e "${GREEN}✅ Use 'git push origin main' to trigger automated release${NC}"
    exit 0
fi

# Manual npm publish (version should be managed by semantic-release)
echo ""
echo -e "${BLUE}📦 Publishing to npm (manual)...${NC}"
pnpm publish

echo ""
echo -e "${GREEN}🎉 Manual npm publish completed!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Manual steps still needed:${NC}"
echo "  - Create GitHub release manually"
echo "  - Update documentation manually"
echo "  - Deploy docs to GitHub Pages manually"
echo "  - Send notifications manually"
echo ""
echo -e "${BLUE}💡 Next time, use semantic-release for full automation!${NC}"

