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

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0 (recommended package manager)

### Install with pnpm (recommended)

```bash
pnpm add crawlee-scraper-toolkit
```

### Install with npm

```bash
npm install crawlee-scraper-toolkit
```

## 🏃 Quick Start

### 1. Initialize a New Project

```bash
pnpm dlx crawlee-scraper init my-scraper-project
cd my-scraper-project
pnpm install
```

### 2. Generate Your First Scraper

After initializing and installing dependencies, you can use the CLI bundled with the project:
```bash
pnpm crawlee-scraper generate
# or npx crawlee-scraper generate
```

Follow the interactive prompts to configure your scraper.

### 3. Run the Scraper

```bash
pnpm crawlee-scraper run --scraper=my-scraper --input="search term"
# or npx crawlee-scraper run --scraper=my-scraper --input="search term"
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
// const logger = configManager.getLogger(); // Assuming you want to use the logger from configManager
// Or, create a new logger instance if you have specific needs for this engine
const engine = new CrawleeScraperEngine(config, configManager.getLogger());

// Install plugins
engine.use(new RetryPlugin({ maxBackoffDelay: 30000 }));
engine.use(new CachePlugin({ defaultTtl: 10 * 60 * 1000 }));
```

## 📋 Scraper Templates

The toolkit includes several pre-built templates to get you started quickly:

### Basic Template
Ideal for simple page scraping tasks. Allows configuration of selectors to extract data from static or dynamically rendered pages.

### API Template
Designed for scenarios where data can be more reliably extracted by intercepting and processing API (e.g., JSON) responses triggered by website interactions.

### Form Template
Useful for scrapers that need to interact with forms. Provides a structure for filling input fields, submitting forms, and then extracting data from the results.

### Advanced Template
A comprehensive template that includes setup for custom hooks, plugins, and more complex configurations. Suitable for sophisticated scraping tasks requiring fine-grained control.

### Infinite Scroll Template
Handles pages with infinite scrolling pagination. Ideal for sites that load more content as the user scrolls.

### JS-Heavy Site Template
Provides a robust setup for sites that rely heavily on JavaScript for rendering content, focusing on advanced waitFor strategies and interaction patterns.

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
- **ProxyPlugin**: Proxy rotation support.
  - When a proxy is used (either through rotation logic activated by `useProxyRotation: true` or by directly setting `proxyUrl` in `ScraperExecutionOptions`), the engine now creates a temporary Playwright `BrowserContext` for that specific request.
  - This temporary context is configured with the specified proxy settings. A new page is then created within this context for the scraping task.
  - This approach ensures that proxy configurations are isolated to individual requests and do not interfere with the main browser pool or other concurrent operations. The temporary context and its page are closed after the request attempt, ensuring clean resource management.
  - The `proxyUrl` property in `ScraperExecutionOptions` is the key to enabling this behavior for a given execution.
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

The `crawlee-scraper` CLI provides several commands to manage your scraping projects.
These commands can be run using `pnpm crawlee-scraper <command>` or `npx crawlee-scraper <command>` if `crawlee-scraper-toolkit` is a project dependency (as shown in the Quick Start).
If you've installed `crawlee-scraper-toolkit` globally (e.g., `pnpm add -g crawlee-scraper-toolkit`), you can invoke the commands directly: `crawlee-scraper <command>`.
When installing from a local clone of this repository, run `pnpm install && pnpm run build` beforehand so the compiled CLI is generated with its path aliases properly resolved.
Alternatively, `pnpm dlx crawlee-scraper <command>` can be used to ensure you're executing the latest version of the CLI without local installation.

### Generate Scraper
```bash
pnpm crawlee-scraper generate --template=basic --name=my-scraper
```

### Initialize Project
```bash
pnpm dlx crawlee-scraper init --name=my-project --template=advanced
# (Using pnpm dlx for init is recommended to get the latest project scaffolder)
```

### Validate Configuration
```bash
pnpm crawlee-scraper validate --config=./config/scraper.yaml
```

### Run Scraper
```bash
pnpm crawlee-scraper run --scraper=my-scraper --input="search term" --profile=production
```

### Update Project Configurations (In Development)
```bash
pnpm crawlee-scraper update
```
Helps migrate existing project and scraper configurations to the latest version of the toolkit. This command is currently under development.

## 🔍 Examples

Check the `examples/` directory for complete working examples:

- Basic web scraping
- API data extraction
- Form-based scraping
- E-commerce product scraping
- News article extraction

## 📚 Documentation

Comprehensive documentation is available in multiple formats:

### 🔗 Quick Links
- **[📖 Complete API Documentation](./docs/api/README.md)** - Full API reference
- **[🌐 Interactive HTML Docs](./docs/html/index.html)** - Browse documentation interactively  
- **[📊 Coverage Report](./docs/coverage/lcov-report/index.html)** - Test coverage analysis
- **[💡 Usage Examples](./docs/EXAMPLES.md)** - Detailed examples documentation

### 🚀 Generate Documentation

```bash
# Generate all documentation
pnpm run docs:build

# Generate specific formats
pnpm run docs          # Markdown API docs
pnpm run docs:html     # HTML documentation
pnpm run docs:json     # JSON API schema

# Serve documentation locally
pnpm run docs:serve    # Available at http://localhost:8080
```

### 📖 Documentation Scripts

| Command | Description |
|---------|-------------|
| `docs:build` | Generate complete documentation suite |
| `docs:watch` | Watch mode for development |
| `docs:serve` | Serve docs locally with HTTP server |
| `docs:clean` | Clean documentation directory |
| `docs:preview` | Build and serve in one command |
| `docs:package` | Create compressed documentation archive |

## 🚀 Release Process

This project uses **semantic-release** for fully automated versioning and publishing. All releases are handled automatically by CI/CD based on conventional commits.

For a more comprehensive guide to the release process, including advanced troubleshooting, emergency procedures, and configuration details, please see the [Detailed Release Process Documentation](./docs/RELEASE.md).

### 📋 Conventional Commits

Use conventional commit messages to trigger automatic releases. The commit message should be structured as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s) e.g. BREAKING CHANGE:, Closes #issue]
```

**Commit Types & Version Impact:**

| Type         | Description                                                          | Version Bump          | Example                                            |
|--------------|----------------------------------------------------------------------|-----------------------|----------------------------------------------------|
| `feat`       | A new feature                                                        | **Minor** (1.0.0 → 1.1.0) | `feat: add caching plugin`                         |
| `fix`        | A bug fix                                                            | **Patch** (1.0.0 → 1.0.1) | `fix: resolve memory leak`                       |
| `feat!`      | A commit that introduces a breaking API change (correlates with `feat`) | **Major** (1.0.0 → 2.0.0) | `feat!: redesign configuration API`                |
| `fix!`       | A commit that introduces a breaking API change (correlates with `fix`)  | **Major** (1.0.0 → 2.0.0) | `fix!: change default behavior of existing method` |
| `perf`       | A code change that improves performance                              | **Patch** (sometimes None) | `perf: improve scraping speed by 20%`              |
| `docs`       | Documentation only changes                                           | None                  | `docs: update README examples`                     |
| `style`      | Changes that do not affect the meaning of the code (white-space, etc) | None                  | `style: fix code formatting`                       |
| `refactor`   | A code change that neither fixes a bug nor adds a feature            | None                  | `refactor: simplify parser logic`                  |
| `test`       | Adding missing tests or correcting existing tests                    | None                  | `test: add unit tests for browser pool`            |
| `chore`      | Changes to the build process or auxiliary tools and libraries        | None                  | `chore: update dependencies`                       |
| `ci`         | Changes to CI configuration files and scripts                        | None                  | `ci: update GitHub Actions workflow`               |

**Scope Examples:** `core`, `cli`, `docs`, `api`, `utils`. e.g., `feat(core): add browser pool management`.

**Breaking Changes:**
Must be indicated at the very beginning of the commit body or footer, starting with `BREAKING CHANGE:`.
```bash
feat!: redesign configuration API

BREAKING CHANGE: The configuration schema has changed.
Old format is no longer supported. See MIGRATION.md for upgrade guide.
```
Or (for non-`!` commits):
```bash
refactor: internal restructuring of user module

BREAKING CHANGE: User session handling has been modified.
Refer to the updated documentation for details.
```

### 🔄 Automated Release Flow

1. **Development**: Create feature branch, make changes with conventional commits
2. **Pull Request**: Open PR to `main` branch
3. **CI Validation**: Automated tests, linting, examples validation
4. **Release Preview**: Comment on PR shows what would be released
5. **Merge**: Merge PR to `main` branch
6. **Automatic Release**: CI/CD automatically:
   - Analyzes commits since last release
   - Determines next version (patch/minor/major)
   - Generates CHANGELOG.md
   - Creates GitHub release with notes
   - Publishes to npm registry
   - Deploys documentation to GitHub Pages
   - Sends notifications

### 🛠️ Release Commands

```bash
# 🔍 Local Analysis (Recommended for developers)
pnpm run release:analyze        # Fast offline analysis of commits

# 🧪 Release Simulation
pnpm run release:dry           # Safe offline dry-run (no auth required)
pnpm run release:dry-full      # Full dry-run with GitHub/npm simulation (may fail locally)

# 🔄 CI/CD Integration  
pnpm run release:preview       # CI-based release preview
pnpm run release               # Automated release (CI only)

# 🛠️ Manual Tools
pnpm run changelog             # Generate changelog manually
pnpm run release:legacy        # Emergency manual release
pnpm run health-check          # Validate CI/CD configuration
```

#### Command Details

| Command | Environment | Auth Required | Output |
|---------|-------------|---------------|---------|
| `release:analyze` | Local | ❌ No | Commit analysis + version prediction |
| `release:dry` | Local | ❌ No | Basic semantic-release simulation |  
| `release:dry-full` | Local | ⚠️ Optional | Full simulation (may fail without auth) |
| `release:preview` | CI/CD | ✅ Yes | Complete release preview |
| `release` | CI/CD | ✅ Yes | Actual release |

### 📊 Release Validation

Every release automatically runs:
- ✅ ESLint code quality checks
- ✅ Prettier formatting validation  
- ✅ Jest test suite with coverage
- ✅ TypeScript compilation
- ✅ Examples validation
- ✅ Documentation generation
- ✅ Security audit
- ✅ Bundle size analysis

### 🎯 Best Practices

- **Use conventional commits** for all changes
- **Write descriptive commit messages** with clear scope
- **Include breaking change notes** when applicable
- **Keep commits atomic** and focused
- **Test locally** before pushing
- **Let CI/CD handle releases** (avoid manual versioning)

### 🔧 Troubleshooting Common Release Issues

*   **Release Not Triggered**:
    *   Ensure your commit messages strictly follow the [Conventional Commits](#-conventional-commits) format.
    *   Verify the commit was pushed to the `main` branch (for production releases) or the relevant branch for previews.
    *   Check that the commit message does not include `[skip ci]` or similar tags that prevent CI execution.
*   **Incorrect Version Bump**:
    *   Carefully review your commit history to ensure `feat`, `fix`, and `BREAKING CHANGE:` annotations are used correctly according to the version impact table.
    *   Ensure any breaking changes are clearly documented in the commit body or footer, starting with `BREAKING CHANGE:`.

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### 💻 Development Setup

1.  **Fork and Clone**
    ```bash
    git clone https://github.com/devalexanderdaza/crawlee-scraper-toolkit.git
    cd crawlee-scraper-toolkit
    ```

2.  **Core Prerequisites & Environment Setup**
    *   **Node.js:** This project uses Node.js version `>=20.0.0` (as specified in `.nvmrc`). We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager).
        ```bash
        # Install and use the project's Node.js version (reads .nvmrc)
        nvm install
        nvm use
        # Verify
        node --version
        ```
    *   **pnpm:** This project uses [pnpm](https://pnpm.io/) (version `>=8.0.0`, see `package.json` `packageManager` field) as the package manager.
        ```bash
        # Install pnpm globally (if you don't have it)
        npm install -g pnpm@latest
        # Or, enable corepack (recommended, comes with Node.js >=16.10)
        # corepack enable && corepack prepare pnpm@latest --activate
        # Verify
        pnpm --version
        ```
        This project includes an `.npmrc` file with settings like `auto-install-peers=true`. Key structure files: `.nvmrc`, `.npmrc`, `pnpm-lock.yaml`, `tsconfig.json`.

3.  **Install Dependencies & Setup Hooks**
    ```bash
    # Install all project dependencies using pnpm
    pnpm install

    # Setup Husky git hooks (for linting, commit messages, etc.)
    pnpm run prepare
    ```

4.  **Verify Setup**
    ```bash
    # Run tests to ensure everything is working
    pnpm test
    ```

### 🛠️ Common Development Commands

A list of common commands you might use during development:

*   `pnpm dev`: Run the application in development mode (e.g., with hot reloading, if applicable).
*   `pnpm build`: Build the project for production.
*   `pnpm test`: Run the full test suite.
*   `pnpm test:watch`: Run tests in interactive watch mode.
*   `pnpm test:coverage`: Generate a test coverage report.
*   `pnpm lint`: Check code for linting issues using ESLint.
*   `pnpm lint:fix`: Attempt to automatically fix linting issues.
*   `pnpm format`: Format code using Prettier.
*   `pnpm example:news`: Run the basic news scraper example.
*   `pnpm example:products`: Run the advanced product scraper example.
*   `pnpm cli -- --help`: Run the toolkit's CLI locally to see its commands. (Note: `pnpm cli` itself might run a default command; use `--` to pass arguments to the CLI script).

### 🎯 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Changes** following conventional commits:
   ```bash
   # Examples of good commit messages
   git commit -m "feat: add retry mechanism to browser pool"
   git commit -m "fix: resolve memory leak in scraper engine"  
   git commit -m "docs: add configuration examples"
   git commit -m "test: add integration tests for API scraper"
   ```

3. **Validate Changes**
   ```bash
   pnpm run lint      # Check code style
   pnpm run test      # Run test suite
   pnpm run build     # Verify build works
   ```

4. **Submit Pull Request**
   - Push your branch: `git push origin feat/your-feature-name`
   - Open PR against `main` branch
   - CI will automatically validate and show release preview
   - Address any feedback from reviewers

### 📝 Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automatic versioning:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)  
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Breaking Changes:**
```bash
feat!: redesign configuration API

BREAKING CHANGE: The configuration schema has changed.
Migration guide available in MIGRATION.md
```

### 🛡️ Quality Gates

All contributions must pass:
- **Pre-commit hooks**: Linting and formatting
- **Commit message validation**: Conventional commit format
- **CI pipeline**: Tests, build, examples validation
- **Code review**: Maintainer approval required

### 🚫 What Not to Do

- ❌ Don't manually update version numbers
- ❌ Don't edit CHANGELOG.md directly
- ❌ Don't skip conventional commit format
- ❌ Don't push directly to main branch
- ❌ Don't bypass pre-commit hooks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Crawlee](https://crawlee.dev/) and [Playwright](https://playwright.dev/)
- Inspired by the need for a more configurable and extensible scraping toolkit
- Thanks to all contributors and the open-source community

## 📞 Support

- 📖 [Documentation](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/wiki)
- 🐛 [Issue Tracker](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/issues)
- 💬 [Discussions](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/discussions)

---

Made with ❤️ by devalexanderdaza

