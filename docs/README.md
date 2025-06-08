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
