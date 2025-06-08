[**crawlee-scraper-toolkit v2.0.1**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ConfigBuilder

# Class: ConfigBuilder

Defined in: [core/config-manager.ts:480](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L480)

Provides a fluent (builder) API for programmatically constructing a `ScraperEngineConfig` object.
Useful for creating configurations in code rather than relying on files or environment variables.
An instance of this builder is typically obtained via the `createConfig()` factory function.

## Example

```ts
import { createConfig } from 'crawlee-scraper-toolkit';
const myConfig = createConfig()
  .browserPool({ maxSize: 3 })
  .defaultOptions({ retries: 1 })
  .logging({ level: 'debug' })
  .build();
```

## Constructors

### Constructor

> **new ConfigBuilder**(): `ConfigBuilder`

#### Returns

`ConfigBuilder`

## Methods

### browserPool()

> **browserPool**(`config`): `ConfigBuilder`

Defined in: [core/config-manager.ts:489](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L489)

Sets or updates the browser pool configuration.
Merges provided partial configuration with existing browser pool settings in the builder.

#### Parameters

##### config

`Partial`\<[`BrowserPoolConfig`](../../interfaces/BrowserPoolConfig.md)\>

A `Partial<BrowserPoolConfig>` object.

#### Returns

`ConfigBuilder`

The `ConfigBuilder` instance for chaining.

***

### defaultOptions()

> **defaultOptions**(`options`): `ConfigBuilder`

Defined in: [core/config-manager.ts:508](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L508)

Sets or updates the default scraper execution options.
Merges provided partial options with existing default options in the builder.

#### Parameters

##### options

`Partial`\<[`ScraperExecutionOptions`](../../interfaces/ScraperExecutionOptions.md)\>

A `Partial<ScraperExecutionOptions>` object.

#### Returns

`ConfigBuilder`

The `ConfigBuilder` instance for chaining.

***

### plugins()

> **plugins**(`plugins`): `ConfigBuilder`

Defined in: [core/config-manager.ts:529](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L529)

Adds a list of plugin names or paths to the configuration.
These plugins will be loaded by the `ScraperEngine`.

#### Parameters

##### plugins

`string`[]

An array of strings, where each string is a plugin name or a path to a plugin module.

#### Returns

`ConfigBuilder`

The `ConfigBuilder` instance for chaining.

***

### logging()

> **logging**(`config`): `ConfigBuilder`

Defined in: [core/config-manager.ts:540](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L540)

Sets or updates the logging configuration.
Merges provided partial logging configuration with existing settings in the builder.

#### Parameters

##### config

An object with optional `level` and `format` properties.

###### level?

`"debug"` \| `"info"` \| `"warn"` \| `"error"`

###### format?

`"json"` \| `"text"`

#### Returns

`ConfigBuilder`

The `ConfigBuilder` instance for chaining.

***

### build()

> **build**(): `Partial`\<[`ScraperEngineConfig`](../../interfaces/ScraperEngineConfig.md)\>

Defined in: [core/config-manager.ts:560](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L560)

Finalizes the configuration building process and returns the constructed
partial `ScraperEngineConfig` object. This object can then be used to
initialize a `ScraperEngine` or update a `ConfigManager`.

#### Returns

`Partial`\<[`ScraperEngineConfig`](../../interfaces/ScraperEngineConfig.md)\>

A `Partial<ScraperEngineConfig>` object.
