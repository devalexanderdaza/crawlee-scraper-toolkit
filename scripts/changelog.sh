#!/bin/bash

# Changelog Generation Script for Crawlee Scraper Toolkit

set -e

echo "📝 Generating initial CHANGELOG.md..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if conventional-changelog is available
if ! command -v conventional-changelog &> /dev/null; then
    echo -e "${YELLOW}⚠️  conventional-changelog not found, using pnpm...${NC}"
    CHANGELOG_CMD="pnpm conventional-changelog"
else
    CHANGELOG_CMD="conventional-changelog"
fi

# Generate complete changelog
echo -e "${BLUE}🔄 Generating complete changelog from git history...${NC}"
$CHANGELOG_CMD -p conventionalcommits -i CHANGELOG.md -s -r 0

# If CHANGELOG.md doesn't exist or is empty, create a basic one
if [ ! -f "CHANGELOG.md" ] || [ ! -s "CHANGELOG.md" ]; then
    echo -e "${YELLOW}📝 Creating initial CHANGELOG.md...${NC}"
    cat > CHANGELOG.md << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Crawlee Scraper Toolkit
- TypeScript-first scraping framework with Crawlee and Playwright
- Maximum configurability with profiles and environment variables
- Plugin system with built-in plugins (Retry, Cache, Proxy, RateLimit, Metrics)
- CLI generator for interactive scraper creation
- Multiple navigation strategies (direct, form, API interception)
- Browser pool management with efficient resource allocation
- Built-in monitoring with metrics collection and logging
- Configurable retry logic with exponential backoff
- Optional result caching system
- Pre-built templates for common scraping scenarios
- Comprehensive TypeScript type definitions
- Automated testing with Jest and Playwright
- Complete documentation with TypeDoc
- CI/CD pipeline with semantic release
- GitHub Pages documentation deployment

### Features
- **🎯 TypeScript First**: Full TypeScript support with comprehensive type definitions
- **🔧 Maximum Configurability**: Flexible configuration system with profiles and environment variables
- **🔌 Plugin System**: Extensible architecture with built-in plugins for retry, caching, metrics, and more
- **🛠️ CLI Generator**: Interactive command-line tool to generate scraper templates
- **🌐 Multiple Navigation Strategies**: Support for direct navigation, form submission, and API interception
- **⚡ Browser Pool Management**: Efficient browser instance pooling and resource management
- **📊 Built-in Monitoring**: Metrics collection, logging, and error handling
- **🔄 Retry Logic**: Configurable retry strategies with exponential backoff
- **💾 Result Caching**: Optional caching system to avoid redundant requests
- **🎨 Multiple Templates**: Pre-built templates for common scraping scenarios

### Technical Details
- Node.js >= 20.0.0 requirement
- pnpm >= 8.0.0 package manager
- Modern TypeScript 5.5+ configuration
- Jest testing framework with Playwright
- ESLint + Prettier for code quality
- Husky + commitlint for git hooks
- Semantic Release for automated versioning
- TypeDoc for API documentation generation
- GitHub Actions for CI/CD pipeline

EOF
fi

echo -e "${GREEN}✅ CHANGELOG.md generated successfully!${NC}"
echo ""
echo -e "${BLUE}📖 You can now:${NC}"
echo -e "  • Review the generated changelog: ${YELLOW}cat CHANGELOG.md${NC}"
echo -e "  • Edit it manually if needed: ${YELLOW}nano CHANGELOG.md${NC}"
echo -e "  • Regenerate from git history: ${YELLOW}pnpm run changelog:all${NC}"
echo ""
