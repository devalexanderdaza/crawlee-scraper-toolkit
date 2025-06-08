[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / MetricsPlugin

# Class: MetricsPlugin

Defined in: [plugins/index.ts:229](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L229)

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

Defined in: [plugins/index.ts:230](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L230)

The unique name of the plugin.

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: [plugins/index.ts:231](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L231)

The version of the plugin (e.g., semver string).

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: [plugins/index.ts:250](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L250)

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

### getMetrics()

> **getMetrics**(): `object`

Defined in: [plugins/index.ts:282](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L282)

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

Defined in: [plugins/index.ts:289](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/plugins/index.ts#L289)

Reset metrics

#### Returns

`void`
