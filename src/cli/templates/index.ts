import { TemplateType } from '../commands/generate';

/**
 * Template structure
 */
export interface Template {
  name: string;
  description: string;
  files: Record<string, string>;
}

/**
 * Basic scraper template
 */
const basicTemplate: Template = {
  name: 'Basic Scraper',
  description: 'Simple page scraping template',
  files: {
    'src/index.ts': `import { CrawleeScraperEngine, ScraperDefinition } from 'crawlee-scraper-toolkit';
import { createLogger } from 'crawlee-scraper-toolkit/utils';

// Scraper definition
export const definition: ScraperDefinition<string, any> = {
  id: '{{name}}', // This will be replaced by the actual scraper name during generation
  name: '{{name}}', // This will be replaced
  description: '{{description}}',
  url: '{{url}}',
  navigation: {{navigation}},
  waitStrategy: {{waitStrategy}},
  requiresCaptcha: false,
  parse: async (context) => {
    const { page, input } = context;
    
    // Extract data from the page
    const title = await page.textContent('h1') || '';
    const description = await page.textContent('p') || '';
    
    // Custom extraction logic based on output fields
    const result: any = {
      title,
      description,
      url: page.url(),
      timestamp: new Date().toISOString(),
    };

    // Add configured output fields
    const outputFields = {{outputFields}};
    for (const field of outputFields) {
      try {
        let value: string | null = null;
        
        switch (field.type) {
          case 'text':
            value = await page.textContent(field.selector);
            break;
          case 'html':
            value = await page.innerHTML(field.selector);
            break;
          case 'attribute':
            value = await page.getAttribute(field.selector, field.attribute || 'href');
            break;
        }
        
        result[field.name] = value;
      } catch (error) {
        console.warn(\`Failed to extract field \${field.name}: \${error}\`);
        result[field.name] = null;
      }
    }
    
    return result;
  },
  options: {{options}},
};

// Main execution
async function main() {
  const logger = createLogger({ level: 'info', format: 'text', console: true });
  const engine = new CrawleeScraperEngine({
    browserPool: {
      maxSize: 3,
      maxAge: 30 * 60 * 1000,
      launchOptions: { headless: true, args: ['--no-sandbox'] },
      cleanupInterval: 5 * 60 * 1000,
    },
    defaultOptions: {
      retries: 3,
      retryDelay: 1000,
      timeout: 30000,
      useProxyRotation: false,
      headers: {},
      javascript: true,
      loadImages: false,
      viewport: { width: 1920, height: 1080 },
    },
    plugins: [],
    globalHooks: {},
    logging: { level: 'info', format: 'text' },
  }, logger);

  // Register the scraper
  // Register the scraper
  // For standalone execution, the definition is already available.
  // If this were part of a larger system where definitions are dynamically loaded,
  // engine.register(definition) would be used by that system.

  // Example usage
  const input = process.argv[2] || 'default-input';
  
  try {
    // When running directly, execute the local 'definition'
    const result = await engine.execute(definition, input);
    
    if (result.success) {
      console.log('Scraping successful!');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('Scraping failed:', result.error?.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await engine.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

// If this script is run directly (e.g., `node dist/index.js`)
if (require.main === module) {
  main().catch(console.error);
}

// Note: The primary export 'definition' is used when this scraper is run by 'crawlee-scraper run'.
// The main() function is for direct execution or testing of this specific scraper.
`,
    'README.md': `# {{name}}

{{description}}

## Usage

\`\`\`bash
# Install dependencies
npm install

# Run the scraper
npm run dev [input]

# Build for production
npm run build
npm start [input]
\`\`\`

## Configuration

The scraper is configured to:
- Target URL: {{url}}
- Navigation: {{navigation}}
- Wait Strategy: {{waitStrategy}}

## Output Fields

The scraper extracts the following fields:
{{#each outputFields}}
- **{{name}}**: {{selector}} ({{type}})
{{/each}}

## Customization

Edit \`src/index.ts\` to modify the scraper behavior:
- Update the \`parse\` function to extract different data
- Modify the navigation or wait strategies
- Add custom hooks or plugins
`,
  },
};

/**
 * API scraper template
 */
const apiTemplate: Template = {
  name: 'API Scraper',
  description: 'Template for extracting data from API responses',
  files: {
    'src/index.ts': `import { CrawleeScraperEngine, ScraperDefinition } from 'crawlee-scraper-toolkit';
import { createLogger } from 'crawlee-scraper-toolkit/utils';

// Scraper definition for API-based extraction
export const definition: ScraperDefinition<string, any> = {
  id: '{{name}}', // This will be replaced
  name: '{{name}}', // This will be replaced
  description: '{{description}}',
  url: '{{url}}',
  navigation: {{navigation}},
  waitStrategy: {{waitStrategy}},
  requiresCaptcha: false,
  parse: async (context) => {
    const { page, input } = context;
    
    // Wait for the API response
    const response = await page.waitForResponse(
      res => res.url().includes('{{waitStrategy.config.urlPattern}}'),
      { timeout: 30000 }
    );
    
    // Parse the JSON response
    const data = await response.json();
    
    // Process the API data
    const result = {
      input,
      url: page.url(),
      timestamp: new Date().toISOString(),
      apiData: data,
      // Add custom processing here
      processedData: processApiData(data),
    };
    
    return result;
  },
  options: {{options}},
};

// Helper function to process API data
function processApiData(data: any): any {
  // Implement your custom data processing logic here
  // This is where you would extract specific fields from the API response
  
  if (Array.isArray(data)) {
    return data.map(item => ({
      id: item.id,
      title: item.title || item.name,
      description: item.description,
      // Add more fields as needed
    }));
  }
  
  return {
    id: data.id,
    title: data.title || data.name,
    description: data.description,
    // Add more fields as needed
  };
}

// Main execution
async function main() {
  const logger = createLogger({ level: 'info', format: 'text', console: true });
  const engine = new CrawleeScraperEngine({
    browserPool: {
      maxSize: 3,
      maxAge: 30 * 60 * 1000,
      launchOptions: { headless: true, args: ['--no-sandbox'] },
      cleanupInterval: 5 * 60 * 1000,
    },
    defaultOptions: {
      retries: 3,
      retryDelay: 1000,
      timeout: 30000,
      useProxyRotation: false,
      headers: {},
      javascript: true,
      loadImages: false,
      viewport: { width: 1920, height: 1080 },
    },
    plugins: [],
    globalHooks: {},
    logging: { level: 'info', format: 'text' },
  }, logger);

  // Register the scraper
  // engine.register(definition); // Not needed for standalone main() with local definition

  // Example usage
  const input = process.argv[2] || 'default-query';
  
  try {
    const result = await engine.execute(definition, input);
    
    if (result.success) {
      console.log('API scraping successful!');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('API scraping failed:', result.error?.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await engine.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

if (require.main === module) {
  main().catch(console.error);
}
`,
    'README.md': `# {{name}} - API Scraper

{{description}}

This scraper extracts data from API responses by intercepting network requests.

## Usage

\`\`\`bash
# Install dependencies
npm install

# Run the scraper
npm run dev [query]

# Build for production
npm run build
npm start [query]
\`\`\`

## How it works

1. Navigates to: {{url}}
2. Waits for API response matching: {{waitStrategy.config.urlPattern}}
3. Extracts and processes the JSON data
4. Returns structured results

## Customization

Edit the \`processApiData\` function in \`src/index.ts\` to customize how the API response is processed and what fields are extracted.
`,
  },
};

/**
 * Form scraper template
 */
const formTemplate: Template = {
  name: 'Form Scraper',
  description: 'Template for form-based scraping',
  files: {
    'src/index.ts': `import { CrawleeScraperEngine, ScraperDefinition } from 'crawlee-scraper-toolkit';
import { createLogger } from 'crawlee-scraper-toolkit/utils';

// Scraper definition for form-based extraction
export const definition: ScraperDefinition<string, any> = {
  id: '{{name}}', // Will be replaced
  name: '{{name}}', // Will be replaced
  description: '{{description}}',
  url: '{{url}}',
  navigation: {{navigation}},
  waitStrategy: {{waitStrategy}},
  requiresCaptcha: false,
  parse: async (context) => {
    const { page, input } = context;
    
    // Fill the form
    await page.fill('{{navigation.config.inputSelector}}', input);
    
    // Submit the form
    await page.click('{{navigation.config.submitSelector}}');
    
    // Wait for results to load
    await page.waitForSelector('{{waitStrategy.config.selector}}', { timeout: 30000 });
    
    // Extract results
    const results = await page.$$eval('{{waitStrategy.config.selector}} .result-item', elements => {
      return elements.map(el => ({
        title: el.querySelector('h3')?.textContent?.trim() || '',
        description: el.querySelector('p')?.textContent?.trim() || '',
        link: el.querySelector('a')?.href || '',
      }));
    });
    
    // Custom extraction logic based on output fields
    const customFields: any = {};
    const outputFields = {{outputFields}};
    
    for (const field of outputFields) {
      try {
        let value: string | null = null;
        
        switch (field.type) {
          case 'text':
            value = await page.textContent(field.selector);
            break;
          case 'html':
            value = await page.innerHTML(field.selector);
            break;
          case 'attribute':
            value = await page.getAttribute(field.selector, field.attribute || 'href');
            break;
        }
        
        customFields[field.name] = value;
      } catch (error) {
        console.warn(\`Failed to extract field \${field.name}: \${error}\`);
        customFields[field.name] = null;
      }
    }
    
    return {
      query: input,
      url: page.url(),
      timestamp: new Date().toISOString(),
      results,
      customFields,
      totalResults: results.length,
    };
  },
  options: {{options}},
};

// Main execution
async function main() {
  const logger = createLogger({ level: 'info', format: 'text', console: true });
  const engine = new CrawleeScraperEngine({
    browserPool: {
      maxSize: 3,
      maxAge: 30 * 60 * 1000,
      launchOptions: { headless: true, args: ['--no-sandbox'] },
      cleanupInterval: 5 * 60 * 1000,
    },
    defaultOptions: {
      retries: 3,
      retryDelay: 1000,
      timeout: 30000,
      useProxyRotation: false,
      headers: {},
      javascript: true,
      loadImages: false,
      viewport: { width: 1920, height: 1080 },
    },
    plugins: [],
    globalHooks: {},
    logging: { level: 'info', format: 'text' },
  }, logger);

  // Register the scraper
  // engine.register(definition); // Not needed for standalone main()

  // Example usage
  const input = process.argv[2] || 'default-search';
  
  try {
    const result = await engine.execute(definition, input);
    
    if (result.success) {
      console.log('Form scraping successful!');
      console.log(\`Found \${result.data.totalResults} results\`);
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('Form scraping failed:', result.error?.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await engine.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

if (require.main === module) {
  main().catch(console.error);
}
`,
    'README.md': `# {{name}} - Form Scraper

{{description}}

This scraper fills and submits forms to extract search results or other data.

## Usage

\`\`\`bash
# Install dependencies
npm install

# Run the scraper
npm run dev [search-term]

# Build for production
npm run build
npm start [search-term]
\`\`\`

## Form Configuration

- Input field: {{navigation.config.inputSelector}}
- Submit button: {{navigation.config.submitSelector}}
- Results container: {{waitStrategy.config.selector}}

## Customization

Edit \`src/index.ts\` to:
- Modify form selectors
- Change result extraction logic
- Add additional form fields
- Handle pagination
`,
  },
};

/**
 * Advanced scraper template
 */
const advancedTemplate: Template = {
  name: 'Advanced Scraper',
  description: 'Full-featured template with custom navigation and hooks',
  files: {
    'src/index.ts': `import { CrawleeScraperEngine, ScraperDefinition } from 'crawlee-scraper-toolkit';
import { createLogger } from 'crawlee-scraper-toolkit/utils';
import { RetryPlugin, CachePlugin, MetricsPlugin } from 'crawlee-scraper-toolkit/plugins';

// Advanced scraper definition with custom hooks and plugins
export const definition: ScraperDefinition<string, any> = {
  id: '{{name}}', // Will be replaced
  name: '{{name}}', // Will be replaced
  description: '{{description}}',
  url: '{{url}}',
  navigation: {{navigation}},
  waitStrategy: {{waitStrategy}},
  requiresCaptcha: false,
  
  // Custom hooks
  hooks: {
    beforeRequest: [
      async (context) => {
        console.log(\`Starting scrape for: \${context.input}\`);
        // Add custom headers, cookies, etc.
        await context.page.setExtraHTTPHeaders({
          'X-Custom-Header': 'crawlee-scraper-toolkit',
        });
      },
    ],
    afterRequest: [
      async (context) => {
        console.log(\`Completed scrape for: \${context.input}\`);
        // Log metrics, save screenshots, etc.
        if (process.env.SAVE_SCREENSHOTS === 'true') {
          await context.page.screenshot({
            path: \`screenshots/\${context.input}-\${Date.now()}.png\`,
          });
        }
      },
    ],
    onError: [
      async (context) => {
        console.error(\`Scrape failed for: \${context.input}\`, context.error);
        // Custom error handling
      },
    ],
    onRetry: [
      async (context) => {
        console.log(\`Retrying scrape for: \${context.input} (attempt \${context.attempt})\`);
        // Clear cookies, change user agent, etc.
      },
    ],
  },
  
  parse: async (context) => {
    const { page, input } = context;
    
    // Custom navigation logic
    if (context.navigation.type === 'custom') {
      await customNavigationLogic(page, input);
    }
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Extract data with error handling
    const result: any = {
      input,
      url: page.url(),
      timestamp: new Date().toISOString(),
      metadata: {
        userAgent: await page.evaluate(() => navigator.userAgent),
        viewport: await page.viewportSize(),
      },
    };
    
    // Extract configured output fields
    const outputFields = {{outputFields}};
    for (const field of outputFields) {
      try {
        result[field.name] = await extractField(page, field);
      } catch (error) {
        console.warn(\`Failed to extract field \${field.name}: \${error}\`);
        result[field.name] = null;
      }
    }
    
    // Extract additional structured data
    result.structuredData = await extractStructuredData(page);
    
    return result;
  },
  
  // Custom validation
  validateInput: (input: string) => {
    if (!input || input.trim().length === 0) {
      return 'Input cannot be empty';
    }
    if (input.length > 100) {
      return 'Input too long (max 100 characters)';
    }
    return true;
  },
  
  validateOutput: (output: any) => {
    if (!output || typeof output !== 'object') {
      return 'Output must be an object';
    }
    if (!output.timestamp) {
      return 'Output must include timestamp';
    }
    return true;
  },
  
  options: {{options}},
};

// Custom navigation logic
async function customNavigationLogic(page: any, input: string): Promise<void> {
  // Implement custom navigation steps
  console.log('Executing custom navigation...');
  
  // Example: Handle complex multi-step navigation
  await page.goto('{{url}}');
  await page.waitForSelector('.search-form');
  await page.fill('.search-input', input);
  await page.click('.search-button');
  await page.waitForSelector('.results');
}

// Field extraction helper
async function extractField(page: any, field: any): Promise<string | null> {
  switch (field.type) {
    case 'text':
      return await page.textContent(field.selector);
    case 'html':
      return await page.innerHTML(field.selector);
    case 'attribute':
      return await page.getAttribute(field.selector, field.attribute || 'href');
    default:
      throw new Error(\`Unknown field type: \${field.type}\`);
  }
}

// Structured data extraction
async function extractStructuredData(page: any): Promise<any> {
  // Extract JSON-LD structured data
  const jsonLd = await page.$$eval('script[type="application/ld+json"]', scripts => {
    return scripts.map(script => {
      try {
        return JSON.parse(script.textContent || '');
      } catch {
        return null;
      }
    }).filter(Boolean);
  });
  
  // Extract Open Graph data
  const openGraph = await page.$$eval('meta[property^="og:"]', metas => {
    const og: any = {};
    metas.forEach(meta => {
      const property = meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (property && content) {
        og[property.replace('og:', '')] = content;
      }
    });
    return og;
  });
  
  return { jsonLd, openGraph };
}

// Main execution with plugins
async function main() {
  const logger = createLogger({ level: 'info', format: 'text', console: true });
  
  const engine = new CrawleeScraperEngine({
    browserPool: {
      maxSize: 5,
      maxAge: 30 * 60 * 1000,
      launchOptions: { 
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      cleanupInterval: 5 * 60 * 1000,
    },
    defaultOptions: {
      retries: 5,
      retryDelay: 2000,
      timeout: 60000,
      useProxyRotation: false,
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
      javascript: true,
      loadImages: false,
      viewport: { width: 1920, height: 1080 },
    },
    plugins: [],
    globalHooks: {},
    logging: { level: 'info', format: 'text' },
  }, logger);

  // Install plugins
  engine.use(new RetryPlugin({ maxBackoffDelay: 30000 }));
  engine.use(new CachePlugin({ defaultTtl: 10 * 60 * 1000 }));
  engine.use(new MetricsPlugin());

  // Register the scraper
  // engine.register(definition); // Not needed for standalone main()

  // Example usage
  const input = process.argv[2] || 'default-input';
  
  try {
    console.log('Starting advanced scraper...'); // This console.log should ideally use the logger too
    const result = await engine.execute(definition, input);
    
    if (result.success) {
      console.log('Advanced scraping successful!');
      console.log(JSON.stringify(result.data, null, 2));
      
      // Show metrics
      const metricsPlugin = engine.getPlugin('metrics') as MetricsPlugin;
      if (metricsPlugin) {
        console.log('\\nMetrics:', metricsPlugin.getMetrics());
      }
    } else {
      console.error('Advanced scraping failed:', result.error?.message);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await engine.shutdown();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

if (require.main === module) {
  main().catch(console.error);
}
`,
    'README.md': `# {{name}} - Advanced Scraper

{{description}}

This is a full-featured scraper with custom hooks, plugins, and advanced error handling.

## Features

- ✅ Custom navigation logic
- ✅ Retry with exponential backoff
- ✅ Result caching
- ✅ Metrics collection
- ✅ Screenshot capture
- ✅ Structured data extraction
- ✅ Input/output validation
- ✅ Custom hooks

## Usage

\`\`\`bash
# Install dependencies
npm install

# Run with default settings
npm run dev [input]

# Run with screenshots enabled
SAVE_SCREENSHOTS=true npm run dev [input]

# Run in headed mode (show browser)
HEADLESS=false npm run dev [input]
\`\`\`

## Configuration

Environment variables:
- \`SAVE_SCREENSHOTS\`: Set to 'true' to save screenshots
- \`HEADLESS\`: Set to 'false' to run in headed mode

## Customization

This template includes examples of:
- Custom navigation logic
- Field extraction helpers
- Structured data extraction
- Plugin usage
- Hook implementation

Edit \`src/index.ts\` to customize for your specific use case.
`,
    'src/types.ts': `// Custom types for the scraper
export interface ScrapedData {
  input: string;
  url: string;
  timestamp: string;
  metadata: {
    userAgent: string;
    viewport: { width: number; height: number } | null;
  };
  structuredData: {
    jsonLd: any[];
    openGraph: Record<string, string>;
  };
}

export interface FieldConfig {
  name: string;
  selector: string;
  type: 'text' | 'html' | 'attribute';
  attribute?: string;
}
`,
  },
};

/**
 * Template registry
 */
const infiniteScrollTemplate: Template = {
  name: 'Infinite Scroll Scraper',
  description: 'Handles pages with infinite scrolling pagination.',
  files: {
    'src/index.ts': `import { Actor } from 'apify';
import { PlaywrightCrawler, log } from 'crawlee';

interface Input {
    startUrls: string[];
    maxScrolls: number;
    scrollDelayMs: number;
}

interface Output {
    url: string;
    title: string | null;
    scrapedItemCount: number;
    // Add other fields you want to scrape
}

async function main() {
    await Actor.init();

    const {
        startUrls = ['https://example.com/scrollable-page'], // Replace with your target URL
        maxScrolls = 10,
        scrollDelayMs = 1000,
    } = await Actor.getInput<Input>() ?? {} as Input;

    const crawler = new PlaywrightCrawler({
        requestHandlerTimeoutSecs: 120,
        async requestHandler({ request, page, enqueueLinks, log: crawlerLog }) {
            crawlerLog.info(\`Processing \${request.url}...\`);
            const title = await page.title();
            let scrapedItemCount = 0;

            let currentScroll = 0;
            let lastHeight = await page.evaluate(() => document.body.scrollHeight);

            while (currentScroll < maxScrolls) {
                crawlerLog.info(\`Scrolling... (Attempt \${currentScroll + 1}/\${maxScrolls})\`);
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(scrollDelayMs); // Wait for content to load

                const newHeight = await page.evaluate(() => document.body.scrollHeight);
                if (newHeight === lastHeight) {
                    crawlerLog.info('No new content loaded after scroll. Stopping.');
                    break;
                }
                lastHeight = newHeight;

                // Add your scraping logic here for newly loaded items
                // Example: count newly loaded items
                // const newItems = await page.locator('.newly-loaded-item').count();
                // scrapedItemCount += newItems;
                // crawlerLog.info(\`Found \${newItems} new items.\`);

                currentScroll++;
            }

            // Scrape initial items or items present after scrolling
            // Example:
            // const items = await page.locator('.item-selector').all();
            // for (const item of items) {
            //     // process item
            //     scrapedItemCount++;
            // }

            crawlerLog.info(\`Finished scrolling for \${request.url}. Total items (example): \${scrapedItemCount}\`);

            await Actor.pushData({ url: request.url, title, scrapedItemCount });

            // Example: Add logic to enqueue next pages if any, or detail pages
            // await enqueueLinks({
            //     selector: '.next-page-selector',
            // });
        },
        // Add other PlaywrightCrawler options as needed (e.g., proxyConfiguration)
    });

    await crawler.run(startUrls);

    await Actor.exit();
}

main().catch((err) => {
    log.error('Actor failed:', err);
    process.exit(1);
});
`,
    'README.md': `# Infinite Scroll Scraper Template

This template is designed for scraping web pages that use infinite scrolling to load content. Instead of traditional pagination links, new content is loaded dynamically as the user scrolls down the page.

## How it Works

1.  **Initial Load**: The scraper navigates to the start URL.
2.  **Scrolling Loop**:
    *   It scrolls to the bottom of the page using \`window.scrollTo(0, document.body.scrollHeight)\`.
    *   It waits for a specified delay (\`scrollDelayMs\`) to allow new content to load.
    *   It checks if new content has actually loaded by comparing the page height before and after the scroll. If the height hasn't changed, it assumes no new content is available and stops scrolling.
    *   This process repeats up to a maximum number of scrolls (\`maxScrolls\`) to prevent indefinite loops.
3.  **Data Extraction**: You should add your data extraction logic *within* the scrolling loop if you want to process items as they load, or *after* the loop if you want to process all items once scrolling is complete. The current example includes placeholders for this.
4.  **Output**: Scraped data is pushed to the Apify dataset.

## Configuration

The scraper accepts the following input parameters (defined in \`INPUT_SCHEMA.json\` if you use Apify Console, or passed via API):

*   \`startUrls\`: An array of URLs to start scraping from.
*   \`maxScrolls\`: The maximum number of times the scraper will scroll down the page. (Default: 10)
*   \`scrollDelayMs\`: The time (in milliseconds) to wait after each scroll for new content to load. (Default: 1000)

## Customization

*   **Target URL**: Change \`startUrls\` in your input to the page you want to scrape.
*   **Scraping Logic**: Modify the \`requestHandler\` function:
    *   Implement the logic to identify and extract data from newly loaded items within or after the scroll loop. Update selectors like \`.newly-loaded-item\` or \`.item-selector\`.
    *   If necessary, adjust how \`scrapedItemCount\` is calculated.
*   **Scroll Parameters**: Adjust \`maxScrolls\` and \`scrollDelayMs\` based on the target website's behavior. Some sites may require longer delays or more/less scrolls.
*   **Stopping Condition**: Enhance the condition for stopping the scroll loop if the height check is not reliable for your target site (e.g., look for a "no more items" element).
*   **Enqueueing Links**: If items link to detail pages, add \`enqueueLinks\` calls.

Remember to install dependencies (\`pnpm install\`) and build the Actor (\`pnpm build\`) before running.
`,
  },
};

const jsHeavySiteTemplate: Template = {
  name: 'JS-Heavy Site Scraper',
  description: 'Scrapes sites with heavy JavaScript, focusing on advanced waitFor strategies.',
  files: {
    'src/index.ts': `import { Actor } from 'apify';
import { PlaywrightCrawler, log } from 'crawlee';

interface Input {
    startUrls: string[];
    waitForSelectorTimeoutMs: number;
}

interface Output {
    url: string;
    title: string | null;
    dataFromDynamicContent?: string;
    eventTriggered?: boolean;
    // Add other fields you want to scrape
}

async function main() {
    await Actor.init();

    const {
        startUrls = ['https://example.com/js-heavy-page'], // Replace with your target URL
        waitForSelectorTimeoutMs = 5000,
    } = await Actor.getInput<Input>() ?? {} as Input;

    const crawler = new PlaywrightCrawler({
        requestHandlerTimeoutSecs: 180, // Increased timeout for potentially slow JS sites
        navigationTimeoutSecs: 120,
        async requestHandler({ request, page, enqueueLinks, log: crawlerLog }) {
            crawlerLog.info(\`Processing \${request.url}...\`);
            const title = await page.title();
            let output: Output = { url: request.url, title, scrapedItemCount: 0 };

            // Example 1: Wait for a specific element that appears after JS execution
            try {
                const dynamicElement = await page.waitForSelector('#dynamically-loaded-content', { timeout: waitForSelectorTimeoutMs });
                if (dynamicElement) {
                    output.dataFromDynamicContent = await dynamicElement.textContent() ?? "N/A";
                    crawlerLog.info('Successfully captured data from dynamically loaded content.');
                }
            } catch (e) {
                crawlerLog.warning(\`Could not find #dynamically-loaded-content within \${waitForSelectorTimeoutMs}ms.\`);
            }

            // Example 2: Wait for a specific function to return true
            // This is useful if a global variable is set or a condition is met after JS processing
            try {
                await page.waitForFunction(() => (window as any).myAppReady === true, { timeout: 10000 });
                crawlerLog.info('Condition window.myAppReady === true was met.');
                // You can now safely interact with elements that depend on this condition
            } catch (e) {
                crawlerLog.warning('waitForFunction condition was not met in time.');
            }

            // Example 3: Wait for a specific network request to finish
            // Useful if data is fetched via AJAX and you need to wait for that data
            try {
                const [response] = await Promise.all([
                    page.waitForResponse(resp => resp.url().includes('/api/data') && resp.status() === 200, { timeout: 15000 }),
                    // Add the action that triggers the network request if necessary, e.g., clicking a button
                    // page.click('#load-data-button'),
                ]);
                const responseBody = await response.json();
                crawlerLog.info('Received response from /api/data:', responseBody);
                // Process responseBody
            } catch (e) {
                crawlerLog.warning('Did not receive expected network response from /api/data in time.');
            }

            // Example 4: Wait for a specific event to be emitted on the page
            // This requires the page to use \`window.dispatchEvent(new CustomEvent('myCustomEvent'))\` or similar
            try {
                await page.waitForEvent('myCustomEvent', { timeout: 10000 });
                crawlerLog.info('myCustomEvent was dispatched on the page.');
                output.eventTriggered = true;
            } catch (e) {
                crawlerLog.warning('waitForEvent: myCustomEvent was not dispatched in time.');
            }

            // Add your main scraping logic here, assuming JS has loaded
            // const mainContent = await page.locator('#main-content-area').textContent();
            // output.mainContent = mainContent;


            await Actor.pushData(output);

            // Example: Add logic to enqueue next pages if any
            // await enqueueLinks({
            //     selector: '.next-page-selector',
            // });
        },
        // Consider using preNavigationHooks or postNavigationHooks for complex interactions
        // headless: 'new', // Try different headless modes if issues arise
    });

    await crawler.run(startUrls);

    await Actor.exit();
}

main().catch((err) => {
    log.error('Actor failed:', err);
    process.exit(1);
});
`,
    'README.md': `# JS-Heavy Site Scraper Template

This template is designed for scraping websites that heavily rely on JavaScript to render content, fetch data, or handle user interactions. It demonstrates various \`waitFor\` strategies provided by Playwright to ensure elements are available and actions are completed before proceeding with scraping.

## Key Features & Strategies

*   \`page.waitForSelector(selector, options)\`: Waits for an element matching the selector to appear in the DOM. Useful for content that loads dynamically.
    *   Example: Waiting for \`#dynamically-loaded-content\`.
*   \`page.waitForFunction(fn, arg, options)\`: Waits until the provided function, executed in the page context, returns a truthy value.
    *   Example: Waiting for a global flag like \`window.myAppReady === true\`.
*   \`page.waitForResponse(urlOrPredicate, options)\`: Waits for a network response that matches a URL or a predicate function.
    *   Example: Waiting for an API call like \`/api/data\` to complete.
*   \`page.waitForEvent(event, optionsOrPredicate)\`: Waits for a specific DOM event to be emitted on the page.
    *   Example: Waiting for a custom event \`myCustomEvent\` that might signify JS initialization is complete.
*   **Increased Timeouts**: Default timeouts for \`requestHandlerTimeoutSecs\` and \`navigationTimeoutSecs\` are increased as JS-heavy sites can be slower to load and process.

## How it Works

1.  **Navigation**: The scraper navigates to the start URL.
2.  **Waiting Strategies**: Before attempting to extract data, the \`requestHandler\` employs one or more \`waitFor\` methods to ensure the page is in the desired state.
    *   The examples in \`src/index.ts\` show how to use these methods. Uncomment or adapt them as needed.
3.  **Data Extraction**: Once the necessary conditions are met (e.g., elements are visible, API calls have returned), your data extraction logic can run.
4.  **Output**: Scraped data is pushed to the Apify dataset.

## Configuration

The scraper accepts the following input parameters:

*   \`startUrls\`: An array of URLs to start scraping from.
*   \`waitForSelectorTimeoutMs\`: Timeout in milliseconds for \`page.waitForSelector\`. (Default: 5000)

## Customization

*   **Target URL**: Change \`startUrls\` in your input.
*   **Waiting Logic**: This is the most crucial part to customize.
    *   Analyze your target website's behavior using browser developer tools (Network tab, Console, Elements panel).
    *   Identify which elements, network calls, or JavaScript events signal that the content you need is ready.
    *   Choose the appropriate \`waitFor\` methods and configure their selectors, predicates, and timeouts.
    *   You might need to chain multiple \`waitFor\` calls or use them in combination with actions like clicks (\`page.click()\`).
*   **Scraping Logic**: Implement your data extraction logic after the \`waitFor\` conditions are met.
*   **Error Handling**: The examples include basic \`try...catch\` blocks for \`waitFor\` methods. Enhance this as needed.
*   **Headless Mode**: Experiment with \`headless: false\` or \`headless: 'new'\` in \`PlaywrightCrawler\` options if you encounter issues specific to headless browsing. Some JS-heavy sites behave differently in headless mode.
*   **Proxy Configuration**: Essential for sites that might block based on IP. Configure \`proxyConfiguration\` in \`PlaywrightCrawler\`.

Remember to install dependencies (\`pnpm install\`) and build the Actor (\`pnpm build\`) before running.
`,
  },
};

const templates: Record<TemplateType, Template> = {
  basic: basicTemplate,
  api: apiTemplate,
  form: formTemplate,
  advanced: advancedTemplate,
  'infinite-scroll': infiniteScrollTemplate,
  'js-heavy': jsHeavySiteTemplate,
};

/**
 * Get template by type
 */
export function getTemplate(type: TemplateType): Template {
  const template = templates[type];
  if (!template) {
    throw new Error(`Template not found: ${type}`);
  }
  return template;
}

/**
 * Get all available templates
 */
export function getAvailableTemplates(): Array<{ type: TemplateType; template: Template }> {
  return Object.entries(templates).map(([type, template]) => ({
    type: type as TemplateType,
    template,
  }));
}

