[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / RateLimitPlugin

# Class: RateLimitPlugin

Defined in: [plugins/index.ts:156](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L156)

Rate limiting plugin

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new RateLimitPlugin**(`options`): `RateLimitPlugin`

Defined in: [plugins/index.ts:164](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L164)

#### Parameters

##### options

###### defaultLimit?

`number`

###### defaultWindow?

`number`

#### Returns

`RateLimitPlugin`

## Properties

### name

> **name**: `string` = `'rateLimit'`

Defined in: [plugins/index.ts:157](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L157)

The unique name of the plugin.

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: [plugins/index.ts:158](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L158)

The version of the plugin (e.g., semver string).

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: [plugins/index.ts:169](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L169)

Called when the plugin is installed via `engine.use(plugin)`.
This method should implement the plugin's setup logic, such as
registering global hooks, modifying engine properties, etc.

#### Parameters

##### scraper

[`ScraperEngine`](../interfaces/ScraperEngine.md)

#### Returns

`void`

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`install`](../interfaces/ScraperPlugin.md#install)

***

### getStats()

> **getStats**(): `Record`\<`string`, \{ `requests`: `number`; `window`: `number`; \}\>

Defined in: [plugins/index.ts:211](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L211)

Get rate limit statistics

#### Returns

`Record`\<`string`, \{ `requests`: `number`; `window`: `number`; \}\>
