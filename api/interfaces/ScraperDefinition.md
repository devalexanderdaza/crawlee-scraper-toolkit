[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperDefinition

# Interface: ScraperDefinition\<Input, Output\>

Defined in: [core/types.ts:170](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L170)

Defines the structure and behavior of a scraper.

## Type Parameters

### Input

`Input` = `unknown`

The type of the input data this scraper expects.

### Output

`Output` = `unknown`

The type of the data this scraper is expected to output after parsing.

## Properties

### id

> **id**: `string`

Defined in: [core/types.ts:172](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L172)

Unique identifier for the scraper

***

### name

> **name**: `string`

Defined in: [core/types.ts:174](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L174)

Human-readable name

***

### description?

> `optional` **description**: `string`

Defined in: [core/types.ts:176](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L176)

Description of what this scraper does

***

### url

> **url**: `string`

Defined in: [core/types.ts:178](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L178)

Base URL or URL template

***

### navigation

> **navigation**: [`NavigationStrategy`](NavigationStrategy.md)

Defined in: [core/types.ts:180](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L180)

Navigation strategy

***

### waitStrategy

> **waitStrategy**: [`WaitStrategy`](WaitStrategy.md)

Defined in: [core/types.ts:182](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L182)

Wait strategy

***

### parse()

> **parse**: (`context`) => `Promise`\<`Output`\>

Defined in: [core/types.ts:184](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L184)

Parse function to extract data

#### Parameters

##### context

[`ScraperContext`](ScraperContext.md)\<`Input`, `Output`\>

#### Returns

`Promise`\<`Output`\>

***

### validateInput()?

> `optional` **validateInput**: (`input`) => `string` \| `boolean`

Defined in: [core/types.ts:186](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L186)

Validation function for input

#### Parameters

##### input

`Input`

#### Returns

`string` \| `boolean`

***

### validateOutput()?

> `optional` **validateOutput**: (`output`) => `string` \| `boolean`

Defined in: [core/types.ts:188](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L188)

Validation function for output

#### Parameters

##### output

`Output`

#### Returns

`string` \| `boolean`

***

### requiresCaptcha

> **requiresCaptcha**: `boolean`

Defined in: [core/types.ts:190](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L190)

Whether this scraper requires CAPTCHA solving

***

### rateLimit?

> `optional` **rateLimit**: `object`

Defined in: [core/types.ts:195](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L195)

Rate limiting configuration for this specific scraper.
Overrides global rate limit settings if provided.

#### requests

> **requests**: `number`

Maximum number of requests allowed within the specified period.

#### period

> **period**: `number`

Time period in milliseconds during which the request limit applies.

***

### options?

> `optional` **options**: `Partial`\<[`ScraperExecutionOptions`](ScraperExecutionOptions.md)\>

Defined in: [core/types.ts:202](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L202)

Custom execution options specific to this scraper. Merged with global/profile options.

***

### hooks?

> `optional` **hooks**: `Partial`\<`Record`\<[`ScraperHook`](../type-aliases/ScraperHook.md), [`HookHandler`](../type-aliases/HookHandler.md)\<`Input`, `Output`\>[]\>\>

Defined in: [core/types.ts:208](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L208)

Scraper-specific lifecycle hooks.
Keys are hook names (`ScraperHook`), and values are arrays of `HookHandler` functions.
These hooks are executed in addition to any global hooks.

***

### tags?

> `optional` **tags**: `string`[]

Defined in: [core/types.ts:210](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L210)

Tags for categorizing or filtering scrapers.

***

### version?

> `optional` **version**: `string`

Defined in: [core/types.ts:212](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L212)

Version of the scraper definition
