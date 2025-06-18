import { ScraperPlugin, ScraperEngine, ScraperContext } from '@/core/types';

/**
 * Retry plugin with exponential backoff
 */
export class RetryPlugin implements ScraperPlugin {
  name = 'retry';
  version = '1.0.0';

  private maxBackoffDelay: number;
  private backoffMultiplier: number;

  constructor(options: { maxBackoffDelay?: number; backoffMultiplier?: number } = {}) {
    this.maxBackoffDelay = options.maxBackoffDelay ?? 30000;
    this.backoffMultiplier = options.backoffMultiplier ?? 2;
  }

  install(scraper: ScraperEngine): void {
    scraper.addHook('onRetry', this.handleRetry.bind(this));
  }

  private async handleRetry(context: ScraperContext): Promise<void> {
    const delay = Math.min(
      context.options.retryDelay * Math.pow(this.backoffMultiplier, context.attempt - 1),
      this.maxBackoffDelay
    );

    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Cache plugin for caching scraper results
 */
// @todo Future enhancement: Implement pluggable storage adapters (e.g., FileSystem, Redis) beyond the default in-memory store.
export class CachePlugin implements ScraperPlugin {
  name = 'cache';
  version = '1.0.0';

  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private defaultTtl: number;

  constructor(options: { defaultTtl?: number } = {}) {
    this.defaultTtl = options.defaultTtl ?? 5 * 60 * 1000; // 5 minutes
  }

  install(scraper: ScraperEngine): void {
    scraper.addHook('beforeRequest', this.checkCache.bind(this));
    scraper.addHook('onSuccess', this.storeInCache.bind(this));
  }

  private async checkCache(context: ScraperContext): Promise<void> {
    const cacheKey = this.generateCacheKey(context);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      // Return cached result
      context.result = cached.data;
      throw new Error('CACHE_HIT'); // Use error to short-circuit execution
    }
  }

  private async storeInCache(context: ScraperContext): Promise<void> {
    if (context.result) {
      const cacheKey = this.generateCacheKey(context);
      this.cache.set(cacheKey, {
        data: context.result,
        timestamp: Date.now(),
        ttl: this.defaultTtl,
      });
    }
  }

  private generateCacheKey(context: ScraperContext): string {
    return `${JSON.stringify(context.input)}_${context.page.url()}`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Proxy rotation plugin
 */
export class ProxyPlugin implements ScraperPlugin {
  name = 'proxy';
  version = '1.0.0';

  private proxies: string[];
  private currentIndex = 0;

  constructor(proxies: string[]) {
    this.proxies = proxies;
  }

  install(scraper: ScraperEngine): void {
    scraper.addHook('beforeRequest', this.setProxy.bind(this));
  }

  private async setProxy(context: ScraperContext): Promise<void> {
    if (context.options.useProxyRotation && this.proxies.length > 0) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

      // Asigna el proxy seleccionado a las opciones de ejecución del contexto.
      // Nota: La aplicación real de este proxy a la solicitud dependerá
      // de cómo el motor de scraping o el gestor del navegador utilicen esta opción.
      context.options.proxyUrl = proxy;
    }
  }

  /**
   * Añade un proxy a la rotación.
   */
  addProxy(proxy: string): void {
    this.proxies.push(proxy);
  }

  /**
   * Elimina un proxy de la rotación.
   */
  removeProxy(proxy: string): void {
    const index = this.proxies.indexOf(proxy);
    if (index > -1) {
      this.proxies.splice(index, 1);
      if (this.currentIndex >= this.proxies.length) {
        this.currentIndex = 0;
      }
    }
  }

  /**
   * Obtiene la lista actual de proxies.
   */
  getProxies(): string[] {
    return [...this.proxies];
  }
}

/**
 * Rate limiting plugin
 */
export class RateLimitPlugin implements ScraperPlugin {
  name = 'rateLimit';
  version = '1.0.0';

  private requests = new Map<string, number[]>();
  private defaultLimit: number;
  private defaultWindow: number;

  constructor(options: { defaultLimit?: number; defaultWindow?: number } = {}) {
    this.defaultLimit = options.defaultLimit ?? 10;
    this.defaultWindow = options.defaultWindow ?? 60000; // 1 minute
  }

  install(scraper: ScraperEngine): void {
    scraper.addHook('beforeRequest', this.checkRateLimit.bind(this));
  }

  private async checkRateLimit(context: ScraperContext): Promise<void> {
    const domain = new URL(context.page.url() ?? 'http://localhost').hostname;
    const now = Date.now();

    let domainRequests = this.requests.get(domain);
    if (domainRequests === undefined) {
      domainRequests = [];
      this.requests.set(domain, domainRequests);
    }

    // Remove old requests outside the window
    const cutoff = now - this.defaultWindow;
    // The condition `domainRequests[0] !== undefined` correctly handles empty arrays
    // and ensures `domainRequests[0]` is treated as a number for the comparison,
    // which is necessary if `noUncheckedIndexedAccess` is enabled.
    while (domainRequests[0] !== undefined && domainRequests[0] < cutoff) {
      domainRequests.shift();
    }

    // Check if we're at the limit
    if (domainRequests.length >= this.defaultLimit) {
      const oldestRequest = domainRequests[0];
      if (oldestRequest !== undefined) {
        const waitTime = this.defaultWindow - (now - oldestRequest);

        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // Add current request
    domainRequests.push(now);
  }

  /**
   * Get rate limit statistics
   */
  getStats(): Record<string, { requests: number; window: number }> {
    const stats: Record<string, { requests: number; window: number }> = {};

    for (const [domain, requests] of this.requests.entries()) {
      stats[domain] = {
        requests: requests.length,
        window: this.defaultWindow,
      };
    }

    return stats;
  }
}

/**
 * Metrics plugin for collecting scraper metrics
 */
// @todo Future enhancement: Implement metrics exporters for common monitoring platforms (e.g., Prometheus, Grafana, StatsD) or a structured JSON logger.
export class MetricsPlugin implements ScraperPlugin {
  name = 'metrics';
  version = '1.0.0';

  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalDuration: 0,
    averageDuration: 0,
    scraperStats: new Map<
      string,
      {
        requests: number;
        successes: number;
        failures: number;
        totalDuration: number;
      }
    >(),
  };

  install(scraper: ScraperEngine): void {
    scraper.addHook('beforeRequest', this.recordStart.bind(this));
    scraper.addHook('onSuccess', this.recordSuccess.bind(this));
    scraper.addHook('onError', this.recordError.bind(this));
  }

  private async recordStart(context: ScraperContext): Promise<void> {
    this.metrics.totalRequests++;
    context.metadata.startTime = Date.now();
  }

  private async recordSuccess(context: ScraperContext): Promise<void> {
    this.metrics.successfulRequests++;
    this.recordDuration(context);
  }

  private async recordError(context: ScraperContext): Promise<void> {
    this.metrics.failedRequests++;
    this.recordDuration(context);
  }

  private recordDuration(context: ScraperContext): void {
    if (context.metadata.startTime && typeof context.metadata.startTime === 'number') {
      const duration = Date.now() - context.metadata.startTime;
      this.metrics.totalDuration += duration;
      this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.totalRequests;
    }
  }

  /**
   * Get metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalDuration: 0,
      averageDuration: 0,
      scraperStats: new Map(),
    };
  }
}
