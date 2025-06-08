[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperResult

# Interface: ScraperResult\<Output\>

Defined in: [core/types.ts:218](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L218)

Scraper execution result

## Type Parameters

### Output

`Output` = `unknown`

## Properties

### success

> **success**: `boolean`

Defined in: [core/types.ts:220](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L220)

Indicates whether the scraping task was successful.

***

### data?

> `optional` **data**: `Output`

Defined in: [core/types.ts:222](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L222)

The scraped data, if successful. Matches the `Output` type of the `ScraperDefinition`.

***

### error?

> `optional` **error**: `Error`

Defined in: [core/types.ts:224](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L224)

The error object, if the scraping task failed.

***

### attempts

> **attempts**: `number`

Defined in: [core/types.ts:226](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L226)

The total number of attempts made for this task (including retries).

***

### duration

> **duration**: `number`

Defined in: [core/types.ts:228](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L228)

The total duration of the scraping task in milliseconds.

***

### metadata

> **metadata**: `object`

Defined in: [core/types.ts:230](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L230)

Metadata associated with the scraper execution.

#### scraperId

> **scraperId**: `string`

The ID of the scraper definition used.

#### timestamp

> **timestamp**: `number`

Timestamp (ms since epoch) when the scraping task was initiated.

#### userAgent

> **userAgent**: `string`

The User-Agent string used for the requests.

#### url

> **url**: `string`

The final URL from which data was parsed (or attempted).
