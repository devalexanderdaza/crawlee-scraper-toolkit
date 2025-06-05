[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperPlugin

# Interface: ScraperPlugin

Defined in: [core/types.ts:161](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L161)

Plugin interface for extending scraper functionality

## Properties

### name

> **name**: `string`

Defined in: [core/types.ts:162](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L162)

***

### version

> **version**: `string`

Defined in: [core/types.ts:163](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L163)

***

### install()

> **install**: (`scraper`) => `void`

Defined in: [core/types.ts:164](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L164)

#### Parameters

##### scraper

[`ScraperEngine`](ScraperEngine.md)

#### Returns

`void`

***

### uninstall()?

> `optional` **uninstall**: (`scraper`) => `void`

Defined in: [core/types.ts:165](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L165)

#### Parameters

##### scraper

[`ScraperEngine`](ScraperEngine.md)

#### Returns

`void`
