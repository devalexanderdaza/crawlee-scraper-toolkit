[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperContext

# Interface: ScraperContext\<Input, Output\>

Defined in: core/types.ts:75

Scraper context passed to hooks and parse function

## Type Parameters

### Input

`Input` = `unknown`

### Output

`Output` = `unknown`

## Properties

### input

> **input**: `Input`

Defined in: core/types.ts:76

***

### page

> **page**: `Page`

Defined in: core/types.ts:77

***

### attempt

> **attempt**: `number`

Defined in: core/types.ts:78

***

### startTime

> **startTime**: `number`

Defined in: core/types.ts:79

***

### options

> **options**: [`ScraperExecutionOptions`](ScraperExecutionOptions.md)

Defined in: core/types.ts:80

***

### metadata

> **metadata**: `Record`\<`string`, `unknown`\>

Defined in: core/types.ts:81

***

### result?

> `optional` **result**: `Output`

Defined in: core/types.ts:82

***

### error?

> `optional` **error**: `Error`

Defined in: core/types.ts:83
