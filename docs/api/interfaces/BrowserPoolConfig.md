[**crawlee-scraper-toolkit v1.0.0**](../README.md)

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

Maximum age of browser instances in milliseconds

***

### launchOptions

> **launchOptions**: `object`

Defined in: [core/types.ts:13](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L13)

Browser launch options

#### headless

> **headless**: `boolean`

#### args

> **args**: `string`[]

#### timeout

> **timeout**: `number`

***

### cleanupInterval

> **cleanupInterval**: `number`

Defined in: [core/types.ts:19](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L19)

Cleanup interval in milliseconds
