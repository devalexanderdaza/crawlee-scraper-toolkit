import { EventEmitter } from 'eventemitter3';
import {
  ScraperEngine,
  ScraperDefinition,
  ScraperResult,
  ScraperExecutionOptions,
  ScraperContext,
  ScraperHook,
  HookHandler,
  ScraperPlugin,
  ScraperEvents,
  ScraperEngineConfig,
} from './types';
import { BrowserPool } from './browser-pool';
import { Logger } from '@/utils/logger';

// Helper interfaces for navigation configs
interface FormConfig {
  inputSelector?: string;
  submitSelector?: string;
}

interface SelectorConfig {
  selector?: string;
}

interface ResponseConfig {
  urlPattern?: string;
}

interface TimeoutConfig {
  duration?: number;
}

/**
 * Main scraper engine implementation
 */
export class CrawleeScraperEngine extends EventEmitter<ScraperEvents> implements ScraperEngine {
  private browserPool: BrowserPool;
  private logger: Logger;
  private config: ScraperEngineConfig;
  private definitions = new Map<string, ScraperDefinition<unknown, unknown>>();
  private plugins = new Map<string, ScraperPlugin>();
  private globalHooks = new Map<ScraperHook, HookHandler[]>();

  constructor(config: ScraperEngineConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.browserPool = new BrowserPool(config.browserPool, logger);
    this.initializeGlobalHooks();
  }

  /**
   * Execute a scraper with given input
   */
  async execute<Input, Output>(
    definition: ScraperDefinition<Input, Output>,
    input: Input,
    options?: Partial<ScraperExecutionOptions>
  ): Promise<ScraperResult<Output>> {
    const startTime = Date.now();
    const executionOptions = { ...this.config.defaultOptions, ...definition.options, ...options };

    this.logger.info('Starting scraper execution', {
      scraperId: definition.id,
      input: typeof input === 'string' ? input : '[object]',
    });

    this.emit('scraper:start', { scraperId: definition.id, input });

    // Validate input
    if (definition.validateInput) {
      const validation = definition.validateInput(input);
      if (validation !== true) {
        const error = new Error(`Input validation failed: ${validation}`);
        this.emit('scraper:error', { scraperId: definition.id, error });
        return this.createErrorResult<Output>(definition.id, error, 0, startTime);
      }
    }

    let lastError: Error | undefined;
    let attempts = 0;

    for (attempts = 1; attempts <= executionOptions.retries + 1; attempts++) {
      const instance = await this.browserPool.acquire();

      try {
        const context: ScraperContext<Input, Output> = {
          input,
          page: instance.page,
          attempt: attempts,
          startTime,
          options: executionOptions,
          metadata: {},
        };

        // Execute hooks and scraper logic
        await this.executeHooks('beforeRequest', context, definition);

        const result = await this.executeScraper(definition, context);

        context.result = result;
        await this.executeHooks('afterRequest', context, definition);
        await this.executeHooks('onSuccess', context, definition);

        // Validate output
        if (definition.validateOutput) {
          const validation = definition.validateOutput(result);
          if (validation !== true) {
            throw new Error(`Output validation failed: ${validation}`);
          }
        }

        const successResult = this.createSuccessResult(definition.id, result, attempts, startTime);
        this.emit('scraper:success', { scraperId: definition.id, result: successResult });

        return successResult;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        this.logger.warn('Scraper execution attempt failed', {
          scraperId: definition.id,
          attempt: attempts,
          error: lastError.message,
        });

        const context: ScraperContext<Input, Output> = {
          input,
          page: instance.page,
          attempt: attempts,
          startTime,
          options: executionOptions,
          metadata: {},
          error: lastError,
        };

        await this.executeHooks('onError', context, definition);

        if (attempts <= executionOptions.retries) {
          this.emit('scraper:retry', { scraperId: definition.id, attempt: attempts });
          await this.executeHooks('onRetry', context, definition);
          await this.delay(executionOptions.retryDelay);
        }
      } finally {
        this.browserPool.release(instance);
      }
    }

    if (lastError === undefined) {
      // This path should ideally not be reached if the loop logic ensures lastError is set on failure.
      // Creating a generic error to handle this unexpected state.
      const undefinedError = new Error(
        'Scraper execution failed, but no specific error was captured by lastError.'
      );
      this.logger.error(
        'Critical: lastError is undefined after retry loop. This may indicate a logic flaw.',
        {
          scraperId: definition.id,
        }
      );
      const errorResult = this.createErrorResult<Output>(
        definition.id,
        undefinedError,
        attempts - 1,
        startTime
      );
      this.emit('scraper:error', { scraperId: definition.id, error: undefinedError });
      return errorResult;
    }

    // If we reach here, lastError is defined and is of type Error due to the check above.
    const errorResult = this.createErrorResult<Output>(
      definition.id,
      lastError,
      attempts - 1,
      startTime
    );
    this.emit('scraper:error', { scraperId: definition.id, error: lastError });

    return errorResult;
  }

  /**
   * Register a scraper definition
   */
  register<Input, Output>(definition: ScraperDefinition<Input, Output>): void {
    this.logger.info('Registering scraper definition', { scraperId: definition.id });
    this.definitions.set(definition.id, definition as ScraperDefinition<unknown, unknown>);
  }

  /**
   * Get a registered scraper definition
   */
  getDefinition(id: string): ScraperDefinition | undefined {
    return this.definitions.get(id);
  }

  /**
   * List all registered scrapers
   */
  listDefinitions(): ScraperDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Install a plugin
   */
  use(plugin: ScraperPlugin): void {
    this.logger.info('Installing plugin', {
      name: plugin.name,
      version: plugin.version,
    });

    this.plugins.set(plugin.name, plugin);
    plugin.install(this);
  }

  /**
   * Add a global hook
   */
  addHook(hook: ScraperHook, handler: HookHandler): void {
    if (!this.globalHooks.has(hook)) {
      this.globalHooks.set(hook, []);
    }
    const handlers = this.globalHooks.get(hook);
    if (handlers) {
      handlers.push(handler);
    }
  }

  /**
   * Remove a global hook
   */
  removeHook(hook: ScraperHook, handler: HookHandler): void {
    const handlers = this.globalHooks.get(hook);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Shutdown the engine and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down scraper engine');

    // Uninstall plugins
    for (const plugin of this.plugins.values()) {
      if (plugin.uninstall) {
        plugin.uninstall(this);
      }
    }

    await this.browserPool.shutdown();
    this.logger.info('Scraper engine shutdown complete');
  }

  /**
   * Execute the actual scraper logic
   */
  private async executeScraper<Input, Output>(
    definition: ScraperDefinition<Input, Output>,
    context: ScraperContext<Input, Output>
  ): Promise<Output> {
    const { page, options } = context;

    // Set page options
    await page.setViewportSize(options.viewport);

    if (options.userAgent) {
      await page.setExtraHTTPHeaders({ 'User-Agent': options.userAgent });
    }

    if (Object.keys(options.headers).length > 0) {
      await page.setExtraHTTPHeaders(options.headers);
    }

    // Handle navigation based on strategy
    await this.handleNavigation(definition, context);

    // Handle waiting based on strategy
    await this.handleWaitStrategy(definition, context);

    // Execute the parse function
    return await definition.parse(context);
  }

  /**
   * Handle navigation based on the navigation strategy
   */
  private async handleNavigation<Input, Output>(
    definition: ScraperDefinition<Input, Output>,
    context: ScraperContext<Input, Output>
  ): Promise<void> {
    const { page, input } = context;
    const { navigation } = definition;

    switch (navigation.type) {
      case 'direct':
        await page.goto(definition.url, { timeout: context.options.timeout });
        break;

      case 'form': {
        await page.goto(definition.url, { timeout: context.options.timeout });
        const formConfig = navigation.config as FormConfig;

        if (formConfig.inputSelector) {
          await page.fill(formConfig.inputSelector, String(input));
        }

        if (formConfig.submitSelector) {
          await page.click(formConfig.submitSelector);
        }
        break;
      }

      case 'api': {
        // For API-based navigation, construct URL with parameters
        const url = this.buildApiUrl(definition.url, input, navigation.config);
        await page.goto(url, { timeout: context.options.timeout });
        break;
      }

      case 'custom':
        // Custom navigation logic should be handled in the parse function
        break;

      default:
        throw new Error(`Unknown navigation type: ${navigation.type}`);
    }
  }

  /**
   * Handle wait strategy
   */
  private async handleWaitStrategy<Input, Output>(
    definition: ScraperDefinition<Input, Output>,
    context: ScraperContext<Input, Output>
  ): Promise<void> {
    const { page, options } = context;
    const { waitStrategy } = definition;

    switch (waitStrategy.type) {
      case 'selector': {
        const selectorConfig = waitStrategy.config as SelectorConfig;
        if (selectorConfig.selector) {
          await page.waitForSelector(selectorConfig.selector, {
            timeout: options.timeout,
          });
        }
        break;
      }

      case 'response': {
        const responseConfig = waitStrategy.config as ResponseConfig;
        if (responseConfig.urlPattern) {
          await page.waitForResponse(
            response => response.url().includes(responseConfig.urlPattern ?? ''),
            { timeout: options.timeout }
          );
        }
        break;
      }

      case 'timeout': {
        const timeoutConfig = waitStrategy.config as TimeoutConfig;
        if (timeoutConfig.duration) {
          await page.waitForTimeout(timeoutConfig.duration);
        }
        break;
      }

      case 'custom':
        // Custom wait logic should be handled in the parse function
        break;

      default:
        throw new Error(`Unknown wait strategy type: ${waitStrategy.type}`);
    }
  }

  /**
   * Execute hooks for a specific event
   */
  private async executeHooks<Input, Output>(
    hook: ScraperHook,
    context: ScraperContext<Input, Output>,
    definition: ScraperDefinition<Input, Output>
  ): Promise<void> {
    // Execute global hooks
    const globalHandlers = this.globalHooks.get(hook) ?? [];
    for (const handler of globalHandlers) {
      try {
        await handler(context);
      } catch (error) {
        this.logger.warn('Global hook execution failed', {
          hook,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Execute definition-specific hooks
    const definitionHandlers = definition.hooks?.[hook] ?? [];
    for (const handler of definitionHandlers) {
      try {
        await handler(context);
      } catch (error) {
        this.logger.warn('Definition hook execution failed', {
          hook,
          scraperId: definition.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Build API URL with parameters
   */
  private buildApiUrl(baseUrl: string, input: unknown, config: Record<string, unknown>): string {
    if (config.paramName && typeof config.paramName === 'string' && typeof input === 'string') {
      const url = new URL(baseUrl);
      url.searchParams.set(config.paramName, input);
      return url.toString();
    }
    return baseUrl;
  }

  /**
   * Create success result
   */
  private createSuccessResult<Output>(
    scraperId: string,
    data: Output,
    attempts: number,
    startTime: number
  ): ScraperResult<Output> {
    return {
      success: true,
      data,
      attempts,
      duration: Date.now() - startTime,
      metadata: {
        scraperId,
        timestamp: Date.now(),
        userAgent: 'crawlee-scraper-toolkit',
        url: '',
      },
    };
  }

  /**
   * Create error result
   */
  private createErrorResult<Output = unknown>(
    scraperId: string,
    error: Error,
    attempts: number,
    startTime: number
  ): ScraperResult<Output> {
    return {
      success: false,
      error,
      attempts,
      duration: Date.now() - startTime,
      metadata: {
        scraperId,
        timestamp: Date.now(),
        userAgent: 'crawlee-scraper-toolkit',
        url: '',
      },
    };
  }

  /**
   * Initialize global hooks from config
   */
  private initializeGlobalHooks(): void {
    for (const [hook, handlers] of Object.entries(this.config.globalHooks)) {
      this.globalHooks.set(hook as ScraperHook, handlers || []);
    }
  }

  /**
   * Delay execution
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
