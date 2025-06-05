[**crawlee-scraper-toolkit v1.0.0**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ConfigBuilder

# Class: ConfigBuilder

Defined in: core/config-manager.ts:393

Configuration builder for fluent API

## Constructors

### Constructor

> **new ConfigBuilder**(): `ConfigBuilder`

#### Returns

`ConfigBuilder`

## Methods

### browserPool()

> **browserPool**(`config`): `ConfigBuilder`

Defined in: core/config-manager.ts:399

Set browser pool configuration

#### Parameters

##### config

`Partial`\<[`BrowserPoolConfig`](../../interfaces/BrowserPoolConfig.md)\>

#### Returns

`ConfigBuilder`

***

### defaultOptions()

> **defaultOptions**(`options`): `ConfigBuilder`

Defined in: core/config-manager.ts:414

Set default execution options

#### Parameters

##### options

`Partial`\<[`ScraperExecutionOptions`](../../interfaces/ScraperExecutionOptions.md)\>

#### Returns

`ConfigBuilder`

***

### plugins()

> **plugins**(`plugins`): `ConfigBuilder`

Defined in: core/config-manager.ts:432

Add plugins

#### Parameters

##### plugins

`string`[]

#### Returns

`ConfigBuilder`

***

### logging()

> **logging**(`config`): `ConfigBuilder`

Defined in: core/config-manager.ts:440

Set logging configuration

#### Parameters

##### config

###### level?

`"debug"` \| `"info"` \| `"warn"` \| `"error"`

###### format?

`"json"` \| `"text"`

#### Returns

`ConfigBuilder`

***

### build()

> **build**(): `Partial`\<[`ScraperEngineConfig`](../../interfaces/ScraperEngineConfig.md)\>

Defined in: core/config-manager.ts:457

Build the configuration

#### Returns

`Partial`\<[`ScraperEngineConfig`](../../interfaces/ScraperEngineConfig.md)\>
