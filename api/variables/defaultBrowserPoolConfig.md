[**crawlee-scraper-toolkit v2.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / defaultBrowserPoolConfig

# Variable: defaultBrowserPoolConfig

> `const` **defaultBrowserPoolConfig**: [`BrowserPoolConfig`](../interfaces/BrowserPoolConfig.md)

Defined in: [core/browser-pool.ts:316](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L316)

Provides a default configuration for the [BrowserPool](../classes/BrowserPool.md).
This configuration can be used as a base and customized as needed.
Key defaults include:
- `maxSize`: 5 browser instances.
- `maxAge`: 30 minutes for an instance before it's recycled.
- `headless`: True (or as per `BROWSER_HEADLESS` env var).
- `cleanupInterval`: 5 minutes.
