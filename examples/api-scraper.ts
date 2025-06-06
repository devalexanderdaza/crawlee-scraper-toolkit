import {
  CrawleeScraperEngine,
  ScraperDefinition,
  createConfig,
  createLogger,
  ScraperContext,
} from '../src'; // Assuming 'src' is the root of compiled sources or use 'crawlee-scraper-toolkit'

// Define the expected structure of the API response (e.g., a User)
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// Define the output of this scraper
interface ApiScraperOutput {
  userId: number;
  userName: string;
  userEmail: string;
  companyName: string;
}

const apiScraperDefinition: ScraperDefinition<string, ApiScraperOutput> = {
  id: 'api-user-scraper',
  name: 'User API Scraper',
  description: 'Scrapes user data by intercepting an API call to jsonplaceholder.typicode.com',
  // We will navigate to the base URL and intercept the specific API call for a user.
  url: 'https://jsonplaceholder.typicode.com/',
  navigation: {
    type: 'direct',
    config: {},
  },
  waitStrategy: {
    // Wait for a short period or a specific element if the page had content.
    // For API interception, this might be less critical if interception is set up early.
    type: 'timeout',
    config: { duration: 1000 }
  },
  requiresCaptcha: false,
  parse: async (context: ScraperContext<string, ApiScraperOutput>): Promise<ApiScraperOutput> => {
    const { page, input: userIdInput, log } = context; // input will be the user ID, e.g., "1"

    const userId = userIdInput || '1'; // Default to user 1 if no input
    const targetApiUrl = `https://jsonplaceholder.typicode.com/users/${userId}`;
    log.info(`Attempting to scrape user data for ID: ${userId} by intercepting ${targetApiUrl}`);

    let capturedData: User | null = null;

    // Set up interception
    // We need to await the promise returned by page.route
    await page.route(targetApiUrl, async (route, request) => {
      log.info(`Intercepted request to: ${request.url()}`);
      try {
        // Fetch the original response
        const response = await route.fetch();
        // Try to parse it as JSON
        capturedData = await response.json() as User;
        log.info(`Successfully captured and parsed JSON response for user ID: ${userId}`);
        // Fulfill the route with the (potentially modified or original) response
        // This ensures the browser navigation completes as expected.
        await route.fulfill({ response });
      } catch (e: any) {
        log.error(`Error during request/response interception for ${targetApiUrl}: ${e.message}`, { error: e });
        // Abort the request if any step fails, so the page.goto() doesn't hang indefinitely on a failed interception
        if (!route.ishandled()) { // Check if route is already handled (e.g. fulfilled/aborted)
          await route.abort();
        }
      }
    });

    // Navigate to a page that would trigger the API call or the API base URL.
    // For this example, navigating to the base URL is enough to keep the browser context alive
    // while the interception for the specific API URL does its work.
    // If the API call was triggered by a button click on this page, we'd do that here.
    // Since we're navigating to the API's domain, and then intercepting a more specific path,
    // we can also directly navigate to the targetApiUrl if it's a GET request.
    // However, to clearly demonstrate page.route, navigating to base and intercepting is fine.

    // Let's try navigating directly to the API URL to trigger the interception.
    // This also means the browser will try to render the JSON if not intercepted and modified.
    log.info(`Navigating page to ${targetApiUrl} to trigger interception (if not already done by other means).`);
    try {
      await page.goto(targetApiUrl, { waitUntil: 'networkidle', timeout: 10000 });
    } catch (gotoError: any) {
      // If goto fails (e.g. because route was already handled and fulfilled, or aborted)
      // and we have data, it might be okay. Or it might indicate an issue.
      log.warn(`Navigation to ${targetApiUrl} faced an issue (might be expected if route handled): ${gotoError.message}`);
    }


    if (!capturedData) {
      throw new Error(`Failed to capture data for user ID: ${userId}. Check interception logic and network activity.`);
    }

    return {
      userId: capturedData.id,
      userName: capturedData.name,
      userEmail: capturedData.email,
      companyName: capturedData.company.name,
    };
  },
  options: {
    retries: 2,
    timeout: 20000, // Timeout for the entire scraping process
  },
};

// --- Main execution (similar to other examples) ---
// Define a logger accessible to this module
const logger = createLogger({ level: 'info', format: 'text', console: true });

async function main() {
  const config = createConfig()
    .defaultOptions({
      retries: 2,
      timeout: 25000,
    })
    .logging({ level: 'info', format: 'text' })
    .build();

  const engine = new CrawleeScraperEngine(config, logger);
  engine.register(apiScraperDefinition);

  try {
    const inputUserId = process.argv[2] || '1'; // Default to user 1, pass ID as CLI arg
    logger.info(`🚀 Starting API scraper for user ID: ${inputUserId}`);

    const result = await engine.execute(apiScraperDefinition, inputUserId);

    if (result.success && result.data) {
      logger.info('✅ API Scraper executed successfully:');
      logger.info(`   User ID: ${result.data.userId}`);
      logger.info(`   Name: ${result.data.userName}`);
      logger.info(`   Email: ${result.data.userEmail}`);
      logger.info(`   Company: ${result.data.companyName}`);
    } else {
      logger.error('❌ API Scraper failed:', { message: result.error?.message });
    }
  } catch (error: any) {
    logger.error('💥 Unexpected error in main execution:', { message: error.message, stack: error.stack });
  } finally {
    await engine.shutdown();
    logger.info('🔚 Engine shutdown complete.');
  }
}

if (require.main === module) {
  main();
}

export { apiScraperDefinition };
