[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperEngineConfig

# Interface: ScraperEngineConfig

Defined in: [core/types.ts:217](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L217)

Configuration for the scraper engine

## Properties

### browserPool

> **browserPool**: [`BrowserPoolConfig`](BrowserPoolConfig.md)

Defined in: [core/types.ts:218](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L218)

***

### defaultOptions

> **defaultOptions**: [`ScraperExecutionOptions`](ScraperExecutionOptions.md)

Defined in: [core/types.ts:219](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L219)

***

### plugins

> **plugins**: `string`[]

Defined in: [core/types.ts:220](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L220)

***

### globalHooks

> **globalHooks**: `Partial`\<`Record`\<[`ScraperHook`](../type-aliases/ScraperHook.md), [`HookHandler`](../type-aliases/HookHandler.md)[]\>\>

Defined in: [core/types.ts:221](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L221)

***

### logging

> **logging**: `object`

Defined in: [core/types.ts:222](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L222)

#### level

> **level**: `"debug"` \| `"info"` \| `"warn"` \| `"error"`

#### format

> **format**: `"json"` \| `"text"`
