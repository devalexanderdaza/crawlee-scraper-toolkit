[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperEngineConfig

# Interface: ScraperEngineConfig

Defined in: [core/types.ts:326](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L326)

Configuration for the scraper engine

## Properties

### browserPool

> **browserPool**: [`BrowserPoolConfig`](BrowserPoolConfig.md)

Defined in: [core/types.ts:327](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L327)

***

### defaultOptions

> **defaultOptions**: [`ScraperExecutionOptions`](ScraperExecutionOptions.md)

Defined in: [core/types.ts:328](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L328)

***

### plugins

> **plugins**: `string`[]

Defined in: [core/types.ts:330](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L330)

List of plugin names or paths to be automatically installed upon engine initialization.

***

### globalHooks

> **globalHooks**: `Partial`\<`Record`\<[`ScraperHook`](../type-aliases/ScraperHook.md), [`HookHandler`](../type-aliases/HookHandler.md)[]\>\>

Defined in: [core/types.ts:335](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L335)

Global lifecycle hooks to be applied to all scrapers.
Keys are hook names (`ScraperHook`), and values are arrays of `HookHandler` functions.

***

### logging

> **logging**: `object`

Defined in: [core/types.ts:337](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L337)

Configuration for the engine's logger.

#### level

> **level**: `"debug"` \| `"info"` \| `"warn"` \| `"error"`

Minimum log level to output.

#### format

> **format**: `"json"` \| `"text"`

Format of the log output.
