[**crawlee-scraper-toolkit v1.0.1**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ConfigSource

# Type Alias: ConfigSource

> **ConfigSource** = `"file"` \| `"env"` \| `"programmatic"` \| `"default"`

Defined in: [core/config-manager.ts:22](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L22)

Represents the source from which a configuration part was loaded.
- `file`: Configuration loaded from a YAML or JSON file.
- `env`: Configuration loaded from environment variables.
- `programmatic`: Configuration applied directly via code (e.g., `updateConfig`, `applyProfile`).
- `default`: The base default configuration of the toolkit.
