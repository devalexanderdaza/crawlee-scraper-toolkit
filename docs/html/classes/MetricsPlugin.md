[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / MetricsPlugin

# Class: MetricsPlugin

Defined in: plugins/index.ts:227

Metrics plugin for collecting scraper metrics

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new MetricsPlugin**(): `MetricsPlugin`

#### Returns

`MetricsPlugin`

## Properties

### name

> **name**: `string` = `'metrics'`

Defined in: plugins/index.ts:228

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: plugins/index.ts:229

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: plugins/index.ts:248

#### Parameters

##### scraper

[`ScraperEngine`](../interfaces/ScraperEngine.md)

#### Returns

`void`

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`install`](../interfaces/ScraperPlugin.md#install)

***

### getMetrics()

> **getMetrics**(): `object`

Defined in: plugins/index.ts:280

Get metrics

#### Returns

`object`

##### totalRequests

> **totalRequests**: `number` = `0`

##### successfulRequests

> **successfulRequests**: `number` = `0`

##### failedRequests

> **failedRequests**: `number` = `0`

##### totalDuration

> **totalDuration**: `number` = `0`

##### averageDuration

> **averageDuration**: `number` = `0`

##### scraperStats

> **scraperStats**: `Map`\<`string`, \{ `requests`: `number`; `successes`: `number`; `failures`: `number`; `totalDuration`: `number`; \}\>

***

### resetMetrics()

> **resetMetrics**(): `void`

Defined in: plugins/index.ts:287

Reset metrics

#### Returns

`void`
