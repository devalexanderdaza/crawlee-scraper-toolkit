import { CrawleeScraperEngine } from '../../src/core/scraper';
import { ProxyPlugin } from '../../src/plugins';
import { ScraperDefinition, ScraperExecutionOptions, Logger, ScraperEngineConfig, BrowserPoolConfig, ScraperContext } from '../../src/core/types';
import { Browser, BrowserContext, Page } from 'playwright'; // Import actual Playwright types for mocking

// Minimal logger implementation for tests
const mockLogger: Logger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Minimal ScraperEngineConfig
const mockEngineConfig: ScraperEngineConfig = {
  browserPool: {
    maxSize: 1,
    maxAge: 300000,
    launchOptions: { headless: true, args: [], timeout: 30000 },
    cleanupInterval: 60000,
  } as BrowserPoolConfig,
  defaultOptions: {
    retries: 0,
    retryDelay: 1000,
    timeout: 30000,
    useProxyRotation: false,
    headers: {},
    userAgent: 'TestScraper',
    javascript: true,
    loadImages: false,
    viewport: { width: 1280, height: 720 },
  } as ScraperExecutionOptions,
  plugins: [],
  globalHooks: {},
  logging: { level: 'debug', format: 'text' },
};

// Mock BrowserInstance, Browser, BrowserContext, Page from Playwright
const mockPage = {
  goto: jest.fn().mockResolvedValue(null),
  setViewportSize: jest.fn().mockResolvedValue(null),
  setExtraHTTPHeaders: jest.fn().mockResolvedValue(null),
  // Add other methods if the scraper execution calls them before newContext is checked
  url: () => 'http://example.com', // Mock URL method
} as unknown as Page;

const mockBrowserContext = {
  newPage: jest.fn().mockResolvedValue(mockPage),
  close: jest.fn().mockResolvedValue(null),
  pages: jest.fn(() => [mockPage]), // Mock pages method
} as unknown as BrowserContext;

const mockBrowser = {
  newContext: jest.fn().mockResolvedValue(mockBrowserContext),
  close: jest.fn().mockResolvedValue(null),
  // Add other browser methods if necessary
} as unknown as Browser;

const mockBrowserInstance = {
  id: 'test-instance',
  browser: mockBrowser,
  context: mockBrowserContext, // Default context
  page: mockPage, // Default page from default context
  lastUsed: Date.now(),
  inUse: false,
  createdAt: Date.now(),
};

describe('ProxyPlugin Integration with ScraperEngine', () => {
  let engine: CrawleeScraperEngine;

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Mock the browser pool used by the engine
    const mockBrowserPool = {
      acquire: jest.fn().mockResolvedValue(mockBrowserInstance),
      release: jest.fn().mockResolvedValue(null),
      shutdown: jest.fn().mockResolvedValue(null),
    };

    engine = new CrawleeScraperEngine(mockEngineConfig, mockLogger);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (engine as any).browserPool = mockBrowserPool; // Override the browserPool with our mock
  });

  test('should use proxyUrl from executionOptions to create a new browser context', async () => {
    const proxyServerUrl = 'http://user:pass@fake-proxy.com:8080';
    const proxyPlugin = new ProxyPlugin([proxyServerUrl]); // Plugin can be configured but its direct effect is not tested here
    engine.use(proxyPlugin); // Install plugin

    const testScraper: ScraperDefinition<string, { ip: string }> = {
      id: 'proxy-test-scraper',
      name: 'Proxy Test Scraper',
      url: 'https://httpbin.org/ip', // Target URL, though request won't actually go through the real proxy in this test
      navigation: { type: 'direct', config: {} },
      waitStrategy: { type: 'timeout', config: { duration: 100 } }, // Minimal wait
      async parse(context: ScraperContext<string, { ip: string }>) {
        // In this test, parse won't be reached with actual proxy data.
        // The assertion is on newContext call.
        // However, we can check if the proxyUrl was passed to context.options
        expect(context.options.proxyUrl).toBe(proxyServerUrl);
        return { ip: 'parsed-ip-irrelevant-for-this-spy-test' };
      },
      requiresCaptcha: false,
    };

    // Execution options that will be passed to the engine's execute method
    const executionOpts: Partial<ScraperExecutionOptions> = {
      // If useProxyRotation is true, ProxyPlugin will set proxyUrl
      // If we want to test the engine's direct use of proxyUrl, set it here.
      // Let's assume ProxyPlugin sets it.
      useProxyRotation: true, // This will make ProxyPlugin set the proxyUrl
    };

    // Spy on the newContext method of the mock browser instance
    // This is already mocked as mockBrowser.newContext, so we just check its call.

    await engine.execute(testScraper, 'test-input', executionOpts);

    // Verify that browser.newContext was called with the proxy settings
    // This happens because we modified CrawleeScraperEngine to create a new context if proxyUrl is set
    expect(mockBrowser.newContext).toHaveBeenCalledWith(
      expect.objectContaining({
        proxy: {
          server: proxyServerUrl,
        },
      })
    );

    // Also verify that the original page from the pool (from the default context) was not used for goto
    // if a proxy was set (meaning a new page from new context should be used)
    // This part is a bit tricky as goto is on the page.
    // We check if the newPage method of the temp context was called.
    expect(mockBrowserContext.newPage).toHaveBeenCalledTimes(1); // newPage on the temp context

    // And the goto on the page from that temp context was called
    // (mockPage is returned by mockBrowserContext.newPage)
    expect(mockPage.goto).toHaveBeenCalledWith(testScraper.url, expect.anything());

  });
});
