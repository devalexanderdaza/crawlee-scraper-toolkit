[**crawlee-scraper-toolkit v2.0.1**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ConfigFile

# Interface: ConfigFile

Defined in: [core/config-manager.ts:39](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L39)

Defines the expected structure of a configuration file (e.g., `scraper.config.yaml`).

## Properties

### profiles?

> `optional` **profiles**: `Record`\<`string`, [`ConfigProfile`](ConfigProfile.md)\>

Defined in: [core/config-manager.ts:49](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L49)

A map of configuration profiles, where each key is the profile name.

#### Example

```ts
profiles:
  development:
    config: { browserPool: { maxSize: 2 } }
  production:
    config: { browserPool: { maxSize: 10 } }
```

***

### default?

> `optional` **default**: `Partial`\<[`ScraperEngineConfig`](../../interfaces/ScraperEngineConfig.md)\>

Defined in: [core/config-manager.ts:51](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L51)

Default configuration settings to be applied if no specific profile is chosen or to serve as a base.

***

### extends?

> `optional` **extends**: `string`[]

Defined in: [core/config-manager.ts:61](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L61)

An array of paths to other configuration files to extend from.
Paths are relative to the current configuration file.
Configurations are merged shallowly, with later files overriding earlier ones.

#### Example

```ts
extends:
  - ./base.config.yaml
  - ./production.config.yaml
```
