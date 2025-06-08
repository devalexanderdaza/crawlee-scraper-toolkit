[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / configManager

# Variable: configManager

> `const` **configManager**: [`ConfigManager`](../classes/ConfigManager.md)

Defined in: [core/config-manager.ts:466](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L466)

A global, pre-initialized instance of `ConfigManager`.
This instance automatically loads configurations from default files and environment variables
upon module initialization, making it ready for immediate use.

## Example

```ts
import { configManager } from 'crawlee-scraper-toolkit';
const currentConfig = configManager.getConfig();
```
