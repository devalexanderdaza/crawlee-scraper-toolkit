import { chromium, Page, LaunchOptions, Browser } from 'playwright'; // Added Browser for clarity
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { BrowserInstance, BrowserPoolConfig, Logger as ILogger } from './types'; // Use ILogger

/**
 * @file Implements a pool for managing Playwright browser instances.
 * This helps in reusing browser instances to improve performance and control resource usage
 * by limiting the maximum number of concurrent browsers.
 */

/**
 * Manages a pool of Playwright browser instances.
 * This class handles the creation, acquisition, release, and cleanup of browser instances,
 * ensuring efficient reuse and adherence to configured limits (e.g., max size, instance age).
 * It emits events related to pool operations like 'pool:acquire', 'pool:release', 'pool:cleanup'.
 * @extends EventEmitter
 */
export class BrowserPool extends EventEmitter {
  private pool: BrowserInstance[] = [];
  private config: BrowserPoolConfig;
  private logger: ILogger; // Use the imported ILogger type
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  private isShuttingDown = false;

  /**
   * Creates an instance of BrowserPool.
   * @param config The configuration object for the browser pool. See {@link BrowserPoolConfig}.
   * @param logger An instance of a logger conforming to the {@link ILogger} interface.
   */
  constructor(config: BrowserPoolConfig, logger: ILogger) {
    super();
    this.config = config;
    this.logger = logger;
    this.startCleanupTimer();
    this.logger.info('BrowserPool initialized', { maxSize: config.maxSize, maxAge: config.maxAge });
  }

  /**
   * Acquires a browser instance from the pool.
   * If an idle instance is available, it's reused.
   * If the pool is not full, a new instance is created.
   * If the pool is full and no instances are idle, it waits for one to become available.
   * Emits 'pool:acquire' event when an instance is acquired.
   * @returns A Promise that resolves to an available {@link BrowserInstance}.
   * @throws Error if the pool is shutting down or if waiting for an instance times out.
   */
  async acquire(): Promise<BrowserInstance> {
    if (this.isShuttingDown) {
      this.logger.warn('Attempted to acquire browser instance while pool is shutting down.');
      throw new Error('Browser pool is shutting down');
    }

    // Try to find an available instance
    const availableInstance = this.pool.find(instance => !instance.inUse);

    if (availableInstance) {
      this.logger.debug('Reusing browser instance from pool', {
        instanceId: availableInstance.id,
      });

      // Check if page is still valid
      if (availableInstance.page.isClosed()) {
        this.logger.debug('Page closed, creating new page in existing context', {
          instanceId: availableInstance.id,
        });
        availableInstance.page = await availableInstance.context.newPage();
      }

      availableInstance.inUse = true;
      availableInstance.lastUsed = Date.now();

      this.emit('pool:acquire', { instanceId: availableInstance.id });
      return availableInstance;
    }

    // Create new instance if pool is not full
    if (this.pool.length < this.config.maxSize) {
      this.logger.debug('Creating new browser instance', {
        poolSize: this.pool.length,
        maxSize: this.config.maxSize,
      });

      const instance = await this.createInstance();
      this.pool.push(instance);

      this.emit('pool:acquire', { instanceId: instance.id });
      return instance;
    }

    // Wait for an instance to become available
    this.logger.debug('Pool full, waiting for available instance');
    return this.waitForAvailableInstance();
  }

  /**
   * Releases a previously acquired browser instance back to the pool,
   * marking it as available for reuse.
   * Emits 'pool:release' event.
   * @param instance The {@link BrowserInstance} to release.
   */
  release(instance: BrowserInstance): void {
    const poolInstance = this.pool.find(i => i.id === instance.id);

    if (poolInstance) {
      if (!poolInstance.inUse) {
        this.logger.warn('Attempted to release an instance that was not marked as in-use.', { instanceId: instance.id });
      }
      poolInstance.inUse = false;
      poolInstance.lastUsed = Date.now();
      this.logger.debug('Released browser instance to pool', { instanceId: poolInstance.id });
      this.emit('pool:release', { instanceId: poolInstance.id });
    } else {
      this.logger.warn('Attempted to release an unknown or already destroyed browser instance.', { instanceId: instance.id });
    }
  }

  /**
   * Retrieves statistics about the current state of the browser pool.
   * @returns An object containing:
   *  - `total`: The total number of browser instances currently managed by the pool (both active and idle).
   *  - `inUse`: The number of browser instances currently acquired and in use.
   *  - `available`: The number of idle browser instances available for immediate acquisition.
   *  - `maxSize`: The maximum number of browser instances the pool is configured to allow.
   */
  getStats(): {
    total: number;
    inUse: number;
    available: number;
    maxSize: number;
  } {
    const inUseCount = this.pool.filter(i => i.inUse).length;
    const stats = {
      total: this.pool.length,
      inUse: inUseCount,
      available: this.pool.length - inUseCount,
      maxSize: this.config.maxSize,
    };
    this.logger.debug('Browser pool stats requested.', stats);
    return stats;
  }

  /**
   * Periodically cleans up old and unused browser instances from the pool.
   * An instance is considered old if it has not been used for a duration exceeding
   * `config.maxAge` and is not currently in use.
   * This method is typically called by an internal timer.
   * Emits 'pool:cleanup' event with the number of removed instances.
   * @returns A Promise that resolves when the cleanup operation is complete.
   */
  async cleanupOldInstances(): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.debug('Cleanup skipped as pool is shutting down.');
      return;
    }

    const now = Date.now();
    const instancesToRemove: BrowserInstance[] = [];

    for (const instance of this.pool) {
      if (!instance.inUse && now - instance.lastUsed > this.config.maxAge) {
        instancesToRemove.push(instance);
      }
    }

    if (instancesToRemove.length > 0) {
      this.logger.debug('Cleaning up old browser instances', {
        count: instancesToRemove.length,
      });

      for (const instance of instancesToRemove) {
        await this.destroyInstance(instance);
        const index = this.pool.indexOf(instance);
        if (index > -1) {
          this.pool.splice(index, 1);
        }
      }

      this.emit('pool:cleanup', { removedInstances: instancesToRemove.length });
    }
  }

  /**
   * Shuts down the browser pool.
   * This process involves stopping the cleanup timer and closing all active browser instances
   * managed by the pool. No new instances can be acquired after shutdown is initiated.
   * @returns A Promise that resolves when all browser instances have been closed and resources are freed.
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down browser pool...');
    this.isShuttingDown = true;

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    const closePromises = this.pool.map(instance => this.destroyInstance(instance));
    await Promise.all(closePromises);

    this.pool = [];
    this.logger.info('Browser pool shutdown complete');
  }

  /**
   * Create a new browser instance
   */
  private async createInstance(): Promise<BrowserInstance> {
    const launchOptions: LaunchOptions = {
      headless: this.config.launchOptions.headless,
      args: this.config.launchOptions.args,
      timeout: this.config.launchOptions.timeout,
    };

    const browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    const id = uuidv4();

    const instance: BrowserInstance = {
      id,
      browser,
      context,
      page,
      lastUsed: Date.now(),
      inUse: true,
      createdAt: Date.now(),
    };

    this.logger.debug('Created new browser instance', { instanceId: id });
    return instance;
  }

  /**
   * Destroy a browser instance
   */
  private async destroyInstance(instance: BrowserInstance): Promise<void> {
    try {
      await instance.browser.close();
      this.logger.debug('Destroyed browser instance', { instanceId: instance.id });
    } catch (error) {
      this.logger.error('Error destroying browser instance', {
        instanceId: instance.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Wait for an available instance
   */
  private async waitForAvailableInstance(): Promise<BrowserInstance> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout waiting for available browser instance'));
      }, 30000);

      const checkInterval = setInterval(() => {
        const availableInstance = this.pool.find(instance => !instance.inUse);

        if (availableInstance) {
          clearInterval(checkInterval);
          clearTimeout(timeout);

          availableInstance.inUse = true;
          availableInstance.lastUsed = Date.now();

          // Check if page is still valid
          if (availableInstance.page.isClosed()) {
            availableInstance.context
              .newPage()
              .then((page: Page) => {
                availableInstance.page = page;
                resolve(availableInstance);
              })
              .catch(reject);
          } else {
            resolve(availableInstance);
          }
        }
      }, 200);
    });
  }

  /**
   * Start the cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldInstances().catch(error => {
        this.logger.error('Error during scheduled cleanup', {
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }, this.config.cleanupInterval);
  }
}

/**
 * Provides a default configuration for the {@link BrowserPool}.
 * This configuration can be used as a base and customized as needed.
 * Key defaults include:
 * - `maxSize`: 5 browser instances.
 * - `maxAge`: 30 minutes for an instance before it's recycled.
 * - `headless`: True (or as per `BROWSER_HEADLESS` env var).
 * - `cleanupInterval`: 5 minutes.
 */
export const defaultBrowserPoolConfig: BrowserPoolConfig = {
  maxSize: 5,
  maxAge: 30 * 60 * 1000, // 30 minutes
  launchOptions: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
    timeout: 30000,
  },
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
};
