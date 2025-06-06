#!/bin/bash

# Local Release Analysis Script
# Analyzes commits to show what would be released without Git operations

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔍 Local Release Analysis${NC}"
echo ""

# Get last tag or initial commit
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -z "$LAST_TAG" ]; then
    echo -e "${YELLOW}No previous tags found. Analyzing all commits...${NC}"
    COMMITS=$(git log --oneline --pretty=format:"%h %s")
else
    echo -e "${BLUE}Analyzing commits since ${LAST_TAG}...${NC}"
    COMMITS=$(git log ${LAST_TAG}..HEAD --oneline --pretty=format:"%h %s")
fi

if [ -z "$COMMITS" ]; then
    echo -e "${YELLOW}No new commits found since last release.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}📋 Commits to analyze:${NC}"
echo "$COMMITS"
echo ""

# Initialize counters
FEAT_COUNT=0
FIX_COUNT=0
BREAKING_COUNT=0
DOCS_COUNT=0
OTHER_COUNT=0

# Analyze commits
while IFS= read -r commit; do
    if [[ $commit =~ ^[a-f0-9]+[[:space:]]+(feat|feature)(\(.+\))?(!)?:.*$ ]]; then
        if [[ $commit =~ ! ]]; then
            BREAKING_COUNT=$((BREAKING_COUNT + 1))
        else
            FEAT_COUNT=$((FEAT_COUNT + 1))
        fi
    elif [[ $commit =~ ^[a-f0-9]+[[:space:]]+fix(\(.+\))?:.*$ ]]; then
        FIX_COUNT=$((FIX_COUNT + 1))
    elif [[ $commit =~ ^[a-f0-9]+[[:space:]]+docs(\(.+\))?:.*$ ]]; then
        DOCS_COUNT=$((DOCS_COUNT + 1))
    elif [[ $commit =~ BREAKING[[:space:]]CHANGE ]]; then
        BREAKING_COUNT=$((BREAKING_COUNT + 1))
    else
        OTHER_COUNT=$((OTHER_COUNT + 1))
    fi
done <<< "$COMMITS"

# Determine version bump
if [ $BREAKING_COUNT -gt 0 ]; then
    RELEASE_TYPE="major"
    VERSION_IMPACT="🚨 MAJOR (breaking changes)"
elif [ $FEAT_COUNT -gt 0 ]; then
    RELEASE_TYPE="minor"
    VERSION_IMPACT="🚀 MINOR (new features)"
elif [ $FIX_COUNT -gt 0 ] || [ $DOCS_COUNT -gt 0 ]; then
    RELEASE_TYPE="patch"
    VERSION_IMPACT="🔧 PATCH (fixes/docs)"
else
    RELEASE_TYPE="none"
    VERSION_IMPACT="❌ NO RELEASE (no significant changes)"
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0")

# Calculate next version (simplified)
IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $RELEASE_TYPE in
    "major")
        NEXT_VERSION="$((MAJOR + 1)).0.0"
        ;;
    "minor")
        NEXT_VERSION="${MAJOR}.$((MINOR + 1)).0"
        ;;
    "patch")
        NEXT_VERSION="${MAJOR}.${MINOR}.$((PATCH + 1))"
        ;;
    *)
        NEXT_VERSION="$CURRENT_VERSION"
        ;;
esac

echo -e "${BLUE}📊 Release Analysis Results:${NC}"
echo ""
echo -e "  Current Version: ${CURRENT_VERSION}"
echo -e "  Next Version: ${NEXT_VERSION}"
echo -e "  Release Type: ${VERSION_IMPACT}"
echo ""
echo -e "${BLUE}📋 Commit Summary:${NC}"
echo -e "  🚀 Features: ${FEAT_COUNT}"
echo -e "  🐛 Fixes: ${FIX_COUNT}"
echo -e "  💥 Breaking: ${BREAKING_COUNT}"
echo -e "  📚 Docs: ${DOCS_COUNT}"
echo -e "  🔧 Other: ${OTHER_COUNT}"
echo ""

if [ "$RELEASE_TYPE" != "none" ]; then
    echo -e "${GREEN}✅ A ${RELEASE_TYPE} release would be triggered!${NC}"
    echo ""
    echo -e "${BLUE}🚀 What would happen in CI/CD:${NC}"
    echo "  1. Version bump: ${CURRENT_VERSION} → ${NEXT_VERSION}"
    echo "  2. Generate changelog with commit details"
    echo "  3. Create GitHub release with notes"
    echo "  4. Publish to npm registry"
    echo "  5. Deploy documentation to GitHub Pages"
    echo "  6. Send success notifications"
else
    echo -e "${YELLOW}⚠️  No release would be triggered.${NC}"
    echo ""
    echo -e "${BLUE}💡 To trigger a release, make commits with:${NC}"
    echo "  feat: new feature (minor release)"
    echo "  fix: bug fix (patch release)"
    echo "  feat!: breaking change (major release)"
fi

echo ""
echo -e "${BLUE}💡 Note: This is a local analysis. The actual semantic-release${NC}"
echo -e "${BLUE}   process in CI/CD will be more comprehensive and accurate.${NC}"
