[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperContext

# Interface: ScraperContext\<Input, Output\>

Defined in: [core/types.ts:75](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L75)

Scraper context passed to hooks and parse function

## Type Parameters

### Input

`Input` = `unknown`

### Output

`Output` = `unknown`

## Properties

### input

> **input**: `Input`

Defined in: [core/types.ts:76](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L76)

***

### page

> **page**: `Page`

Defined in: [core/types.ts:77](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L77)

***

### attempt

> **attempt**: `number`

Defined in: [core/types.ts:78](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L78)

***

### startTime

> **startTime**: `number`

Defined in: [core/types.ts:79](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L79)

***

### options

> **options**: [`ScraperExecutionOptions`](ScraperExecutionOptions.md)

Defined in: [core/types.ts:80](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L80)

***

### metadata

> **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:81](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L81)

***

### result?

> `optional` **result**: `Output`

Defined in: [core/types.ts:82](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L82)

***

### error?

> `optional` **error**: `Error`

Defined in: [core/types.ts:83](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L83)
