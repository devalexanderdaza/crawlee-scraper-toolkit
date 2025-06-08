[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ConfigManager

# Class: ConfigManager

Defined in: [core/config-manager.ts:139](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L139)

Manages the loading, merging, and validation of scraper engine configurations.
Configurations can be sourced from files (YAML/JSON), environment variables,
programmatic updates, and predefined profiles.
It follows a layered approach for merging configurations:
Defaults < File < Environment Variables < Programmatic Updates/Profiles.

## Constructors

### Constructor

> **new ConfigManager**(`autoLoad`): `ConfigManager`

Defined in: [core/config-manager.ts:149](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L149)

Creates an instance of ConfigManager.

#### Parameters

##### autoLoad

`boolean` = `true`

If `true` (default), automatically loads configuration from
default file paths (e.g., `./scraper.config.yaml`) and environment variables upon instantiation.

#### Returns

`ConfigManager`

## Methods

### getConfig()

> **getConfig**(): [`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)

Defined in: [core/config-manager.ts:160](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L160)

Retrieves a deep copy of the current, fully merged scraper engine configuration.

#### Returns

[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)

The current `ScraperEngineConfig` object.

***

### updateConfig()

> **updateConfig**(`updates`): `void`

Defined in: [core/config-manager.ts:171](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L171)

Programmatically updates the current configuration with the provided partial configuration.
These updates are applied with the highest precedence, overriding any other sources.

#### Parameters

##### updates

`Partial`\<[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)\>

A `Partial<ScraperEngineConfig>` object containing the configuration updates.

#### Returns

`void`

***

### loadFromFile()

> **loadFromFile**(`filePath`): `void`

Defined in: [core/config-manager.ts:183](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L183)

Loads configuration from a specified file path. Supports JSON and YAML formats.
The loaded configuration is merged into the existing configuration.
Can handle `extends` within configuration files to inherit from other files.

#### Parameters

##### filePath

`string`

The absolute or relative path to the configuration file.

#### Returns

`void`

#### Throws

Error if the file is not found, unsupported format, or parsing fails.

***

### loadFromEnv()

> **loadFromEnv**(): `void`

Defined in: [core/config-manager.ts:233](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L233)

Loads configuration settings from predefined environment variables.
Environment variables typically override file configurations but are overridden
by programmatic updates.
Recognized environment variables include:
- `BROWSER_POOL_SIZE`, `BROWSER_MAX_AGE_MS`, `BROWSER_HEADLESS`, `BROWSER_ARGS`
- `SCRAPING_MAX_RETRIES`, `SCRAPING_TIMEOUT`, `SCRAPING_USER_AGENT`
- `LOG_LEVEL`, `LOG_FORMAT`

#### Returns

`void`

***

### applyProfile()

> **applyProfile**(`profileName`): `void`

Defined in: [core/config-manager.ts:319](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L319)

Applies a named configuration profile to the current configuration.
The profile's configuration is treated as a programmatic update,
overriding other sources.

#### Parameters

##### profileName

`string`

The name of the profile to apply (must be loaded from a config file).

#### Returns

`void`

#### Throws

Error if the specified profile name is not found.

***

### getProfiles()

> **getProfiles**(): [`ConfigProfile`](../-internal-/interfaces/ConfigProfile.md)[]

Defined in: [core/config-manager.ts:333](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L333)

Retrieves a list of all currently loaded configuration profiles.

#### Returns

[`ConfigProfile`](../-internal-/interfaces/ConfigProfile.md)[]

An array of `ConfigProfile` objects.

***

### validateConfig()

> **validateConfig**(`config?`): `object`

Defined in: [core/config-manager.ts:345](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L345)

Validates a given configuration object (or the current configuration if none is provided)
against the defined Zod schema.

#### Parameters

##### config?

`Partial`\<[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)\>

Optional. A `Partial<ScraperEngineConfig>` to validate. If not provided,
the ConfigManager's current internal configuration is validated.

#### Returns

`object`

An object with `valid: boolean` and `errors: string[]`.
         `errors` is an array of human-readable error messages if validation fails.

##### valid

> **valid**: `boolean`

##### errors

> **errors**: `string`[]

***

### exportConfig()

> **exportConfig**(`format`): `string`

Defined in: [core/config-manager.ts:368](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L368)

Exports the current, fully merged configuration to a string in the specified format.

#### Parameters

##### format

The desired output format, either 'json' or 'yaml'. Defaults to 'yaml'.

`"json"` | `"yaml"`

#### Returns

`string`

A string representation of the current configuration.
