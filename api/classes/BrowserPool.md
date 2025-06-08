[**crawlee-scraper-toolkit v2.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / BrowserPool

# Class: BrowserPool

Defined in: [core/browser-pool.ts:19](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L19)

Manages a pool of Playwright browser instances.
This class handles the creation, acquisition, release, and cleanup of browser instances,
ensuring efficient reuse and adherence to configured limits (e.g., max size, instance age).
It emits events related to pool operations like 'pool:acquire', 'pool:release', 'pool:cleanup'.

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new BrowserPool**(`config`, `logger`): `BrowserPool`

Defined in: [core/browser-pool.ts:31](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L31)

Creates an instance of BrowserPool.

#### Parameters

##### config

[`BrowserPoolConfig`](../interfaces/BrowserPoolConfig.md)

The configuration object for the browser pool. See [BrowserPoolConfig](../interfaces/BrowserPoolConfig.md).

##### logger

[`Logger`](../-internal-/interfaces/Logger.md)

An instance of a logger conforming to the [Logger](../-internal-/interfaces/Logger.md) interface.

#### Returns

`BrowserPool`

#### Overrides

`EventEmitter.constructor`

## Methods

### acquire()

> **acquire**(): `Promise`\<[`BrowserInstance`](../interfaces/BrowserInstance.md)\>

Defined in: [core/browser-pool.ts:48](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L48)

Acquires a browser instance from the pool.
If an idle instance is available, it's reused.
If the pool is not full, a new instance is created.
If the pool is full and no instances are idle, it waits for one to become available.
Emits 'pool:acquire' event when an instance is acquired.

#### Returns

`Promise`\<[`BrowserInstance`](../interfaces/BrowserInstance.md)\>

A Promise that resolves to an available [BrowserInstance](../interfaces/BrowserInstance.md).

#### Throws

Error if the pool is shutting down or if waiting for an instance times out.

***

### release()

> **release**(`instance`): `void`

Defined in: [core/browser-pool.ts:102](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L102)

Releases a previously acquired browser instance back to the pool,
marking it as available for reuse.
Emits 'pool:release' event.

#### Parameters

##### instance

[`BrowserInstance`](../interfaces/BrowserInstance.md)

The [BrowserInstance](../interfaces/BrowserInstance.md) to release.

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/browser-pool.ts:130](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L130)

Retrieves statistics about the current state of the browser pool.

#### Returns

`object`

An object containing:
 - `total`: The total number of browser instances currently managed by the pool (both active and idle).
 - `inUse`: The number of browser instances currently acquired and in use.
 - `available`: The number of idle browser instances available for immediate acquisition.
 - `maxSize`: The maximum number of browser instances the pool is configured to allow.

##### total

> **total**: `number`

##### inUse

> **inUse**: `number`

##### available

> **available**: `number`

##### maxSize

> **maxSize**: `number`

***

### cleanupOldInstances()

> **cleanupOldInstances**(): `Promise`\<`void`\>

Defined in: [core/browser-pool.ts:155](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L155)

Periodically cleans up old and unused browser instances from the pool.
An instance is considered old if it has not been used for a duration exceeding
`config.maxAge` and is not currently in use.
This method is typically called by an internal timer.
Emits 'pool:cleanup' event with the number of removed instances.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when the cleanup operation is complete.

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [core/browser-pool.ts:193](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L193)

Shuts down the browser pool.
This process involves stopping the cleanup timer and closing all active browser instances
managed by the pool. No new instances can be acquired after shutdown is initiated.

#### Returns

`Promise`\<`void`\>

A Promise that resolves when all browser instances have been closed and resources are freed.
