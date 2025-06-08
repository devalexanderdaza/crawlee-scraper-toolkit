[**crawlee-scraper-toolkit v2.0.1**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / Logger

# Interface: Logger

Defined in: [core/types.ts:349](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L349)

Represents a logger instance that can be used throughout the toolkit.
This interface is compatible with common loggers like Winston or pino.

## Properties

### debug()

> **debug**: (`message`, ...`meta`) => `void`

Defined in: [core/types.ts:350](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L350)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### info()

> **info**: (`message`, ...`meta`) => `void`

Defined in: [core/types.ts:351](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L351)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### warn()

> **warn**: (`message`, ...`meta`) => `void`

Defined in: [core/types.ts:352](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L352)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### error()

> **error**: (`message`, ...`meta`) => `void`

Defined in: [core/types.ts:353](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L353)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`
