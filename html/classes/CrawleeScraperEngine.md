[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / CrawleeScraperEngine

# Class: CrawleeScraperEngine

Defined in: [core/scraper.ts:38](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L38)

Main scraper engine implementation

## Extends

- `EventEmitter`\<[`ScraperEvents`](../-internal-/interfaces/ScraperEvents.md)\>

## Implements

- [`ScraperEngine`](../interfaces/ScraperEngine.md)

## Constructors

### Constructor

> **new CrawleeScraperEngine**(`config`, `logger`): `CrawleeScraperEngine`

Defined in: [core/scraper.ts:46](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L46)

#### Parameters

##### config

[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)

##### logger

[`Logger`](../interfaces/Logger.md)

#### Returns

`CrawleeScraperEngine`

#### Overrides

`EventEmitter<ScraperEvents>.constructor`

## Methods

### execute()

> **execute**\<`Input`, `Output`\>(`definition`, `input`, `options?`): `Promise`\<[`ScraperResult`](../interfaces/ScraperResult.md)\<`Output`\>\>

Defined in: [core/scraper.ts:57](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L57)

Execute a scraper with given input

#### Type Parameters

##### Input

`Input`

##### Output

`Output`

#### Parameters

##### definition

[`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`Input`, `Output`\>

##### input

`Input`

##### options?

`Partial`\<[`ScraperExecutionOptions`](../interfaces/ScraperExecutionOptions.md)\>

#### Returns

`Promise`\<[`ScraperResult`](../interfaces/ScraperResult.md)\<`Output`\>\>

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`execute`](../interfaces/ScraperEngine.md#execute)

***

### register()

> **register**\<`Input`, `Output`\>(`definition`): `void`

Defined in: [core/scraper.ts:187](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L187)

Register a scraper definition

#### Type Parameters

##### Input

`Input`

##### Output

`Output`

#### Parameters

##### definition

[`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`Input`, `Output`\>

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`register`](../interfaces/ScraperEngine.md#register)

***

### getDefinition()

> **getDefinition**(`id`): `undefined` \| [`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>

Defined in: [core/scraper.ts:195](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L195)

Get a registered scraper definition

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`getDefinition`](../interfaces/ScraperEngine.md#getdefinition)

***

### listDefinitions()

> **listDefinitions**(): [`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>[]

Defined in: [core/scraper.ts:202](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L202)

List all registered scrapers

#### Returns

[`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>[]

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`listDefinitions`](../interfaces/ScraperEngine.md#listdefinitions)

***

### use()

> **use**(`plugin`): `void`

Defined in: [core/scraper.ts:209](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L209)

Install a plugin

#### Parameters

##### plugin

[`ScraperPlugin`](../interfaces/ScraperPlugin.md)

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`use`](../interfaces/ScraperEngine.md#use)

***

### addHook()

> **addHook**(`hook`, `handler`): `void`

Defined in: [core/scraper.ts:222](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L222)

Add a global hook

#### Parameters

##### hook

[`ScraperHook`](../type-aliases/ScraperHook.md)

##### handler

[`HookHandler`](../type-aliases/HookHandler.md)

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`addHook`](../interfaces/ScraperEngine.md#addhook)

***

### removeHook()

> **removeHook**(`hook`, `handler`): `void`

Defined in: [core/scraper.ts:235](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L235)

Remove a global hook

#### Parameters

##### hook

[`ScraperHook`](../type-aliases/ScraperHook.md)

##### handler

[`HookHandler`](../type-aliases/HookHandler.md)

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`removeHook`](../interfaces/ScraperEngine.md#removehook)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [core/scraper.ts:248](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L248)

Shutdown the engine and cleanup resources

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`shutdown`](../interfaces/ScraperEngine.md#shutdown)
