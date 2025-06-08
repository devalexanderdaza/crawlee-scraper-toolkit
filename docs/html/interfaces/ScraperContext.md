[**crawlee-scraper-toolkit v2.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperContext

# Interface: ScraperContext\<Input, Output\>

Defined in: [core/types.ts:109](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L109)

Context object passed to the `parse` function and to all hook handlers.
It provides access to the current scraping state and resources.

## Type Parameters

### Input

`Input` = `unknown`

The type of the input data for the scraper.

### Output

`Output` = `unknown`

The type of the output data from the scraper's parse function.

## Properties

### input

> **input**: `Input`

Defined in: [core/types.ts:111](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L111)

The input data provided for the current scraping task.

***

### page

> **page**: `Page`

Defined in: [core/types.ts:113](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L113)

The Playwright `Page` object for interacting with the browser.

***

### attempt

> **attempt**: `number`

Defined in: [core/types.ts:115](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L115)

The current attempt number for this scraping task (1 for first attempt, 2 for first retry, etc.).

***

### startTime

> **startTime**: `number`

Defined in: [core/types.ts:117](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L117)

Timestamp (ms since epoch) when the current scraping attempt started.

***

### options

> **options**: [`ScraperExecutionOptions`](ScraperExecutionOptions.md)

Defined in: [core/types.ts:119](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L119)

The execution options applicable to the current scraping task.

***

### metadata

> **metadata**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:121](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L121)

A key-value store for sharing custom data between hooks or within a scraping lifecycle.

***

### result?

> `optional` **result**: `Output`

Defined in: [core/types.ts:126](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L126)

The result from the `parse` function. Available in `afterRequest` and `onSuccess` hooks if parsing was successful.
Potentially available in `onError` if error occurred after parsing.

***

### error?

> `optional` **error**: `Error`

Defined in: [core/types.ts:131](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L131)

The error object if an error occurred. Available in `onError` and `afterRequest` hooks if an error was thrown.
Also available in `onRetry` hook.

***

### log

> **log**: [`Logger`](../-internal-/interfaces/Logger.md)

Defined in: [core/types.ts:133](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L133)

Logger instance for logging within the scraper context, e.g., in parse function or hooks.
