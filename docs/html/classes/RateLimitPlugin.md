[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / RateLimitPlugin

# Class: RateLimitPlugin

Defined in: plugins/index.ts:155

Rate limiting plugin

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new RateLimitPlugin**(`options`): `RateLimitPlugin`

Defined in: plugins/index.ts:163

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

Defined in: plugins/index.ts:156

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: plugins/index.ts:157

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: plugins/index.ts:168

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

Defined in: plugins/index.ts:210

Get rate limit statistics

#### Returns

`Record`\<`string`, \{ `requests`: `number`; `window`: `number`; \}\>
