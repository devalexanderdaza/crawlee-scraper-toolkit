[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperResult

# Interface: ScraperResult\<Output\>

Defined in: [core/types.ts:144](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L144)

Scraper execution result

## Type Parameters

### Output

`Output` = `unknown`

## Properties

### success

> **success**: `boolean`

Defined in: [core/types.ts:145](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L145)

***

### data?

> `optional` **data**: `Output`

Defined in: [core/types.ts:146](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L146)

***

### error?

> `optional` **error**: `Error`

Defined in: [core/types.ts:147](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L147)

***

### attempts

> **attempts**: `number`

Defined in: [core/types.ts:148](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L148)

***

### duration

> **duration**: `number`

Defined in: [core/types.ts:149](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L149)

***

### metadata

> **metadata**: `object`

Defined in: [core/types.ts:150](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L150)

#### scraperId

> **scraperId**: `string`

#### timestamp

> **timestamp**: `number`

#### userAgent

> **userAgent**: `string`

#### url

> **url**: `string`
