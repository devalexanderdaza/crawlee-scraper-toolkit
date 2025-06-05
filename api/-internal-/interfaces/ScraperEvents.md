[**crawlee-scraper-toolkit v1.0.0**](../../README.md)

***

[crawlee-scraper-toolkit](../../globals.md) / [\<internal\>](../README.md) / ScraperEvents

# Interface: ScraperEvents

Defined in: [core/types.ts:171](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L171)

Event types emitted by the scraper engine

## Properties

### scraper:start

> **scraper:start**: `object`

Defined in: [core/types.ts:172](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L172)

#### scraperId

> **scraperId**: `string`

#### input

> **input**: `unknown`

***

### scraper:success

> **scraper:success**: `object`

Defined in: [core/types.ts:173](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L173)

#### scraperId

> **scraperId**: `string`

#### result

> **result**: [`ScraperResult`](../../interfaces/ScraperResult.md)

***

### scraper:error

> **scraper:error**: `object`

Defined in: [core/types.ts:174](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L174)

#### scraperId

> **scraperId**: `string`

#### error

> **error**: `Error`

***

### scraper:retry

> **scraper:retry**: `object`

Defined in: [core/types.ts:175](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L175)

#### scraperId

> **scraperId**: `string`

#### attempt

> **attempt**: `number`

***

### pool:acquire

> **pool:acquire**: `object`

Defined in: [core/types.ts:176](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L176)

#### instanceId

> **instanceId**: `string`

***

### pool:release

> **pool:release**: `object`

Defined in: [core/types.ts:177](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L177)

#### instanceId

> **instanceId**: `string`

***

### pool:cleanup

> **pool:cleanup**: `object`

Defined in: [core/types.ts:178](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L178)

#### removedInstances

> **removedInstances**: `number`
