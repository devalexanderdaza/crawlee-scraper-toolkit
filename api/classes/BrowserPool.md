[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / BrowserPool

# Class: BrowserPool

Defined in: [core/browser-pool.ts:10](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L10)

Enhanced browser pool with better resource management and crawlee integration

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new BrowserPool**(`config`, `logger`): `BrowserPool`

Defined in: [core/browser-pool.ts:17](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L17)

#### Parameters

##### config

[`BrowserPoolConfig`](../interfaces/BrowserPoolConfig.md)

##### logger

[`Logger`](../interfaces/Logger.md)

#### Returns

`BrowserPool`

#### Overrides

`EventEmitter.constructor`

## Methods

### acquire()

> **acquire**(): `Promise`\<[`BrowserInstance`](../interfaces/BrowserInstance.md)\>

Defined in: [core/browser-pool.ts:27](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L27)

Acquire a browser instance from the pool

#### Returns

`Promise`\<[`BrowserInstance`](../interfaces/BrowserInstance.md)\>

***

### release()

> **release**(`instance`): `void`

Defined in: [core/browser-pool.ts:77](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L77)

Release a browser instance back to the pool

#### Parameters

##### instance

[`BrowserInstance`](../interfaces/BrowserInstance.md)

#### Returns

`void`

***

### getStats()

> **getStats**(): `object`

Defined in: [core/browser-pool.ts:99](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L99)

Get pool statistics

#### Returns

`object`

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

Defined in: [core/browser-pool.ts:117](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L117)

Cleanup old instances

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [core/browser-pool.ts:149](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/browser-pool.ts#L149)

Shutdown the pool and close all browsers

#### Returns

`Promise`\<`void`\>
