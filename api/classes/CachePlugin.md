[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / CachePlugin

# Class: CachePlugin

Defined in: [plugins/index.ts:35](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L35)

Cache plugin for caching scraper results

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new CachePlugin**(`options`): `CachePlugin`

Defined in: [plugins/index.ts:42](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L42)

#### Parameters

##### options

###### defaultTtl?

`number`

#### Returns

`CachePlugin`

## Properties

### name

> **name**: `string` = `'cache'`

Defined in: [plugins/index.ts:36](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L36)

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: [plugins/index.ts:37](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L37)

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: [plugins/index.ts:46](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L46)

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

Defined in: [plugins/index.ts:80](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L80)

Clear cache

#### Returns

`void`

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [plugins/index.ts:87](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L87)

Get cache statistics

#### Returns

`object`

##### size

> **size**: `number`

##### keys

> **keys**: `string`[]
