import { BrowserPool, defaultBrowserPoolConfig } from '@/core/browser-pool';
import { createLogger } from '@/utils/logger';

describe('BrowserPool', () => {
  let browserPool: BrowserPool;
  let logger: any;

  beforeEach(() => {
    logger = createLogger({ level: 'error', format: 'text', console: false });
    browserPool = new BrowserPool(
      {
        ...defaultBrowserPoolConfig,
        maxSize: 2,
        maxAge: 5000,
        cleanupInterval: 1000,
      },
      logger
    );
  });

  afterEach(async () => {
    await browserPool.shutdown();
  });

  describe('acquire and release', () => {
    it('should acquire a browser instance', async () => {
      const instance = await browserPool.acquire();
      
      expect(instance).toBeDefined();
      expect(instance.id).toBeDefined();
      expect(instance.browser).toBeDefined();
      expect(instance.context).toBeDefined();
      expect(instance.page).toBeDefined();
      expect(instance.inUse).toBe(true);
      
      browserPool.release(instance);
    });

    it('should reuse released instances', async () => {
      const instance1 = await browserPool.acquire();
      const id1 = instance1.id;
      browserPool.release(instance1);

      const instance2 = await browserPool.acquire();
      expect(instance2.id).toBe(id1);
      
      browserPool.release(instance2);
    });

    it('should create new instances when pool is empty', async () => {
      const instance1 = await browserPool.acquire();
      const instance2 = await browserPool.acquire();
      
      expect(instance1.id).not.toBe(instance2.id);
      
      browserPool.release(instance1);
      browserPool.release(instance2);
    });

    it('should respect max pool size', async () => {
      const instances = [];
      
      // Acquire max instances
      for (let i = 0; i < 2; i++) {
        instances.push(await browserPool.acquire());
      }
      
      const stats = browserPool.getStats();
      expect(stats.total).toBe(2);
      expect(stats.inUse).toBe(2);
      expect(stats.available).toBe(0);
      
      // Release all instances
      instances.forEach(instance => browserPool.release(instance));
    });
  });

  describe('cleanup', () => {
    it('should cleanup old instances', async () => {
      const instance = await browserPool.acquire();
      browserPool.release(instance);
      
      // Wait for instance to become old
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      await browserPool.cleanupOldInstances();
      
      const stats = browserPool.getStats();
      expect(stats.total).toBe(0);
    }, 10000);
  });

  describe('stats', () => {
    it('should return correct stats', async () => {
      const stats1 = browserPool.getStats();
      expect(stats1.total).toBe(0);
      expect(stats1.inUse).toBe(0);
      expect(stats1.available).toBe(0);
      expect(stats1.maxSize).toBe(2);

      const instance = await browserPool.acquire();
      
      const stats2 = browserPool.getStats();
      expect(stats2.total).toBe(1);
      expect(stats2.inUse).toBe(1);
      expect(stats2.available).toBe(0);

      browserPool.release(instance);
      
      const stats3 = browserPool.getStats();
      expect(stats3.total).toBe(1);
      expect(stats3.inUse).toBe(0);
      expect(stats3.available).toBe(1);
    });
  });

  describe('shutdown', () => {
    it('should close all browser instances', async () => {
      const instance1 = await browserPool.acquire();
      const instance2 = await browserPool.acquire();
      
      browserPool.release(instance1);
      // Keep instance2 in use
      
      await browserPool.shutdown();
      
      const stats = browserPool.getStats();
      expect(stats.total).toBe(0);
    });
  });
});

