[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperEngine

# Interface: ScraperEngine

Defined in: [core/types.ts:184](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L184)

Main scraper engine interface

## Extends

- `EventEmitter`\<[`ScraperEvents`](../-internal-/interfaces/ScraperEvents.md)\>

## Methods

### execute()

> **execute**\<`Input`, `Output`\>(`definition`, `input`, `options?`): `Promise`\<[`ScraperResult`](ScraperResult.md)\<`Output`\>\>

Defined in: [core/types.ts:186](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L186)

Execute a scraper with given input

#### Type Parameters

##### Input

`Input`

##### Output

`Output`

#### Parameters

##### definition

[`ScraperDefinition`](ScraperDefinition.md)\<`Input`, `Output`\>

##### input

`Input`

##### options?

`Partial`\<[`ScraperExecutionOptions`](ScraperExecutionOptions.md)\>

#### Returns

`Promise`\<[`ScraperResult`](ScraperResult.md)\<`Output`\>\>

***

### register()

> **register**\<`Input`, `Output`\>(`definition`): `void`

Defined in: [core/types.ts:193](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L193)

Register a scraper definition

#### Type Parameters

##### Input

`Input`

##### Output

`Output`

#### Parameters

##### definition

[`ScraperDefinition`](ScraperDefinition.md)\<`Input`, `Output`\>

#### Returns

`void`

***

### getDefinition()

> **getDefinition**(`id`): `undefined` \| [`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>

Defined in: [core/types.ts:196](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L196)

Get a registered scraper definition

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>

***

### listDefinitions()

> **listDefinitions**(): [`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>[]

Defined in: [core/types.ts:199](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L199)

List all registered scrapers

#### Returns

[`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>[]

***

### use()

> **use**(`plugin`): `void`

Defined in: [core/types.ts:202](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L202)

Install a plugin

#### Parameters

##### plugin

[`ScraperPlugin`](ScraperPlugin.md)

#### Returns

`void`

***

### addHook()

> **addHook**(`hook`, `handler`): `void`

Defined in: [core/types.ts:205](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L205)

Add a global hook

#### Parameters

##### hook

[`ScraperHook`](../type-aliases/ScraperHook.md)

##### handler

[`HookHandler`](../type-aliases/HookHandler.md)

#### Returns

`void`

***

### removeHook()

> **removeHook**(`hook`, `handler`): `void`

Defined in: [core/types.ts:208](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L208)

Remove a global hook

#### Parameters

##### hook

[`ScraperHook`](../type-aliases/ScraperHook.md)

##### handler

[`HookHandler`](../type-aliases/HookHandler.md)

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [core/types.ts:211](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L211)

Shutdown the engine and cleanup resources

#### Returns

`Promise`\<`void`\>
