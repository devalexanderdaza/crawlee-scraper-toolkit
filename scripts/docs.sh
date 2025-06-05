#!/bin/bash

# Documentation Generation Script for Crawlee Scraper Toolkit
# This script generates comprehensive documentation including:
# - API documentation with TypeDoc
# - Code coverage reports
# - Example documentation
# - Development guides

set -e

echo "🚀 Starting documentation generation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create docs directory if it doesn't exist
mkdir -p docs

echo -e "${BLUE}📚 Generating API documentation with TypeDoc...${NC}"
pnpm run docs

echo -e "${BLUE}📊 Generating test coverage report...${NC}"
pnpm run test:coverage

# Copy coverage report to docs
if [ -d "coverage" ]; then
    echo -e "${BLUE}📋 Copying coverage report to docs...${NC}"
    cp -r coverage docs/
fi

echo -e "${BLUE}📝 Generating HTML documentation...${NC}"
pnpm run docs:html

echo -e "${BLUE}🔍 Generating JSON API documentation...${NC}"
pnpm run docs:json

# Create a comprehensive index page
echo -e "${BLUE}📄 Creating documentation index...${NC}"
cat > docs/README.md << 'EOF'
# Crawlee Scraper Toolkit - Documentation

Welcome to the comprehensive documentation for the Crawlee Scraper Toolkit.

## 📖 Documentation Sections

### 🔧 API Documentation
- **[API Reference (Markdown)](./api/README.md)** - Complete API documentation in Markdown format
- **[API Reference (HTML)](./html/index.html)** - Interactive HTML documentation
- **[API JSON](./api.json)** - Machine-readable API documentation

### 📊 Code Quality
- **[Test Coverage Report](./coverage/lcov-report/index.html)** - Code coverage analysis
- **[Coverage Summary](./coverage/coverage-summary.json)** - Coverage metrics

### 🚀 Getting Started
- **[Development Guide](../DEVELOPMENT.md)** - How to contribute and develop
- **[Configuration Guide](../CONFIGURATION_UPDATE.md)** - Configuration options
- **[Main README](../README.md)** - Project overview and quick start

### 💡 Examples
- **[Basic News Scraper](../examples/news-scraper.ts)** - Simple scraping example
- **[Advanced Product Scraper](../examples/advanced-product-scraper.ts)** - Complex scraping with plugins

## 🛠️ CLI Tools
The toolkit includes a powerful CLI for generating scrapers:

```bash
# Create a new scraper project
pnpm cli init my-scraper

# Generate a scraper definition
pnpm cli generate

# Validate configuration
pnpm cli validate config.json

# Run a scraper
pnpm cli run scraper-config.json
```

## 📦 Project Structure

```
crawlee-scraper-toolkit/
├── src/                    # Source code
│   ├── core/              # Core scraping engine
│   ├── cli/               # Command-line interface
│   ├── plugins/           # Plugin system
│   └── utils/             # Utility functions
├── examples/              # Usage examples
├── templates/             # Scraper templates
├── docs/                  # Generated documentation
└── tests/                 # Test suites
```

## 🔗 Quick Links

- [GitHub Repository](https://github.com/devalexanderdaza/crawlee-scraper-toolkit)
- [NPM Package](https://www.npmjs.com/package/crawlee-scraper-toolkit)
- [Issues & Bug Reports](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/issues)

---

*Documentation generated on $(date)*
EOF

# Generate examples documentation
echo -e "${BLUE}📚 Generating examples documentation...${NC}"
cat > docs/EXAMPLES.md << 'EOF'
# Examples Documentation

This document provides detailed explanations of the included examples.

## 🗞️ News Scraper Example

The news scraper demonstrates basic scraping functionality:

```typescript
// Basic configuration
const newsScraperDefinition: ScraperDefinition<string, NewsArticle> = {
  id: 'news-scraper',
  name: 'News Article Scraper',
  url: 'https://httpbin.org/html',
  navigation: { type: 'direct' },
  waitStrategy: { type: 'selector', config: { selector: 'body' } },
  parse: async (context) => {
    // Extract content
    return {
      title: await page.textContent('h1'),
      content: await page.textContent('p'),
      // ... more fields
    };
  }
};
```

**Key Features:**
- Simple URL navigation
- Content extraction
- Error handling
- TypeScript types

## 🛍️ Advanced Product Scraper Example

The product scraper shows advanced features:

```typescript
const productScraperDefinition: ScraperDefinition<string, ProductSearchResult> = {
  id: 'product-scraper',
  hooks: {
    beforeRequest: [/* custom hooks */],
    afterRequest: [/* cleanup hooks */],
    onError: [/* error handling */],
    onRetry: [/* retry logic */]
  },
  parse: async (context) => {
    // Complex data extraction
  }
};
```

**Advanced Features:**
- Plugin system (Retry, Cache, Metrics)
- Custom hooks
- Screenshot capture
- Performance metrics
- Complex data structures

## 🚀 Running Examples

```bash
# Run news scraper
pnpm run example:news

# Run product scraper
pnpm run example:products "search term"

# With custom parameters
pnpm run example:news "custom search"
```

## 🔧 Customization

Both examples can be customized by:
- Modifying the scraper definitions
- Adding custom hooks
- Changing URLs and selectors
- Adding validation logic
- Implementing custom plugins

EOF

# Create HTML documentation index
echo -e "${BLUE}🌐 Creating HTML documentation index...${NC}"
cp docs/docs-index.html docs/index.html

echo -e "${GREEN}✅ Documentation generation complete!${NC}"
echo ""
echo -e "${YELLOW}📖 Documentation available at:${NC}"
echo -e "  • API Docs: ${BLUE}docs/api/README.md${NC}"
echo -e "  • HTML Docs: ${BLUE}docs/html/index.html${NC}"
echo -e "  • Coverage: ${BLUE}docs/coverage/lcov-report/index.html${NC}"
echo -e "  • Index: ${BLUE}docs/README.md${NC}"
echo ""
echo -e "${YELLOW}🌐 To serve documentation locally:${NC}"
echo -e "  ${BLUE}pnpm run docs:serve${NC}"
echo ""
