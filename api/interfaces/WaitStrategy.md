[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / WaitStrategy

# Interface: WaitStrategy

Defined in: [core/types.ts:158](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L158)

Defines the strategy for determining when a page is considered "ready" after navigation
or an action, before proceeding with parsing or further interactions.
- `selector`: Waits for a specific DOM selector to be present and visible.
- `response`: Waits for a specific network response (e.g., an API call).
- `timeout`: Waits for a fixed duration.
- `custom`: A user-defined wait logic.

## Properties

### type

> **type**: `"custom"` \| `"selector"` \| `"response"` \| `"timeout"`

Defined in: [core/types.ts:160](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L160)

The type of wait strategy to employ.

***

### config

> **config**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:162](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L162)

Configuration object specific to the chosen wait `type`.
