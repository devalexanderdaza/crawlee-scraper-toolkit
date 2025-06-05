#!/bin/bash

# Release script for Crawlee Scraper Toolkit

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Crawlee Scraper Toolkit Release Script${NC}"
echo ""

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

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}Current version: ${CURRENT_VERSION}${NC}"

# Ask for new version
echo ""
echo -e "${YELLOW}Select release type:${NC}"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"
echo "3) major (breaking changes)"
echo "4) custom version"
echo ""
read -p "Enter choice (1-4): " CHOICE

case $CHOICE in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version: " CUSTOM_VERSION
        VERSION_TYPE="--new-version $CUSTOM_VERSION"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Run tests
echo ""
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test

# Run linting
echo ""
echo -e "${BLUE}🔍 Running linter...${NC}"
npm run lint

# Build the project
echo ""
echo -e "${BLUE}🏗️  Building project...${NC}"
npm run build

# Bump version
echo ""
echo -e "${BLUE}📈 Bumping version...${NC}"
if [ "$CHOICE" = "4" ]; then
    npm version $CUSTOM_VERSION --no-git-tag-version
else
    npm version $VERSION_TYPE --no-git-tag-version
fi

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✅ Version bumped to: ${NEW_VERSION}${NC}"

# Update changelog
echo ""
echo -e "${BLUE}📝 Updating changelog...${NC}"
# Note: In a real project, you might want to use a tool like conventional-changelog
echo "Please update CHANGELOG.md with the new version changes."
read -p "Press Enter when changelog is updated..."

# Commit changes
echo ""
echo -e "${BLUE}💾 Committing changes...${NC}"
git add package.json CHANGELOG.md
git commit -m "chore: bump version to ${NEW_VERSION}"

# Create tag
echo ""
echo -e "${BLUE}🏷️  Creating tag...${NC}"
git tag -a "v${NEW_VERSION}" -m "Release version ${NEW_VERSION}"

# Ask for confirmation before publishing
echo ""
echo -e "${YELLOW}⚠️  Ready to publish version ${NEW_VERSION}${NC}"
echo "This will:"
echo "  - Push commits and tags to remote"
echo "  - Publish to npm registry"
echo ""
read -p "Continue? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}❌ Release cancelled${NC}"
    exit 0
fi

# Push to remote
echo ""
echo -e "${BLUE}📤 Pushing to remote...${NC}"
git push origin main
git push origin "v${NEW_VERSION}"

# Publish to npm
echo ""
echo -e "${BLUE}📦 Publishing to npm...${NC}"
npm publish

echo ""
echo -e "${GREEN}🎉 Successfully released version ${NEW_VERSION}!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  - Create GitHub release with release notes"
echo "  - Update documentation if needed"
echo "  - Announce the release"

