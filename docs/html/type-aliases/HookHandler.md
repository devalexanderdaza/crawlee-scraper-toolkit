[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / HookHandler

# Type Alias: HookHandler()\<Input, Output\>

> **HookHandler**\<`Input`, `Output`\> = (`context`) => `Promise`\<`void`\> \| `void`

Defined in: [core/types.ts:99](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L99)

Defines the signature for a hook handler function.

## Type Parameters

### Input

`Input` = `unknown`

The type of the input data for the scraper.

### Output

`Output` = `unknown`

The type of the output data from the scraper's parse function.

## Parameters

### context

[`ScraperContext`](../interfaces/ScraperContext.md)\<`Input`, `Output`\>

The scraper context, providing access to input, page, options, etc.

## Returns

`Promise`\<`void`\> \| `void`
