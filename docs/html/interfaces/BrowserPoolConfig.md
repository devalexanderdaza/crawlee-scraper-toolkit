[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / BrowserPoolConfig

# Interface: BrowserPoolConfig

Defined in: core/types.ts:7

Configuration for browser pool

## Properties

### maxSize

> **maxSize**: `number`

Defined in: core/types.ts:9

Maximum number of browser instances in the pool

***

### maxAge

> **maxAge**: `number`

Defined in: core/types.ts:11

Maximum age of browser instances in milliseconds

***

### launchOptions

> **launchOptions**: `object`

Defined in: core/types.ts:13

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

Defined in: core/types.ts:19

Cleanup interval in milliseconds
