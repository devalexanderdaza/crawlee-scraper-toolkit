import { Browser, BrowserContext, chromium, Page, LaunchOptions } from 'playwright';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { BrowserInstance, BrowserPoolConfig } from './types';
import { Logger } from '@/utils/logger';

/**
 * Enhanced browser pool with better resource management and crawlee integration
 */
export class BrowserPool extends EventEmitter {
  private pool: BrowserInstance[] = [];
  private config: BrowserPoolConfig;
  private logger: Logger;
  private cleanupTimer?: NodeJS.Timeout;
  private isShuttingDown = false;

  constructor(config: BrowserPoolConfig, logger: Logger) {
    super();
    this.config = config;
    this.logger = logger;
    this.startCleanupTimer();
  }

  /**
   * Acquire a browser instance from the pool
   */
  async acquire(): Promise<BrowserInstance> {
    if (this.isShuttingDown) {
      throw new Error('Browser pool is shutting down');
    }

    // Try to find an available instance
    const availableInstance = this.pool.find(instance => !instance.inUse);

    if (availableInstance) {
      this.logger.debug('Reusing browser instance from pool', { 
        instanceId: availableInstance.id 
      });
      
      // Check if page is still valid
      if (availableInstance.page.isClosed()) {
        this.logger.debug('Page closed, creating new page in existing context', {
          instanceId: availableInstance.id
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
        maxSize: this.config.maxSize 
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
   * Release a browser instance back to the pool
   */
  release(instance: BrowserInstance): void {
    const poolInstance = this.pool.find(i => i.id === instance.id);
    
    if (poolInstance) {
      poolInstance.inUse = false;
      poolInstance.lastUsed = Date.now();
      
      this.logger.debug('Released browser instance to pool', { 
        instanceId: poolInstance.id 
      });
      
      this.emit('pool:release', { instanceId: poolInstance.id });
    } else {
      this.logger.warn('Attempted to release unknown browser instance', {
        instanceId: instance.id
      });
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number;
    inUse: number;
    available: number;
    maxSize: number;
  } {
    const inUse = this.pool.filter(i => i.inUse).length;
    return {
      total: this.pool.length,
      inUse,
      available: this.pool.length - inUse,
      maxSize: this.config.maxSize,
    };
  }

  /**
   * Cleanup old instances
   */
  async cleanupOldInstances(): Promise<void> {
    if (this.isShuttingDown) return;

    const now = Date.now();
    const instancesToRemove: BrowserInstance[] = [];

    for (const instance of this.pool) {
      if (!instance.inUse && (now - instance.lastUsed) > this.config.maxAge) {
        instancesToRemove.push(instance);
      }
    }

    if (instancesToRemove.length > 0) {
      this.logger.debug('Cleaning up old browser instances', { 
        count: instancesToRemove.length 
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
   * Shutdown the pool and close all browsers
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down browser pool');
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
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
            availableInstance.context.newPage()
              .then(page => {
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
 * Default browser pool configuration
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

