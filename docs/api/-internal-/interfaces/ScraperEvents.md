[**crawlee-scraper-toolkit v2.0.1**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ScraperEvents

# Interface: ScraperEvents

Defined in: [core/types.ts:271](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L271)

Defines the structure of events emitted by the ScraperEngine.
Consumers can listen to these events using `engine.on('eventName', handler)`.

## Properties

### scraper:start

> **scraper:start**: `object`

Defined in: [core/types.ts:273](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L273)

Emitted when a scraper execution starts. Payload includes scraper ID and input.

#### scraperId

> **scraperId**: `string`

#### input

> **input**: `unknown`

***

### scraper:success

> **scraper:success**: `object`

Defined in: [core/types.ts:275](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L275)

Emitted when a scraper execution succeeds. Payload includes scraper ID and the result.

#### scraperId

> **scraperId**: `string`

#### result

> **result**: [`ScraperResult`](../../interfaces/ScraperResult.md)

***

### scraper:error

> **scraper:error**: `object`

Defined in: [core/types.ts:277](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L277)

Emitted when a scraper execution fails. Payload includes scraper ID and the error.

#### scraperId

> **scraperId**: `string`

#### error

> **error**: `Error`

***

### scraper:retry

> **scraper:retry**: `object`

Defined in: [core/types.ts:279](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L279)

Emitted when a scraper execution attempt is being retried. Payload includes scraper ID and attempt number.

#### scraperId

> **scraperId**: `string`

#### attempt

> **attempt**: `number`

#### error

> **error**: `Error`

***

### pool:acquire

> **pool:acquire**: `object`

Defined in: [core/types.ts:281](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L281)

Emitted when a browser instance is acquired from the pool. Payload includes instance ID.

#### instanceId

> **instanceId**: `string`

***

### pool:release

> **pool:release**: `object`

Defined in: [core/types.ts:283](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L283)

Emitted when a browser instance is released back to the pool. Payload includes instance ID.

#### instanceId

> **instanceId**: `string`

***

### pool:cleanup

> **pool:cleanup**: `object`

Defined in: [core/types.ts:285](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L285)

Emitted when the browser pool performs a cleanup operation. Payload includes number of removed instances.

#### removedInstances

> **removedInstances**: `number`
