[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / RetryPlugin

# Class: RetryPlugin

Defined in: plugins/index.ts:6

Retry plugin with exponential backoff

## Implements

- [`ScraperPlugin`](../interfaces/ScraperPlugin.md)

## Constructors

### Constructor

> **new RetryPlugin**(`options`): `RetryPlugin`

Defined in: plugins/index.ts:13

#### Parameters

##### options

###### maxBackoffDelay?

`number`

###### backoffMultiplier?

`number`

#### Returns

`RetryPlugin`

## Properties

### name

> **name**: `string` = `'retry'`

Defined in: plugins/index.ts:7

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`name`](../interfaces/ScraperPlugin.md#name)

***

### version

> **version**: `string` = `'1.0.0'`

Defined in: plugins/index.ts:8

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`version`](../interfaces/ScraperPlugin.md#version)

## Methods

### install()

> **install**(`scraper`): `void`

Defined in: plugins/index.ts:18

#### Parameters

##### scraper

[`ScraperEngine`](../interfaces/ScraperEngine.md)

#### Returns

`void`

#### Implementation of

[`ScraperPlugin`](../interfaces/ScraperPlugin.md).[`install`](../interfaces/ScraperPlugin.md#install)
