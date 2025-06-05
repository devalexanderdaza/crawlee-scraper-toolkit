[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperDefinition

# Interface: ScraperDefinition\<Input, Output\>

Defined in: core/types.ts:105

Enhanced scraper definition with crawlee integration

## Type Parameters

### Input

`Input` = `unknown`

### Output

`Output` = `unknown`

## Properties

### id

> **id**: `string`

Defined in: core/types.ts:107

Unique identifier for the scraper

***

### name

> **name**: `string`

Defined in: core/types.ts:109

Human-readable name

***

### description?

> `optional` **description**: `string`

Defined in: core/types.ts:111

Description of what this scraper does

***

### url

> **url**: `string`

Defined in: core/types.ts:113

Base URL or URL template

***

### navigation

> **navigation**: [`NavigationStrategy`](NavigationStrategy.md)

Defined in: core/types.ts:115

Navigation strategy

***

### waitStrategy

> **waitStrategy**: [`WaitStrategy`](WaitStrategy.md)

Defined in: core/types.ts:117

Wait strategy

***

### parse()

> **parse**: (`context`) => `Promise`\<`Output`\>

Defined in: core/types.ts:119

Parse function to extract data

#### Parameters

##### context

[`ScraperContext`](ScraperContext.md)\<`Input`, `Output`\>

#### Returns

`Promise`\<`Output`\>

***

### validateInput()?

> `optional` **validateInput**: (`input`) => `string` \| `boolean`

Defined in: core/types.ts:121

Validation function for input

#### Parameters

##### input

`Input`

#### Returns

`string` \| `boolean`

***

### validateOutput()?

> `optional` **validateOutput**: (`output`) => `string` \| `boolean`

Defined in: core/types.ts:123

Validation function for output

#### Parameters

##### output

`Output`

#### Returns

`string` \| `boolean`

***

### requiresCaptcha

> **requiresCaptcha**: `boolean`

Defined in: core/types.ts:125

Whether this scraper requires CAPTCHA solving

***

### rateLimit?

> `optional` **rateLimit**: `object`

Defined in: core/types.ts:127

Rate limiting configuration

#### requests

> **requests**: `number`

#### period

> **period**: `number`

***

### options?

> `optional` **options**: `Partial`\<[`ScraperExecutionOptions`](ScraperExecutionOptions.md)\>

Defined in: core/types.ts:132

Custom execution options

***

### hooks?

> `optional` **hooks**: `Partial`\<`Record`\<[`ScraperHook`](../type-aliases/ScraperHook.md), [`HookHandler`](../type-aliases/HookHandler.md)\<`unknown`\>[]\>\>

Defined in: core/types.ts:134

Hooks for this scraper

***

### tags?

> `optional` **tags**: `string`[]

Defined in: core/types.ts:136

Tags for categorization

***

### version?

> `optional` **version**: `string`

Defined in: core/types.ts:138

Version of the scraper definition
