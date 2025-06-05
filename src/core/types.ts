import { Page, Browser, BrowserContext } from 'playwright';
import { EventEmitter } from 'eventemitter3';

/**
 * Configuration for browser pool
 */
export interface BrowserPoolConfig {
  /** Maximum number of browser instances in the pool */
  maxSize: number;
  /** Maximum age of browser instances in milliseconds */
  maxAge: number;
  /** Browser launch options */
  launchOptions: {
    headless: boolean;
    args: string[];
    timeout: number;
  };
  /** Cleanup interval in milliseconds */
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
  userAgent?: string;
  /** Whether to enable JavaScript */
  javascript: boolean;
  /** Whether to load images */
  loadImages: boolean;
  /** Viewport configuration */
  viewport: {
    width: number;
    height: number;
  };
}

/**
 * Scraper hook types
 */
export type ScraperHook = 'beforeRequest' | 'afterRequest' | 'onError' | 'onRetry' | 'onSuccess';

/**
 * Hook handler function
 */
export type HookHandler<T = unknown> = (context: ScraperContext<T>) => Promise<void> | void;

/**
 * Scraper context passed to hooks and parse function
 */
export interface ScraperContext<Input = unknown, Output = unknown> {
  input: Input;
  page: Page;
  attempt: number;
  startTime: number;
  options: ScraperExecutionOptions;
  metadata: Record<string, unknown>;
  result?: Output;
  error?: Error;
}

/**
 * Navigation strategy for different types of scrapers
 */
export interface NavigationStrategy {
  type: 'direct' | 'form' | 'api' | 'custom';
  config: Record<string, unknown>;
}

/**
 * Wait strategy for determining when page is ready
 */
export interface WaitStrategy {
  type: 'selector' | 'response' | 'timeout' | 'custom';
  config: Record<string, unknown>;
}

/**
 * Enhanced scraper definition with crawlee integration
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
  /** Rate limiting configuration */
  rateLimit?: {
    requests: number;
    period: number;
  };
  /** Custom execution options */
  options?: Partial<ScraperExecutionOptions>;
  /** Hooks for this scraper */
  hooks?: Partial<Record<ScraperHook, HookHandler[]>>;
  /** Tags for categorization */
  tags?: string[];
  /** Version of the scraper definition */
  version?: string;
}

/**
 * Scraper execution result
 */
export interface ScraperResult<Output = unknown> {
  success: boolean;
  data?: Output;
  error?: Error;
  attempts: number;
  duration: number;
  metadata: {
    scraperId: string;
    timestamp: number;
    userAgent: string;
    url: string;
  };
}

/**
 * Plugin interface for extending scraper functionality
 */
export interface ScraperPlugin {
  name: string;
  version: string;
  install: (scraper: ScraperEngine) => void;
  uninstall?: (scraper: ScraperEngine) => void;
}

/**
 * Event types emitted by the scraper engine
 */
export interface ScraperEvents {
  'scraper:start': { scraperId: string; input: unknown };
  'scraper:success': { scraperId: string; result: ScraperResult };
  'scraper:error': { scraperId: string; error: Error };
  'scraper:retry': { scraperId: string; attempt: number };
  'pool:acquire': { instanceId: string };
  'pool:release': { instanceId: string };
  'pool:cleanup': { removedInstances: number };
}

/**
 * Main scraper engine interface
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
  plugins: string[];
  globalHooks: Partial<Record<ScraperHook, HookHandler[]>>;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}
