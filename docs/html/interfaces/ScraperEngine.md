[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperEngine

# Interface: ScraperEngine

Defined in: [core/types.ts:293](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L293)

Defines the core interface for the scraper engine.
It is responsible for managing scraper definitions, plugins, hooks,
and executing scraping tasks. It also emits events related to the scraping lifecycle.

## Extends

- `EventEmitter`\<[`ScraperEvents`](../-internal-/interfaces/ScraperEvents.md)\>

## Methods

### execute()

> **execute**\<`Input`, `Output`\>(`definition`, `input`, `options?`): `Promise`\<[`ScraperResult`](ScraperResult.md)\<`Output`\>\>

Defined in: [core/types.ts:295](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L295)

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

Defined in: [core/types.ts:302](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L302)

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

Defined in: [core/types.ts:305](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L305)

Get a registered scraper definition

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>

***

### listDefinitions()

> **listDefinitions**(): [`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>[]

Defined in: [core/types.ts:308](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L308)

List all registered scrapers

#### Returns

[`ScraperDefinition`](ScraperDefinition.md)\<`unknown`, `unknown`\>[]

***

### use()

> **use**(`plugin`): `void`

Defined in: [core/types.ts:311](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L311)

Install a plugin

#### Parameters

##### plugin

[`ScraperPlugin`](ScraperPlugin.md)

#### Returns

`void`

***

### addHook()

> **addHook**(`hook`, `handler`): `void`

Defined in: [core/types.ts:314](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L314)

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

Defined in: [core/types.ts:317](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L317)

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

Defined in: [core/types.ts:320](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L320)

Shutdown the engine and cleanup resources

#### Returns

`Promise`\<`void`\>
