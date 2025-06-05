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
const {{name}}Definition: ScraperDefinition<string, any> = {
  id: '{{name}}',
  name: '{{description}}',
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
  engine.register({{name}}Definition);

  // Example usage
  const input = process.argv[2] || 'default-input';
  
  try {
    const result = await engine.execute({{name}}Definition, input);
    
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

export { {{name}}Definition };
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
const {{name}}Definition: ScraperDefinition<string, any> = {
  id: '{{name}}',
  name: '{{description}}',
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
  engine.register({{name}}Definition);

  // Example usage
  const input = process.argv[2] || 'default-query';
  
  try {
    const result = await engine.execute({{name}}Definition, input);
    
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

export { {{name}}Definition };
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
const {{name}}Definition: ScraperDefinition<string, any> = {
  id: '{{name}}',
  name: '{{description}}',
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
  engine.register({{name}}Definition);

  // Example usage
  const input = process.argv[2] || 'default-search';
  
  try {
    const result = await engine.execute({{name}}Definition, input);
    
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

export { {{name}}Definition };
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
const {{name}}Definition: ScraperDefinition<string, any> = {
  id: '{{name}}',
  name: '{{description}}',
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
  engine.register({{name}}Definition);

  // Example usage
  const input = process.argv[2] || 'default-input';
  
  try {
    console.log('Starting advanced scraper...');
    const result = await engine.execute({{name}}Definition, input);
    
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

export { {{name}}Definition };
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
const templates: Record<TemplateType, Template> = {
  basic: basicTemplate,
  api: apiTemplate,
  form: formTemplate,
  advanced: advancedTemplate,
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

