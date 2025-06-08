[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / BrowserPoolConfig

# Interface: BrowserPoolConfig

Defined in: [core/types.ts:7](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L7)

Configuration for browser pool

## Properties

### maxSize

> **maxSize**: `number`

Defined in: [core/types.ts:9](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L9)

Maximum number of browser instances in the pool

***

### maxAge

> **maxAge**: `number`

Defined in: [core/types.ts:11](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L11)

Maximum age of browser instances in milliseconds before they are recycled.

***

### launchOptions

> **launchOptions**: `object`

Defined in: [core/types.ts:16](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L16)

Browser launch options for Playwright.

#### headless

> **headless**: `boolean`

Whether to run the browser in headless mode. Defaults to true.

#### args

> **args**: `string`[]

Additional arguments to pass to the browser instance.

#### timeout

> **timeout**: `number`

Maximum time in milliseconds to wait for the browser instance to start. Defaults to 30000 (30 seconds).

#### See

https://playwright.dev/docs/api/class-browsertype#browser-type-launch

***

### cleanupInterval

> **cleanupInterval**: `number`

Defined in: [core/types.ts:25](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L25)

Interval in milliseconds at which to check for and clean up old/unused browser instances.
