import { Page, Browser, BrowserContext } from 'playwright';
import { EventEmitter } from 'eventemitter3';

/**
 * Configuration for browser pool
 */
export interface BrowserPoolConfig {
  /** Maximum number of browser instances in the pool */
  maxSize: number;
  /** Maximum age of browser instances in milliseconds before they are recycled. */
  maxAge: number;
  /**
   * Browser launch options for Playwright.
   * @see https://playwright.dev/docs/api/class-browsertype#browser-type-launch
   */
  launchOptions: {
    /** Whether to run the browser in headless mode. Defaults to true. */
    headless: boolean;
    /** Additional arguments to pass to the browser instance. */
    args: string[];
    /** Maximum time in milliseconds to wait for the browser instance to start. Defaults to 30000 (30 seconds). */
    timeout: number;
  };
  /** Interval in milliseconds at which to check for and clean up old/unused browser instances. */
  cleanupInterval: number;
}

/**
 * Browser instance in the pool
 */
export interface BrowserInstance {
  id: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  lastUsed: number;
  inUse: boolean;
  createdAt: number;
}

/**
 * Represents the version details of the scraper toolkit.
 * This can include information about the toolkit version, dependencies, and development dependencies.
 */
export interface ToolkitVersionDetails {
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

/**
 * Scraper execution options
 */
export interface ScraperExecutionOptions {
  /** Number of retry attempts */
  retries: number;
  /** Delay between retries in milliseconds */
  retryDelay: number;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Whether to use proxy rotation */
  useProxyRotation: boolean;
  /** Custom headers */
  headers: Record<string, string>;
  /** User agent string */
  userAgent: string;
  /** Whether to enable JavaScript */
  javascript: boolean;
  /** Whether to load images during page navigation. Defaults to false. */
  loadImages: boolean;
  /** URL of the proxy server to use for requests. */
  proxyUrl?: string;
  /**
   * Viewport configuration for the browser page.
   * @see https://playwright.dev/docs/api/class-page#page-set-viewport-size
   */
  viewport: {
    /** Viewport width in pixels. */
    width: number;
    /** Viewport height in pixels. */
    height: number;
  };
}

/**
 * Defines the types of hooks available in the scraper lifecycle.
 * - `beforeRequest`: Executed before a scraping request is made (e.g., before navigation).
 * - `afterRequest`: Executed after a scraping request has completed, regardless of success or failure.
 * - `onSuccess`: Executed only if the `parse` function completes successfully and returns data.
 * - `onError`: Executed if any error occurs during the scraping process (navigation, parsing, etc.).
 * - `onRetry`: Executed before a retry attempt is made after a failure.
 */
export type ScraperHook = 'beforeRequest' | 'afterRequest' | 'onSuccess' | 'onError' | 'onRetry';

/**
 * Defines the signature for a hook handler function.
 * @template Input The type of the input data for the scraper.
 * @template Output The type of the output data from the scraper's parse function.
 * @param context The scraper context, providing access to input, page, options, etc.
 */
export type HookHandler<Input = unknown, Output = unknown> = (
  context: ScraperContext<Input, Output>
) => Promise<void> | void;

/**
 * Context object passed to the `parse` function and to all hook handlers.
 * It provides access to the current scraping state and resources.
 * @template Input The type of the input data for the scraper.
 * @template Output The type of the output data from the scraper's parse function.
 */
export interface ScraperContext<Input = unknown, Output = unknown> {
  /** The input data provided for the current scraping task. */
  input: Input;
  /** The Playwright `Page` object for interacting with the browser. */
  page: Page;
  /** The current attempt number for this scraping task (1 for first attempt, 2 for first retry, etc.). */
  attempt: number;
  /** Timestamp (ms since epoch) when the current scraping attempt started. */
  startTime: number;
  /** The execution options applicable to the current scraping task. */
  options: ScraperExecutionOptions;
  /** A key-value store for sharing custom data between hooks or within a scraping lifecycle. */
  metadata: Record<string, unknown>;
  /**
   * The result from the `parse` function. Available in `afterRequest` and `onSuccess` hooks if parsing was successful.
   * Potentially available in `onError` if error occurred after parsing.
   */
  result?: Output;
  /**
   * The error object if an error occurred. Available in `onError` and `afterRequest` hooks if an error was thrown.
   * Also available in `onRetry` hook.
   */
  error?: Error;
  /** Logger instance for logging within the scraper context, e.g., in parse function or hooks. */
  log: Logger; // Assuming Logger is defined elsewhere or will be added.
}

/**
 * Defines the strategy for navigating to the target URL(s).
 * - `direct`: Directly navigates to the provided URL.
 * - `form`: Interacts with a form (filling fields, submitting) to reach target content.
 * - `api`: Primarily focuses on intercepting or making API calls, browser navigation might be secondary.
 * - `custom`: A user-defined navigation logic.
 */
export interface NavigationStrategy {
  /** The type of navigation strategy to employ. */
  type: 'direct' | 'form' | 'api' | 'custom';
  /** Configuration object specific to the chosen navigation `type`. */
  config: Record<string, unknown>;
}

/**
 * Defines the strategy for determining when a page is considered "ready" after navigation
 * or an action, before proceeding with parsing or further interactions.
 * - `selector`: Waits for a specific DOM selector to be present and visible.
 * - `response`: Waits for a specific network response (e.g., an API call).
 * - `timeout`: Waits for a fixed duration.
 * - `custom`: A user-defined wait logic.
 */
export interface WaitStrategy {
  /** The type of wait strategy to employ. */
  type: 'selector' | 'response' | 'timeout' | 'custom';
  /** Configuration object specific to the chosen wait `type`. */
  config: Record<string, unknown>;
}

/**
 * Defines the structure and behavior of a scraper.
 * @template Input The type of the input data this scraper expects.
 * @template Output The type of the data this scraper is expected to output after parsing.
 */
export interface ScraperDefinition<Input = unknown, Output = unknown> {
  /** Unique identifier for the scraper */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what this scraper does */
  description?: string;
  /** Base URL or URL template */
  url: string;
  /** Navigation strategy */
  navigation: NavigationStrategy;
  /** Wait strategy */
  waitStrategy: WaitStrategy;
  /** Parse function to extract data */
  parse: (context: ScraperContext<Input, Output>) => Promise<Output>;
  /** Validation function for input */
  validateInput?: (input: Input) => boolean | string;
  /** Validation function for output */
  validateOutput?: (output: Output) => boolean | string;
  /** Whether this scraper requires CAPTCHA solving */
  requiresCaptcha: boolean;
  /**
   * Rate limiting configuration for this specific scraper.
   * Overrides global rate limit settings if provided.
   */
  rateLimit?: {
    /** Maximum number of requests allowed within the specified period. */
    requests: number;
    /** Time period in milliseconds during which the request limit applies. */
    period: number;
  };
  /** Custom execution options specific to this scraper. Merged with global/profile options. */
  options?: Partial<ScraperExecutionOptions>;
  /**
   * Scraper-specific lifecycle hooks.
   * Keys are hook names (`ScraperHook`), and values are arrays of `HookHandler` functions.
   * These hooks are executed in addition to any global hooks.
   */
  hooks?: Partial<Record<ScraperHook, HookHandler<Input, Output>[]>>;
  /** Tags for categorizing or filtering scrapers. */
  tags?: string[];
  /** Version of the scraper definition */
  version?: string;
}

/**
 * Scraper execution result
 */
export interface ScraperResult<Output = unknown> {
  /** Indicates whether the scraping task was successful. */
  success: boolean;
  /** The scraped data, if successful. Matches the `Output` type of the `ScraperDefinition`. */
  data?: Output;
  /** The error object, if the scraping task failed. */
  error?: Error;
  /** The total number of attempts made for this task (including retries). */
  attempts: number;
  /** The total duration of the scraping task in milliseconds. */
  duration: number;
  /** Metadata associated with the scraper execution. */
  metadata: {
    /** The ID of the scraper definition used. */
    scraperId: string;
    /** Timestamp (ms since epoch) when the scraping task was initiated. */
    timestamp: number;
    /** The User-Agent string used for the requests. */
    userAgent: string;
    /** The final URL from which data was parsed (or attempted). */
    url: string;
  };
}

/**
 * Defines the interface for a ScraperPlugin.
 * Plugins can extend the functionality of the ScraperEngine,
 * for example, by adding new methods, hooks, or modifying behavior.
 */
export interface ScraperPlugin {
  /** The unique name of the plugin. */
  name: string;
  /** The version of the plugin (e.g., semver string). */
  version: string;
  /**
   * Called when the plugin is installed via `engine.use(plugin)`.
   * This method should implement the plugin's setup logic, such as
   * registering global hooks, modifying engine properties, etc.
   * @param engine The instance of the ScraperEngine.
   */
  install: (engine: ScraperEngine) => void;
  /**
   * Optional method called if the plugin system supports uninstallation.
   * Should clean up any resources or modifications made by the `install` method.
   * @param engine The instance of the ScraperEngine.
   */
  uninstall?: (engine: ScraperEngine) => void;
}

/**
 * Defines the structure of events emitted by the ScraperEngine.
 * Consumers can listen to these events using `engine.on('eventName', handler)`.
 */
export interface ScraperEvents {
  /** Emitted when a scraper execution starts. Payload includes scraper ID and input. */
  'scraper:start': { scraperId: string; input: unknown };
  /** Emitted when a scraper execution succeeds. Payload includes scraper ID and the result. */
  'scraper:success': { scraperId: string; result: ScraperResult };
  /** Emitted when a scraper execution fails. Payload includes scraper ID and the error. */
  'scraper:error': { scraperId: string; error: Error };
  /** Emitted when a scraper execution attempt is being retried. Payload includes scraper ID and attempt number. */
  'scraper:retry': { scraperId: string; attempt: number; error: Error };
  /** Emitted when a browser instance is acquired from the pool. Payload includes instance ID. */
  'pool:acquire': { instanceId: string };
  /** Emitted when a browser instance is released back to the pool. Payload includes instance ID. */
  'pool:release': { instanceId: string };
  /** Emitted when the browser pool performs a cleanup operation. Payload includes number of removed instances. */
  'pool:cleanup': { removedInstances: number };
}

/**
 * Defines the core interface for the scraper engine.
 * It is responsible for managing scraper definitions, plugins, hooks,
 * and executing scraping tasks. It also emits events related to the scraping lifecycle.
 */
export interface ScraperEngine extends EventEmitter<ScraperEvents> {
  /** Execute a scraper with given input */
  execute<Input, Output>(
    definition: ScraperDefinition<Input, Output>,
    input: Input,
    options?: Partial<ScraperExecutionOptions>
  ): Promise<ScraperResult<Output>>;

  /** Register a scraper definition */
  register<Input, Output>(definition: ScraperDefinition<Input, Output>): void;

  /** Get a registered scraper definition */
  getDefinition(id: string): ScraperDefinition | undefined;

  /** List all registered scrapers */
  listDefinitions(): ScraperDefinition[];

  /** Install a plugin */
  use(plugin: ScraperPlugin): void;

  /** Add a global hook */
  addHook(hook: ScraperHook, handler: HookHandler): void;

  /** Remove a global hook */
  removeHook(hook: ScraperHook, handler: HookHandler): void;

  /** Shutdown the engine and cleanup resources */
  shutdown(): Promise<void>;
}

/**
 * Configuration for the scraper engine
 */
export interface ScraperEngineConfig {
  browserPool: BrowserPoolConfig;
  defaultOptions: ScraperExecutionOptions;
  /** List of plugin names or paths to be automatically installed upon engine initialization. */
  plugins: string[];
  /**
   * Global lifecycle hooks to be applied to all scrapers.
   * Keys are hook names (`ScraperHook`), and values are arrays of `HookHandler` functions.
   */
  globalHooks: Partial<Record<ScraperHook, HookHandler[]>>;
  /** Configuration for the engine's logger. */
  logging: {
    /** Minimum log level to output. */
    level: 'debug' | 'info' | 'warn' | 'error';
    /** Format of the log output. */
    format: 'json' | 'text';
  };
}

/**
 * Represents a logger instance that can be used throughout the toolkit.
 * This interface is compatible with common loggers like Winston or pino.
 */
export interface Logger {
  debug: (message: string, ...meta: unknown[]) => void;
  info: (message: string, ...meta: unknown[]) => void;
  warn: (message: string, ...meta: unknown[]) => void;
  error: (message: string, ...meta: unknown[]) => void;
}
