[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / createConfig

# Function: createConfig()

> **createConfig**(): [`ConfigBuilder`](../-internal-/classes/ConfigBuilder.md)

Defined in: [core/config-manager.ts:574](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L574)

Factory function that creates and returns a new `ConfigBuilder` instance.
This is the recommended way to start programmatically building a configuration.

## Returns

[`ConfigBuilder`](../-internal-/classes/ConfigBuilder.md)

A new `ConfigBuilder` instance.

## Example

```ts
import { createConfig } from 'crawlee-scraper-toolkit';
const config = createConfig().defaultOptions({ timeout: 60000 }).build();
```
