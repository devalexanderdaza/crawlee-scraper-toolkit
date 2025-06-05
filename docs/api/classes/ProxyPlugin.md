[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ProxyPlugin

# Class: ProxyPlugin

Defined in: plugins/index.ts:98

Proxy rotation plugin

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new ProxyPlugin**(`proxies`): `ProxyPlugin`

Defined in: plugins/index.ts:105

#### Parameters

##### proxies

`string`[]

#### Returns

`ProxyPlugin`

## Properties

### name

> **name**: `string` = `'proxy'`

Defined in: plugins/index.ts:99

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: plugins/index.ts:100

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: plugins/index.ts:109

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

Defined in: plugins/index.ts:127

Add proxy to the rotation

#### Parameters

##### proxy

`string`

#### Returns

`void`

***

### removeProxy()

> **removeProxy**(`proxy`): `void`

Defined in: plugins/index.ts:134

Remove proxy from rotation

#### Parameters

##### proxy

`string`

#### Returns

`void`

***

### getProxies()

> **getProxies**(): `string`[]

Defined in: plugins/index.ts:147

Get current proxy list

#### Returns

`string`[]
