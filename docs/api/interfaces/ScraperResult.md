[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperResult

# Interface: ScraperResult\<Output\>

Defined in: core/types.ts:144

Scraper execution result

## Type Parameters

### Output

`Output` = `unknown`

## Properties

### success

> **success**: `boolean`

Defined in: core/types.ts:145

***

### data?

> `optional` **data**: `Output`

Defined in: core/types.ts:146

***

### error?

> `optional` **error**: `Error`

Defined in: core/types.ts:147

***

### attempts

> **attempts**: `number`

Defined in: core/types.ts:148

***

### duration

> **duration**: `number`

Defined in: core/types.ts:149

***

### metadata

> **metadata**: `object`

Defined in: core/types.ts:150

#### scraperId

> **scraperId**: `string`

#### timestamp

> **timestamp**: `number`

#### userAgent

> **userAgent**: `string`

#### url

> **url**: `string`
