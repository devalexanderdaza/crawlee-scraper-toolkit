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
  Logger as ILogger, // Use ILogger to avoid conflict with local Logger class/var if any
} from './types';
import { BrowserPool } from './browser-pool';
import { Logger } from '@/utils/logger'; // This is likely the concrete logger implementation

// Helper interfaces for navigation configs (internal, no need for extensive JSDoc for public API)
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
 * @file Provides the core implementation of the ScraperEngine, orchestrating
 * the entire scraping lifecycle including browser management, hook execution,
 * plugin integration, and data parsing.
 */

/**
 * The main engine for managing and executing scrapers.
 * It handles the browser pool, plugin lifecycle, global and scraper-specific hooks,
 * and the overall execution flow of scraper definitions.
 * Emits various events throughout the scraping lifecycle (see {@link ScraperEvents}).
 */
export class CrawleeScraperEngine extends EventEmitter<ScraperEvents> implements ScraperEngine {
  private browserPool: BrowserPool;
  private logger: ILogger; // Use the imported ILogger type
  private config: ScraperEngineConfig;
  private definitions = new Map<string, ScraperDefinition<unknown, unknown>>();
  private plugins = new Map<string, ScraperPlugin>();
  private globalHooks = new Map<ScraperHook, HookHandler<unknown, unknown>[]>();

  /**
   * Creates an instance of the CrawleeScraperEngine.
   * @param config The configuration object for the scraper engine. See {@link ScraperEngineConfig}.
   * @param logger An instance of a logger conforming to the {@link ILogger} interface.
   */
  constructor(config: ScraperEngineConfig, logger: ILogger) {
    super();
    this.config = config;
    this.logger = logger;
    this.browserPool = new BrowserPool(config.browserPool, logger);
    this.initializeGlobalHooks();
    this.logger.info('CrawleeScraperEngine initialized.', { browserPoolConfig: config.browserPool.maxSize });
  }

  /**
   * Executes a registered scraper definition with the given input and runtime options.
   * This method orchestrates the entire scraping lifecycle for a single task, including:
   * - Input validation.
   * - Acquiring a browser instance from the pool.
   * - Executing `beforeRequest`, scraper `parse`, `afterRequest`, `onSuccess` hooks.
   * - Handling retries with `onRetry` hooks upon failure.
   * - Managing errors with `onError` hooks.
   * - Output validation.
   * - Releasing the browser instance.
   * Emits `scraper:start`, `scraper:success`, `scraper:error`, and `scraper:retry` events.
   *
   * @template Input The type of the input data the scraper expects.
   * @template Output The type of the data the scraper's `parse` function will return.
   * @param definition The {@link ScraperDefinition} to execute.
   * @param input The input data to pass to the scraper.
   * @param options Optional. Partial {@link ScraperExecutionOptions} that can override
   *                default and definition-specific options for this execution.
   * @returns A Promise that resolves to a {@link ScraperResult} containing the outcome of the execution.
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
   * Registers a scraper definition with the engine, making it available for execution.
   * If a definition with the same ID already exists, it will be overwritten.
   * @template Input The type of the input data the scraper definition expects.
   * @template Output The type of the data the scraper definition will output.
   * @param definition The {@link ScraperDefinition} to register.
   */
  register<Input, Output>(definition: ScraperDefinition<Input, Output>): void {
    this.logger.info('Registering scraper definition', { scraperId: definition.id });
    this.definitions.set(definition.id, definition as ScraperDefinition<unknown, unknown>);
  }

  /**
   * Retrieves a registered scraper definition by its ID.
   * @param id The unique identifier of the scraper definition.
   * @returns The {@link ScraperDefinition} if found, otherwise `undefined`.
   */
  getDefinition(id: string): ScraperDefinition | undefined {
    this.logger.debug('Retrieving scraper definition', { scraperId: id });
    return this.definitions.get(id);
  }

  /**
   * Lists all currently registered scraper definitions.
   * @returns An array of {@link ScraperDefinition} objects.
   */
  listDefinitions(): ScraperDefinition[] {
    this.logger.debug('Listing all scraper definitions');
    return Array.from(this.definitions.values());
  }

  /**
   * Installs a plugin, allowing it to extend the engine's functionality.
   * The plugin's `install` method will be called with this engine instance.
   * @param plugin The {@link ScraperPlugin} instance to install.
   */
  use(plugin: ScraperPlugin): void {
    this.logger.info('Installing plugin', {
      name: plugin.name,
      version: plugin.version,
    });

    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin "${plugin.name}" is already installed. Re-installing.`);
      // Optionally, call uninstall on the existing plugin if it exists and supports it
      const existingPlugin = this.plugins.get(plugin.name);
      if (existingPlugin?.uninstall) {
        try {
          existingPlugin.uninstall(this);
        } catch (error) {
          this.logger.error(`Error uninstalling existing plugin "${plugin.name}" before re-installation.`, { error });
        }
      }
    }

    this.plugins.set(plugin.name, plugin);
    try {
      plugin.install(this);
      this.logger.info(`Plugin "${plugin.name}" installed successfully.`);
    } catch (error) {
      this.logger.error(`Error during installation of plugin "${plugin.name}". Plugin may not function correctly.`, { error });
      // Optionally, remove the plugin if install fails
      this.plugins.delete(plugin.name);
      throw error; // Re-throw error if install is critical
    }
  }

  /**
   * Adds a global hook handler for a specified lifecycle event.
   * Global hooks are executed for all scrapers managed by this engine.
   * @param hook The {@link ScraperHook} event type (e.g., 'beforeRequest', 'onError').
   * @param handler The {@link HookHandler} function to execute when the event occurs.
   */
  addHook(hook: ScraperHook, handler: HookHandler<unknown, unknown>): void {
    if (!this.globalHooks.has(hook)) {
      this.globalHooks.set(hook, []);
    }
    const handlers = this.globalHooks.get(hook);
    // Ensure handlers is not undefined (shouldn't be due to above check, but for type safety)
    if (handlers) {
      handlers.push(handler);
      this.logger.debug(`Added global hook for "${hook}" event.`);
    }
  }

  /**
   * Removes a previously added global hook handler.
   * @param hook The {@link ScraperHook} event type.
   * @param handler The specific {@link HookHandler} function to remove.
   *                It must be the same function reference that was originally added.
   */
  removeHook(hook: ScraperHook, handler: HookHandler<unknown, unknown>): void {
    const handlers = this.globalHooks.get(hook);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        this.logger.debug(`Removed global hook for "${hook}" event.`);
      } else {
        this.logger.warn(`Attempted to remove a global hook for "${hook}" that was not found.`);
      }
    }
  }

  /**
   * Gracefully shuts down the scraper engine.
   * This includes uninstalling all plugins that have an `uninstall` method
   * and shutting down the browser pool, closing all browser instances.
   * @returns A Promise that resolves when shutdown is complete.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down scraper engine...');

    // Uninstall plugins
    this.logger.debug('Uninstalling plugins...');
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
