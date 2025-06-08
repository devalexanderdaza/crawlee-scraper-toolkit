[**crawlee-scraper-toolkit v2.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / CachePlugin

# Class: CachePlugin

Defined in: [plugins/index.ts:36](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L36)

Cache plugin for caching scraper results

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new CachePlugin**(`options`): `CachePlugin`

Defined in: [plugins/index.ts:43](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L43)

#### Parameters

##### options

###### defaultTtl?

`number`

#### Returns

`CachePlugin`

## Properties

### name

> **name**: `string` = `'cache'`

Defined in: [plugins/index.ts:37](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L37)

The unique name of the plugin.

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: [plugins/index.ts:38](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L38)

The version of the plugin (e.g., semver string).

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: [plugins/index.ts:47](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L47)

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

### clearCache()

> **clearCache**(): `void`

Defined in: [plugins/index.ts:81](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L81)

Clear cache

#### Returns

`void`

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [plugins/index.ts:88](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L88)

Get cache statistics

#### Returns

`object`

##### size

> **size**: `number`

##### keys

> **keys**: `string`[]
