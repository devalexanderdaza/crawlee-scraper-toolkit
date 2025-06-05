[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ConfigManager

# Class: ConfigManager

Defined in: [core/config-manager.ts:103](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L103)

Configuration manager for the scraper toolkit

## Constructors

### Constructor

> **new ConfigManager**(`autoLoad`): `ConfigManager`

Defined in: [core/config-manager.ts:108](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L108)

#### Parameters

##### autoLoad

`boolean` = `true`

#### Returns

`ConfigManager`

## Methods

### getConfig()

> **getConfig**(): [`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)

Defined in: [core/config-manager.ts:118](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L118)

Get the current configuration

#### Returns

[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)

***

### updateConfig()

> **updateConfig**(`updates`): `void`

Defined in: [core/config-manager.ts:125](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L125)

Update configuration programmatically

#### Parameters

##### updates

`Partial`\<[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)\>

#### Returns

`void`

***

### loadFromFile()

> **loadFromFile**(`filePath`): `void`

Defined in: [core/config-manager.ts:133](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L133)

Load configuration from file

#### Parameters

##### filePath

`string`

#### Returns

`void`

***

### loadFromEnv()

> **loadFromEnv**(): `void`

Defined in: [core/config-manager.ts:176](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L176)

Load configuration from environment variables

#### Returns

`void`

***

### applyProfile()

> **applyProfile**(`profileName`): `void`

Defined in: [core/config-manager.ts:258](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L258)

Apply a configuration profile

#### Parameters

##### profileName

`string`

#### Returns

`void`

***

### getProfiles()

> **getProfiles**(): [`ConfigProfile`](../-internal-/interfaces/ConfigProfile.md)[]

Defined in: [core/config-manager.ts:271](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L271)

Get available profiles

#### Returns

[`ConfigProfile`](../-internal-/interfaces/ConfigProfile.md)[]

***

### validateConfig()

> **validateConfig**(`config?`): `object`

Defined in: [core/config-manager.ts:278](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L278)

Validate configuration

#### Parameters

##### config?

`Partial`\<[`ScraperEngineConfig`](../interfaces/ScraperEngineConfig.md)\>

#### Returns

`object`

##### valid

> **valid**: `boolean`

##### errors

> **errors**: `string`[]

***

### exportConfig()

> **exportConfig**(`format`): `string`

Defined in: [core/config-manager.ts:298](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/config-manager.ts#L298)

Export current configuration

#### Parameters

##### format

`"json"` | `"yaml"`

#### Returns

`string`
