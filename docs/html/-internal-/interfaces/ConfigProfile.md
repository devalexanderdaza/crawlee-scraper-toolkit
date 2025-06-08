[**crawlee-scraper-toolkit v2.0.0**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ConfigProfile

# Interface: ConfigProfile

Defined in: [core/config-manager.ts:27](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L27)

Defines the structure for a configuration profile, allowing predefined sets of configurations.

## Properties

### name

> **name**: `string`

Defined in: [core/config-manager.ts:29](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L29)

The unique name of the profile (e.g., "development", "production_large_pool").

***

### description?

> `optional` **description**: `string`

Defined in: [core/config-manager.ts:31](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L31)

An optional description for what this profile is intended for.

***

### config

> **config**: `Partial`\<[`ScraperEngineConfig`](../../interfaces/ScraperEngineConfig.md)\>

Defined in: [core/config-manager.ts:33](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L33)

The partial scraper engine configuration that this profile applies.
