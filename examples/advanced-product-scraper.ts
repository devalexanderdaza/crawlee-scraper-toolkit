import { 
  CrawleeScraperEngine, 
  ScraperDefinition, 
  createConfig,
  RetryPlugin,
  CachePlugin,
  MetricsPlugin,
  createLogger
} from 'crawlee-scraper-toolkit';

// Example: E-commerce product scraper with advanced features
const productScraperDefinition: ScraperDefinition<string, any> = {
  id: 'product-scraper',
  name: 'E-commerce Product Scraper',
  description: 'Scrapes product information from e-commerce sites',
  url: 'https://example-shop.com/search',
  navigation: {
    type: 'api',
    config: {
      paramName: 'q',
    },
  },
  waitStrategy: {
    type: 'response',
    config: {
      urlPattern: '/api/products',
    },
  },
  requiresCaptcha: false,
  
  // Custom hooks for advanced functionality
  hooks: {
    beforeRequest: [
      async (context) => {
        console.log(`🔍 Starting product search for: ${context.input}`);
        
        // Set custom headers to appear more like a real browser
        await context.page.setExtraHTTPHeaders({
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        });
        
        // Set a realistic user agent
        await context.page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
      },
    ],
    
    afterRequest: [
      async (context) => {
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
      async (context) => {
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
      async (context) => {
        console.log(`🔄 Retrying product search for: ${context.input} (attempt ${context.attempt})`);
        
        // Clear cookies and local storage on retry
        await context.page.context().clearCookies();
        await context.page.evaluate(() => {
          localStorage.clear();
          sessionStorage.clear();
        });
        
        // Wait a bit longer between retries
        await new Promise(resolve => setTimeout(resolve, 2000));
      },
    ],
  },
  
  parse: async (context) => {
    const { page, input } = context;
    
    // Wait for the API response
    const response = await page.waitForResponse(
      res => res.url().includes('/api/products') && res.status() === 200,
      { timeout: 30000 }
    );
    
    // Parse the API response
    const apiData = await response.json();
    
    // Process and structure the data
    const products = apiData.products?.map((product: any) => ({
      id: product.id,
      name: product.name || product.title,
      price: {
        current: product.price?.current || product.currentPrice,
        original: product.price?.original || product.originalPrice,
        currency: product.price?.currency || 'USD',
        discount: product.price?.discount || null,
      },
      rating: {
        average: product.rating?.average || product.averageRating,
        count: product.rating?.count || product.reviewCount,
      },
      availability: product.availability || product.inStock,
      images: product.images || [],
      url: product.url || product.productUrl,
      brand: product.brand,
      category: product.category,
      description: product.description?.substring(0, 500), // Limit description length
    })) || [];
    
    // Extract additional page metadata
    const metadata = await page.evaluate(() => ({
      title: document.title,
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
        currentPage: apiData.pagination?.currentPage || 1,
        totalPages: apiData.pagination?.totalPages || 1,
        hasMore: apiData.pagination?.hasMore || false,
      },
    };
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

  // Initialize engine
  const engine = new CrawleeScraperEngine(config, logger);
  
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
    
    if (result.success) {
      console.log(`\n🎉 Successfully found ${result.data.totalFound} products in ${duration}ms`);
      
      // Display products
      result.data.products.slice(0, 5).forEach((product: any, index: number) => {
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

