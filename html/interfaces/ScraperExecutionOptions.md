[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperExecutionOptions

# Interface: ScraperExecutionOptions

Defined in: [core/types.ts:38](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L38)

Scraper execution options

## Properties

### retries

> **retries**: `number`

Defined in: [core/types.ts:40](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L40)

Number of retry attempts

***

### retryDelay

> **retryDelay**: `number`

Defined in: [core/types.ts:42](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L42)

Delay between retries in milliseconds

***

### timeout

> **timeout**: `number`

Defined in: [core/types.ts:44](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L44)

Request timeout in milliseconds

***

### useProxyRotation

> **useProxyRotation**: `boolean`

Defined in: [core/types.ts:46](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L46)

Whether to use proxy rotation

***

### headers

> **headers**: `Record`\<`string`, `string`\>

Defined in: [core/types.ts:48](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L48)

Custom headers

***

### userAgent

> **userAgent**: `string`

Defined in: [core/types.ts:50](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L50)

User agent string

***

### javascript

> **javascript**: `boolean`

Defined in: [core/types.ts:52](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L52)

Whether to enable JavaScript

***

### loadImages

> **loadImages**: `boolean`

Defined in: [core/types.ts:54](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L54)

Whether to load images

***

### viewport

> **viewport**: `object`

Defined in: [core/types.ts:56](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L56)

Viewport configuration

#### width

> **width**: `number`

#### height

> **height**: `number`
