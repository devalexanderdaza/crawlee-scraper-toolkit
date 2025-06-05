# Crawlee Scraper Toolkit

A comprehensive TypeScript toolkit for building robust web scrapers with Crawlee, featuring maximum configurability, plugin system, and CLI generator.

## 🚀 Features

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

## 📦 Installation

```bash
npm install crawlee-scraper-toolkit
```

## 🏃 Quick Start

### 1. Initialize a New Project

```bash
npx crawlee-scraper init my-scraper-project
cd my-scraper-project
npm install
```

### 2. Generate Your First Scraper

```bash
npx crawlee-scraper generate
```

Follow the interactive prompts to configure your scraper.

### 3. Run the Scraper

```bash
npx crawlee-scraper run --scraper=my-scraper --input="search term"
```

## 🔧 Programmatic Usage

### Basic Example

```typescript
import { CrawleeScraperEngine, ScraperDefinition, configManager } from 'crawlee-scraper-toolkit';

// Define your scraper
const myScraper: ScraperDefinition<string, any> = {
  id: 'example-scraper',
  name: 'Example Scraper',
  url: 'https://example.com',
  navigation: { type: 'direct' },
  waitStrategy: { type: 'timeout', config: { duration: 2000 } },
  requiresCaptcha: false,
  parse: async (context) => {
    const { page } = context;
    const title = await page.textContent('h1');
    const description = await page.textContent('p');
    
    return {
      title,
      description,
      url: page.url(),
      timestamp: new Date().toISOString(),
    };
  },
};

// Initialize the engine
const engine = new CrawleeScraperEngine(
  configManager.getConfig(),
  configManager.getLogger()
);

// Register and execute
engine.register(myScraper);
const result = await engine.execute(myScraper, 'input-data');

console.log(result.data);
await engine.shutdown();
```

### Advanced Configuration

```typescript
import { createConfig, CrawleeScraperEngine, RetryPlugin, CachePlugin } from 'crawlee-scraper-toolkit';

// Build custom configuration
const config = createConfig()
  .browserPool({
    maxSize: 10,
    maxAge: 30 * 60 * 1000,
    launchOptions: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  })
  .defaultOptions({
    retries: 5,
    timeout: 60000,
    loadImages: false,
  })
  .logging({
    level: 'info',
    format: 'json',
  })
  .build();

// Create engine with custom config
const engine = new CrawleeScraperEngine(config, logger);

// Install plugins
engine.use(new RetryPlugin({ maxBackoffDelay: 30000 }));
engine.use(new CachePlugin({ defaultTtl: 10 * 60 * 1000 }));
```

## 📋 Scraper Templates

The toolkit includes several pre-built templates:

### Basic Template
Simple page scraping with configurable selectors.

### API Template
Intercepts API responses for data extraction.

### Form Template
Fills and submits forms to retrieve results.

### Advanced Template
Full-featured template with custom hooks and plugins.

## ⚙️ Configuration

### Configuration File

Create a `scraper.config.yaml` file:

```yaml
browserPool:
  maxSize: 5
  maxAge: 1800000  # 30 minutes
  launchOptions:
    headless: true
    args:
      - "--no-sandbox"
      - "--disable-setuid-sandbox"

defaultOptions:
  retries: 3
  timeout: 30000
  loadImages: false

logging:
  level: info
  format: text

profiles:
  development:
    name: development
    config:
      browserPool:
        maxSize: 2
      logging:
        level: debug
  
  production:
    name: production
    config:
      browserPool:
        maxSize: 10
      logging:
        level: error
```

### Environment Variables

```bash
BROWSER_POOL_SIZE=5
BROWSER_HEADLESS=true
SCRAPING_MAX_RETRIES=3
LOG_LEVEL=info
```

## 🔌 Plugins

### Built-in Plugins

- **RetryPlugin**: Exponential backoff retry logic
- **CachePlugin**: Result caching with TTL
- **ProxyPlugin**: Proxy rotation support
- **RateLimitPlugin**: Request rate limiting
- **MetricsPlugin**: Performance metrics collection

### Custom Plugins

```typescript
import { ScraperPlugin, ScraperEngine } from 'crawlee-scraper-toolkit';

class MyCustomPlugin implements ScraperPlugin {
  name = 'my-plugin';
  version = '1.0.0';

  install(scraper: ScraperEngine): void {
    scraper.addHook('beforeRequest', async (context) => {
      // Custom logic before each request
      console.log(`Processing: ${context.input}`);
    });
  }
}

engine.use(new MyCustomPlugin());
```

## 🎯 Navigation Strategies

### Direct Navigation
```typescript
navigation: {
  type: 'direct'
}
```

### Form Submission
```typescript
navigation: {
  type: 'form',
  config: {
    inputSelector: 'input[name="search"]',
    submitSelector: 'button[type="submit"]'
  }
}
```

### API Interception
```typescript
navigation: {
  type: 'api',
  config: {
    paramName: 'q'
  }
}
```

## ⏱️ Wait Strategies

### Wait for Selector
```typescript
waitStrategy: {
  type: 'selector',
  config: {
    selector: '.results'
  }
}
```

### Wait for Response
```typescript
waitStrategy: {
  type: 'response',
  config: {
    urlPattern: '/api/search'
  }
}
```

### Wait for Timeout
```typescript
waitStrategy: {
  type: 'timeout',
  config: {
    duration: 5000
  }
}
```

## 🎣 Hooks

Add custom logic at different stages of scraping:

```typescript
const scraper: ScraperDefinition = {
  // ... other config
  hooks: {
    beforeRequest: [
      async (context) => {
        // Set custom headers
        await context.page.setExtraHTTPHeaders({
          'X-Custom-Header': 'value'
        });
      }
    ],
    afterRequest: [
      async (context) => {
        // Save screenshot
        await context.page.screenshot({
          path: `screenshots/${context.input}.png`
        });
      }
    ],
    onError: [
      async (context) => {
        console.error('Scraping failed:', context.error);
      }
    ]
  }
};
```

## 📊 Monitoring and Metrics

```typescript
import { MetricsPlugin } from 'crawlee-scraper-toolkit';

const metricsPlugin = new MetricsPlugin();
engine.use(metricsPlugin);

// After scraping
const metrics = metricsPlugin.getMetrics();
console.log(`Success rate: ${metrics.successfulRequests / metrics.totalRequests * 100}%`);
```

## 🛠️ CLI Commands

### Generate Scraper
```bash
crawlee-scraper generate --template=basic --name=my-scraper
```

### Initialize Project
```bash
crawlee-scraper init --name=my-project --template=advanced
```

### Validate Configuration
```bash
crawlee-scraper validate --config=./config/scraper.yaml
```

### Run Scraper
```bash
crawlee-scraper run --scraper=my-scraper --input="search term" --profile=production
```

## 🔍 Examples

Check the `examples/` directory for complete working examples:

- Basic web scraping
- API data extraction
- Form-based scraping
- E-commerce product scraping
- News article extraction

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Crawlee](https://crawlee.dev/) and [Playwright](https://playwright.dev/)
- Inspired by the need for a more configurable and extensible scraping toolkit
- Thanks to all contributors and the open-source community

## 📞 Support

- 📖 [Documentation](https://github.com/yourusername/crawlee-scraper-toolkit/wiki)
- 🐛 [Issue Tracker](https://github.com/yourusername/crawlee-scraper-toolkit/issues)
- 💬 [Discussions](https://github.com/yourusername/crawlee-scraper-toolkit/discussions)

---

Made with ❤️ by the Crawlee Scraper Toolkit team

