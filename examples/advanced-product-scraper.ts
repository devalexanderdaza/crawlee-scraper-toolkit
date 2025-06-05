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
  id: 'product-scraper',
  name: 'E-commerce Product Scraper',
  description: 'Scrapes product information from e-commerce sites',
  url: 'https://httpbin.org/json', // Using httpbin as a demo URL
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
      async (context: any) => {
        console.log(`🔍 Starting product search for: ${context.input}`);
        
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
      async (context: any) => {
        console.log(`✅ Completed product search for: ${context.input}`);
        
        // Save screenshot if enabled
        if (process.env.SAVE_SCREENSHOTS === 'true') {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await context.page.screenshot({
            path: `screenshots/product-search-${context.input}-${timestamp}.png`,
            fullPage: true,
          });
        }
      },
    ],
    
    onError: [
      async (context: any) => {
        console.error(`❌ Product search failed for: ${context.input}`, context.error?.message);
        
        // Save error screenshot
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          await context.page.screenshot({
            path: `screenshots/error-${context.input}-${timestamp}.png`,
            fullPage: true,
          });
        } catch (screenshotError) {
          console.warn('Failed to save error screenshot:', screenshotError);
        }
      },
    ],
    
    onRetry: [
      async (context: any) => {
        console.log(`🔄 Retrying product search for: ${context.input} (attempt ${context.attempt})`);
        
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
    const { page, input } = context;
    
    // For demo purposes, simulate API response since we can't use real e-commerce sites
    // In a real scenario, this would wait for actual API responses
    try {
      // Simulate waiting for API response by navigating to a demo page
      await page.goto('https://httpbin.org/json', { waitUntil: 'networkidle' });
      
      // Get the demo JSON response (we don't actually use it, just for demo)
      await page.textContent('body');
      
      // Create mock product data for demonstration
      const products: Product[] = Array.from({ length: 3 }, (_, i) => ({
        id: `product-${i + 1}`,
        name: `Sample Product ${i + 1} - ${input}`,
        price: {
          current: 99.99 + (i * 50),
          original: 149.99 + (i * 50),
          currency: 'USD',
          discount: 33,
        },
        rating: {
          average: 4.5 - (i * 0.1),
          count: 150 + (i * 25),
        },
        availability: true,
        images: [`https://example.com/image${i + 1}.jpg`],
        url: `https://example.com/product/${i + 1}`,
        brand: `Brand ${String.fromCharCode(65 + i)}`,
        category: 'Electronics',
        description: `High-quality product related to ${input} with excellent features and specifications.`,
      }));
      
      // Extract page metadata
      const metadata = await page.evaluate(() => ({
        title: document.title || 'Demo Page',
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }));
      
      return {
        searchQuery: input,
        products,
        totalFound: products.length,
        metadata,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
        },
      };
    } catch (error) {
      console.warn('Demo parsing fallback due to error:', error);
      
      // Fallback result for demo
      return {
        searchQuery: input,
        products: [],
        totalFound: 0,
        metadata: {
          title: 'Demo Failed',
          url: page.url(),
          timestamp: new Date().toISOString(),
          userAgent: 'Demo User Agent',
        },
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
        },
      };
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

  // Update the global config manager
  configManager.updateConfig(config);

  // Initialize engine with the configured manager
  const engine = new CrawleeScraperEngine(configManager.getConfig(), logger);
  
  // Install plugins
  console.log('📦 Installing plugins...');
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
    const searchQuery = process.argv[2] || 'laptop';
    console.log(`🛍️ Searching for products: ${searchQuery}`);
    
    const startTime = Date.now();
    const result = await engine.execute(productScraperDefinition, searchQuery);
    const duration = Date.now() - startTime;
    
    if (result.success && result.data) {
      console.log(`\n🎉 Successfully found ${result.data.totalFound} products in ${duration}ms`);
      
      // Display products
      result.data.products.slice(0, 5).forEach((product: Product, index: number) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   💰 Price: ${product.price.currency} ${product.price.current}`);
        if (product.price.discount) {
          console.log(`   🏷️ Discount: ${product.price.discount}%`);
        }
        console.log(`   ⭐ Rating: ${product.rating.average}/5 (${product.rating.count} reviews)`);
        console.log(`   🏪 Brand: ${product.brand || 'N/A'}`);
        console.log(`   📦 Available: ${product.availability ? 'Yes' : 'No'}`);
        console.log(`   🔗 URL: ${product.url}`);
      });
      
      if (result.data.totalFound > 5) {
        console.log(`\n... and ${result.data.totalFound - 5} more products`);
      }
      
      // Show pagination info
      if (result.data.pagination.totalPages > 1) {
        console.log(`\n📄 Page ${result.data.pagination.currentPage} of ${result.data.pagination.totalPages}`);
      }
      
    } else {
      console.error('❌ Product search failed:', result.error?.message);
    }
    
    // Show metrics
    console.log('\n📊 Performance Metrics:');
    const metrics = metricsPlugin.getMetrics();
    console.log(`   Total Requests: ${metrics.totalRequests}`);
    console.log(`   Successful: ${metrics.successfulRequests}`);
    console.log(`   Failed: ${metrics.failedRequests}`);
    console.log(`   Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%`);
    console.log(`   Average Duration: ${metrics.averageDuration.toFixed(0)}ms`);
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  } finally {
    await engine.shutdown();
    console.log('\n🔚 Engine shutdown complete');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { productScraperDefinition };

