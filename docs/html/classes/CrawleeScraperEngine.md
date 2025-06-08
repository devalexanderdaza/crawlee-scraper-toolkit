[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / CrawleeScraperEngine

# Class: CrawleeScraperEngine

Defined in: [core/scraper.ts:47](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L47)

The main engine for managing and executing scrapers.
It handles the browser pool, plugin lifecycle, global and scraper-specific hooks,
and the overall execution flow of scraper definitions.
Emits various events throughout the scraping lifecycle (see [ScraperEvents](../-internal-/interfaces/ScraperEvents.md)).

## Extends

- `EventEmitter`\<[`ScraperEvents`](../-internal-/interfaces/ScraperEvents.md)\>

## Implements

- [`ScraperEngine`](../interfaces/ScraperEngine.md)

## Constructors

### Constructor

> **new CrawleeScraperEngine**(`config`, `logger`): `CrawleeScraperEngine`

Defined in: [core/scraper.ts:60](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L60)

Creates an instance of the CrawleeScraperEngine.

#### Parameters

##### config

[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)

The configuration object for the scraper engine. See [ScraperEngineConfig](../interfaces/ScraperEngineConfig.md).

##### logger

[`Logger`](../-internal-/interfaces/Logger.md)

An instance of a logger conforming to the [Logger](../-internal-/interfaces/Logger.md) interface.

#### Returns

`CrawleeScraperEngine`

#### Overrides

`EventEmitter<ScraperEvents>.constructor`

## Methods

### execute()

> **execute**\<`Input`, `Output`\>(`definition`, `input`, `options?`): `Promise`\<[`ScraperResult`](../interfaces/ScraperResult.md)\<`Output`\>\>

Defined in: [core/scraper.ts:91](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L91)

Executes a registered scraper definition with the given input and runtime options.
This method orchestrates the entire scraping lifecycle for a single task, including:
- Input validation.
- Acquiring a browser instance from the pool.
- Executing `beforeRequest`, scraper `parse`, `afterRequest`, `onSuccess` hooks.
- Handling retries with `onRetry` hooks upon failure.
- Managing errors with `onError` hooks.
- Output validation.
- Releasing the browser instance.
Emits `scraper:start`, `scraper:success`, `scraper:error`, and `scraper:retry` events.

#### Type Parameters

##### Input

`Input`

The type of the input data the scraper expects.

##### Output

`Output`

The type of the data the scraper's `parse` function will return.

#### Parameters

##### definition

[`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`Input`, `Output`\>

The [ScraperDefinition](../interfaces/ScraperDefinition.md) to execute.

##### input

`Input`

The input data to pass to the scraper.

##### options?

`Partial`\<[`ScraperExecutionOptions`](../interfaces/ScraperExecutionOptions.md)\>

Optional. Partial [ScraperExecutionOptions](../interfaces/ScraperExecutionOptions.md) that can override
               default and definition-specific options for this execution.

#### Returns

`Promise`\<[`ScraperResult`](../interfaces/ScraperResult.md)\<`Output`\>\>

A Promise that resolves to a [ScraperResult](../interfaces/ScraperResult.md) containing the outcome of the execution.

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`execute`](../interfaces/ScraperEngine.md#execute)

***

### register()

> **register**\<`Input`, `Output`\>(`definition`): `void`

Defined in: [core/scraper.ts:227](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L227)

Registers a scraper definition with the engine, making it available for execution.
If a definition with the same ID already exists, it will be overwritten.

#### Type Parameters

##### Input

`Input`

The type of the input data the scraper definition expects.

##### Output

`Output`

The type of the data the scraper definition will output.

#### Parameters

##### definition

[`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`Input`, `Output`\>

The [ScraperDefinition](../interfaces/ScraperDefinition.md) to register.

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`register`](../interfaces/ScraperEngine.md#register)

***

### getDefinition()

> **getDefinition**(`id`): `undefined` \| [`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>

Defined in: [core/scraper.ts:237](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L237)

Retrieves a registered scraper definition by its ID.

#### Parameters

##### id

`string`

The unique identifier of the scraper definition.

#### Returns

`undefined` \| [`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>

The [ScraperDefinition](../interfaces/ScraperDefinition.md) if found, otherwise `undefined`.

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`getDefinition`](../interfaces/ScraperEngine.md#getdefinition)

***

### listDefinitions()

> **listDefinitions**(): [`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>[]

Defined in: [core/scraper.ts:246](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L246)

Lists all currently registered scraper definitions.

#### Returns

[`ScraperDefinition`](../interfaces/ScraperDefinition.md)\<`unknown`, `unknown`\>[]

An array of [ScraperDefinition](../interfaces/ScraperDefinition.md) objects.

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`listDefinitions`](../interfaces/ScraperEngine.md#listdefinitions)

***

### use()

> **use**(`plugin`): `void`

Defined in: [core/scraper.ts:256](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L256)

Installs a plugin, allowing it to extend the engine's functionality.
The plugin's `install` method will be called with this engine instance.

#### Parameters

##### plugin

[`ScraperPlugin`](../interfaces/ScraperPlugin.md)

The [ScraperPlugin](../interfaces/ScraperPlugin.md) instance to install.

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`use`](../interfaces/ScraperEngine.md#use)

***

### addHook()

> **addHook**(`hook`, `handler`): `void`

Defined in: [core/scraper.ts:299](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L299)

Adds a global hook handler for a specified lifecycle event.
Global hooks are executed for all scrapers managed by this engine.

#### Parameters

##### hook

[`ScraperHook`](../type-aliases/ScraperHook.md)

The [ScraperHook](../type-aliases/ScraperHook.md) event type (e.g., 'beforeRequest', 'onError').

##### handler

[`HookHandler`](../type-aliases/HookHandler.md)\<`unknown`, `unknown`\>

The [HookHandler](../type-aliases/HookHandler.md) function to execute when the event occurs.

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`addHook`](../interfaces/ScraperEngine.md#addhook)

***

### removeHook()

> **removeHook**(`hook`, `handler`): `void`

Defined in: [core/scraper.ts:317](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L317)

Removes a previously added global hook handler.

#### Parameters

##### hook

[`ScraperHook`](../type-aliases/ScraperHook.md)

The [ScraperHook](../type-aliases/ScraperHook.md) event type.

##### handler

[`HookHandler`](../type-aliases/HookHandler.md)\<`unknown`, `unknown`\>

The specific [HookHandler](../type-aliases/HookHandler.md) function to remove.
               It must be the same function reference that was originally added.

#### Returns

`void`

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`removeHook`](../interfaces/ScraperEngine.md#removehook)

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [core/scraper.ts:336](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/scraper.ts#L336)

Gracefully shuts down the scraper engine.
This includes uninstalling all plugins that have an `uninstall` method
and shutting down the browser pool, closing all browser instances.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when shutdown is complete.

#### Implementation of

[`ScraperEngine`](../interfaces/ScraperEngine.md).[`shutdown`](../interfaces/ScraperEngine.md#shutdown)
