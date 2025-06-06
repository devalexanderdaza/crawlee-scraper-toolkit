import { 
  CrawleeScraperEngine, 
  ScraperDefinition, 
  createConfig,
  configManager,
  RetryPlugin,
  CachePlugin,
  MetricsPlugin,
  createLogger
} from '../src';
import { ScraperContext } from '../src/core/types';
import * as fs from 'fs'; // For creating screenshots directory
import * as path from 'path'; // For path joining

// Define the product interface
interface Product {
  id: string | number;
  name: string;
  price: {
    current: number;
    original?: number;
    currency: string;
    discount?: number;
  };
  rating: {
    average: number;
    count: number;
  };
  availability: boolean;
  images: string[];
  url: string;
  brand?: string;
  category?: string;
  description?: string;
}

// Define the output interface
interface ProductSearchResult {
  searchQuery: string;
  products: Product[];
  totalFound: number;
  metadata: {
    title: string;
    url: string;
    timestamp: string;
    userAgent: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Example: E-commerce product scraper with advanced features
const productScraperDefinition: ScraperDefinition<string, ProductSearchResult> = {
  id: 'book-scraper',
  name: 'Book Scraper from books.toscrape.com',
  description: 'Scrapes book information from the demo site books.toscrape.com',
  url: 'https://books.toscrape.com/', // Targetting books.toscrape.com
  navigation: {
    type: 'direct',
    config: {},
  },
  waitStrategy: {
    type: 'selector',
    config: {
      selector: 'body',
    },
  },
  requiresCaptcha: false,
  
  // Custom hooks for advanced functionality
  hooks: {
    beforeRequest: [
      async (context: ScraperContext<string, ProductSearchResult>) => {
        context.log.info(`🔍 Starting product search for: ${context.input}`);
        
        // Set custom headers to appear more like a real browser
        await context.page.setExtraHTTPHeaders({
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        });
        
        
      },
    ],
    
    afterRequest: [
      async (context: ScraperContext<string, ProductSearchResult>) => {
        context.log.info(`✅ Completed product search for: ${context.input}`);
        
        // Save screenshot if enabled
        if (process.env.SAVE_SCREENSHOTS === 'true') {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const screenshotDir = path.join(__dirname, 'screenshots');
          fs.mkdirSync(screenshotDir, { recursive: true }); // Ensure directory exists
          await context.page.screenshot({
            path: path.join(screenshotDir, `product-search-${context.input}-${timestamp}.png`),
            fullPage: true,
          });
        }
      },
    ],
    
    onError: [
      async (context: ScraperContext<string, ProductSearchResult> & { error: Error }) => {
        context.log.error(`❌ Product search failed for: ${context.input}`, { message: context.error?.message });
        
        // Save error screenshot
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const screenshotDir = path.join(__dirname, 'screenshots');
          fs.mkdirSync(screenshotDir, { recursive: true }); // Ensure directory exists
          await context.page.screenshot({
            path: path.join(screenshotDir, `error-${context.input}-${timestamp}.png`),
            fullPage: true,
          });
        } catch (screenshotError: any) {
          context.log.warn('Failed to save error screenshot:', { message: screenshotError?.message });
        }
      },
    ],
    
    onRetry: [
      async (context: ScraperContext<string, ProductSearchResult> & { attempt: number }) => {
        context.log.info(`🔄 Retrying product search for: ${context.input} (attempt ${context.attempt})`);
        
        // Clear cookies and local storage on retry
        await context.page.context().clearCookies();
        await context.page.evaluate(() => {
          if (typeof localStorage !== 'undefined') {
            localStorage.clear();
          }
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
          }
        });
        
        // Wait a bit longer between retries
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
    ],
  },
  
  parse: async (context: ScraperContext<string, ProductSearchResult>): Promise<ProductSearchResult> => {
    const { page, input, log } = context; // Assuming context.log is available
    
    try {
      log.info(`Navigating to ${productScraperDefinition.url} for input: ${input}`);
      await page.goto(productScraperDefinition.url, { waitUntil: 'networkidle' });
      
      log.info('Parsing product data from books.toscrape.com');

      const products: Product[] = [];
      const productPods = await page.locator('article.product_pod').all();

      for (const pod of productPods) {
        const titleElement = pod.locator('h3 a');
        const name = await titleElement.getAttribute('title') || await titleElement.innerText();
        let productUrl = await titleElement.getAttribute('href') || '';
        if (!productUrl.startsWith('http')) {
          productUrl = new URL(productUrl, productScraperDefinition.url).toString();
        }

        const priceText = await pod.locator('.price_color').innerText();
        const currentPrice = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        const availabilityText = await pod.locator('.instock.availability').innerText();
        const availability = availabilityText.trim().toLowerCase() === 'in stock';

        const ratingClasses = await pod.locator('p.star-rating').getAttribute('class');
        let ratingAverage = 0;
        if (ratingClasses) {
          const ratingMap: { [key: string]: number } = { 'One': 1, 'Two': 2, 'Three': 3, 'Four': 4, 'Five': 5 };
          const ratingWord = ratingClasses.split(' ').find(cls => ratingMap[cls]);
          if (ratingWord) ratingAverage = ratingMap[ratingWord];
        }

        const imageRelativeUrl = await pod.locator('.image_container img').getAttribute('src') || '';
        const imageUrl = imageRelativeUrl ? new URL(imageRelativeUrl, productScraperDefinition.url).toString() : '';

        products.push({
          id: name.replace(/\s+/g, '-').toLowerCase(), // Simple ID generation
          name,
          price: {
            current: currentPrice,
            currency: 'GBP', // Site uses GBP
          },
          rating: {
            average: ratingAverage,
            count: 0, // Review count not easily available on main page
          },
          availability,
          images: [imageUrl],
          url: productUrl,
          category: await page.locator('.page-header.action h1').innerText() || 'Books', // Category from page title
          description: `Book: ${name}`, // Simple description
        });
      }
      
      const pageTitle = await page.title();
      const metadata = {
        title: pageTitle,
        url: page.url(),
        timestamp: new Date().toISOString(),
        userAgent: await page.evaluate(() => navigator.userAgent),
      };

      // Pagination (simplified for this example, books.toscrape has 'next' button)
      const nextButton = page.locator('li.next a');
      const hasMore = await nextButton.count() > 0;
      const currentPageText = await page.locator('li.current').innerText().catch(() => "Page 1 of 1");
      const match = currentPageText.match(/Page (\d+) of (\d+)/);
      const currentPage = match ? parseInt(match[1], 10) : 1;
      const totalPages = match ? parseInt(match[2], 10) : 1;
      
      return {
        searchQuery: input, // input might be a category to navigate to in a fuller example
        products,
        totalFound: products.length, // On this page; total site count needs deeper scraping
        metadata,
        pagination: {
          currentPage,
          totalPages,
          hasMore,
        },
      };
    } catch (error: any) {
      log.error('Error during parsing books.toscrape.com:', { message: error.message, stack: error.stack });
      throw error; // Re-throw to allow onError hook to catch it
    }
  },
  
  // Input validation
  validateInput: (input: string) => {
    if (!input || input.trim().length === 0) {
      return 'Search query cannot be empty';
    }
    if (input.length > 100) {
      return 'Search query too long (max 100 characters)';
    }
    if (input.includes('<') || input.includes('>')) {
      return 'Search query contains invalid characters';
    }
    return true;
  },
  
  // Output validation
  validateOutput: (output: any) => {
    if (!output || typeof output !== 'object') {
      return 'Output must be an object';
    }
    if (!Array.isArray(output.products)) {
      return 'Output must contain products array';
    }
    if (!output.metadata || !output.metadata.timestamp) {
      return 'Output must contain metadata with timestamp';
    }
    return true;
  },
  
  options: {
    retries: 5,
    timeout: 60000,
    loadImages: false,
    viewport: { width: 1920, height: 1080 },
  },
};

async function main() {
  // Create logger
  const logger = createLogger({
    level: 'info',
    format: 'text',
    console: true,
  });
  
  // Create advanced configuration
  const config = createConfig()
    .browserPool({
      maxSize: 5,
      maxAge: 30 * 60 * 1000, // 30 minutes
      launchOptions: {
        headless: process.env.HEADLESS !== 'false',
        timeout: 30000,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    })
    .defaultOptions({
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
    })
    .logging({
      level: 'info',
      format: 'text',
    })
    .build();

  // Initialize engine with the specific config and logger
  const engine = new CrawleeScraperEngine(config, logger);
  
  // Install plugins
  logger.info('📦 Installing plugins...');
  engine.use(new RetryPlugin({ 
    maxBackoffDelay: 30000,
    backoffMultiplier: 2,
  }));
  
  engine.use(new CachePlugin({ 
    defaultTtl: 10 * 60 * 1000, // 10 minutes cache
  }));
  
  const metricsPlugin = new MetricsPlugin();
  engine.use(metricsPlugin);
  
  // Register scraper
  engine.register(productScraperDefinition);
  
  try {
    const searchQuery = process.argv[2] || 'fiction'; // Example: 'fiction' category for books.toscrape
    logger.info(`🛍️ Searching for books (input: ${searchQuery})`);
    
    const startTime = Date.now();
    // The current parse function scrapes the main page.
    // A more advanced version could use 'searchQuery' to navigate to a category.
    const result = await engine.execute(productScraperDefinition, searchQuery);
    const duration = Date.now() - startTime;
    
    if (result.success && result.data) {
      logger.info(`\n🎉 Successfully scraped ${result.data.totalFound} books in ${duration}ms from ${result.data.metadata.url}`);
      
      // Display products
      result.data.products.slice(0, 5).forEach((product: Product, index: number) => {
        logger.info(`\n${index + 1}. ${product.name}`);
        logger.info(`   💰 Price: ${product.price.currency} ${product.price.current}`);
        if (product.price.discount) {
          logger.info(`   🏷️ Discount: ${product.price.discount}%`);
        }
        logger.info(`   ⭐ Rating: ${product.rating.average}/5`); // Removed count as it's not on main page
        // logger.info(`   🏪 Brand: ${product.brand || 'N/A'}`); // Brand not applicable for books
        logger.info(`   📦 Available: ${product.availability ? 'Yes' : 'No'}`);
        logger.info(`   🔗 URL: ${product.url}`);
      });
      
      if (result.data.totalFound > 5) {
        logger.info(`\n... and ${result.data.totalFound - 5} more products`);
      }
      
      // Show pagination info
      if (result.data.pagination.totalPages > 1) {
        logger.info(`\n📄 Page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages}`);
      }
      
    } else {
      logger.error('❌ Product search failed:', { message: result.error?.message });
    }
    
    // Show metrics
    logger.info('\n📊 Performance Metrics:');
    const metrics = metricsPlugin.getMetrics();
    logger.info(`   Total Requests: ${metrics.totalRequests}`);
    logger.info(`   Successful: ${metrics.successfulRequests}`);
    logger.info(`   Failed: ${metrics.failedRequests}`);
    logger.info(`   Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%`);
    logger.info(`   Average Duration: ${metrics.averageDuration.toFixed(0)}ms`);
    
  } catch (error: any) {
    logger.error('💥 Unexpected error:', { message: error?.message, stack: error?.stack });
  } finally {
    await engine.shutdown();
    logger.info('\n🔚 Engine shutdown complete');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { productScraperDefinition };

