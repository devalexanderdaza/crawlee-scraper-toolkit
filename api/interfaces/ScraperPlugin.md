[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperPlugin

# Interface: ScraperPlugin

Defined in: [core/types.ts:247](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L247)

Defines the interface for a ScraperPlugin.
Plugins can extend the functionality of the ScraperEngine,
for example, by adding new methods, hooks, or modifying behavior.

## Properties

### name

> **name**: `string`

Defined in: [core/types.ts:249](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L249)

The unique name of the plugin.

***

### version

> **version**: `string`

Defined in: [core/types.ts:251](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L251)

The version of the plugin (e.g., semver string).

***

### install()

> **install**: (`engine`) => `void`

Defined in: [core/types.ts:258](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L258)

Called when the plugin is installed via `engine.use(plugin)`.
This method should implement the plugin's setup logic, such as
registering global hooks, modifying engine properties, etc.

#### Parameters

##### engine

[`ScraperEngine`](ScraperEngine.md)

The instance of the ScraperEngine.

#### Returns

`void`

***

### uninstall()?

> `optional` **uninstall**: (`engine`) => `void`

Defined in: [core/types.ts:264](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L264)

Optional method called if the plugin system supports uninstallation.
Should clean up any resources or modifications made by the `install` method.

#### Parameters

##### engine

[`ScraperEngine`](ScraperEngine.md)

The instance of the ScraperEngine.

#### Returns

`void`
