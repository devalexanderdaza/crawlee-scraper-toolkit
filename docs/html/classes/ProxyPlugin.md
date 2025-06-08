[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ProxyPlugin

# Class: ProxyPlugin

Defined in: [plugins/index.ts:99](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L99)

Proxy rotation plugin

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new ProxyPlugin**(`proxies`): `ProxyPlugin`

Defined in: [plugins/index.ts:106](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L106)

#### Parameters

##### proxies

`string`[]

#### Returns

`ProxyPlugin`

## Properties

### name

> **name**: `string` = `'proxy'`

Defined in: [plugins/index.ts:100](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L100)

The unique name of the plugin.

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: [plugins/index.ts:101](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L101)

The version of the plugin (e.g., semver string).

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: [plugins/index.ts:110](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L110)

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

### addProxy()

> **addProxy**(`proxy`): `void`

Defined in: [plugins/index.ts:128](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L128)

Add proxy to the rotation

#### Parameters

##### proxy

`string`

#### Returns

`void`

***

### removeProxy()

> **removeProxy**(`proxy`): `void`

Defined in: [plugins/index.ts:135](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L135)

Remove proxy from rotation

#### Parameters

##### proxy

`string`

#### Returns

`void`

***

### getProxies()

> **getProxies**(): `string`[]

Defined in: [plugins/index.ts:148](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L148)

Get current proxy list

#### Returns

`string`[]
