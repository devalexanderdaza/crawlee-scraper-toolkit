[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperExecutionOptions

# Interface: ScraperExecutionOptions

Defined in: [core/types.ts:54](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L54)

Scraper execution options

## Properties

### retries

> **retries**: `number`

Defined in: [core/types.ts:56](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L56)

Number of retry attempts

***

### retryDelay

> **retryDelay**: `number`

Defined in: [core/types.ts:58](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L58)

Delay between retries in milliseconds

***

### timeout

> **timeout**: `number`

Defined in: [core/types.ts:60](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L60)

Request timeout in milliseconds

***

### useProxyRotation

> **useProxyRotation**: `boolean`

Defined in: [core/types.ts:62](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L62)

Whether to use proxy rotation

***

### headers

> **headers**: `Record`\<`string`, `string`\>

Defined in: [core/types.ts:64](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L64)

Custom headers

***

### userAgent

> **userAgent**: `string`

Defined in: [core/types.ts:66](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L66)

User agent string

***

### javascript

> **javascript**: `boolean`

Defined in: [core/types.ts:68](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L68)

Whether to enable JavaScript

***

### loadImages

> **loadImages**: `boolean`

Defined in: [core/types.ts:70](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L70)

Whether to load images during page navigation. Defaults to false.

***

### viewport

> **viewport**: `object`

Defined in: [core/types.ts:75](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L75)

Viewport configuration for the browser page.

#### width

> **width**: `number`

Viewport width in pixels.

#### height

> **height**: `number`

Viewport height in pixels.

#### See

https://playwright.dev/docs/api/class-page#page-set-viewport-size
