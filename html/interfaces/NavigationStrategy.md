[**crawlee-scraper-toolkit v2.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / NavigationStrategy

# Interface: NavigationStrategy

Defined in: [core/types.ts:143](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L143)

Defines the strategy for navigating to the target URL(s).
- `direct`: Directly navigates to the provided URL.
- `form`: Interacts with a form (filling fields, submitting) to reach target content.
- `api`: Primarily focuses on intercepting or making API calls, browser navigation might be secondary.
- `custom`: A user-defined navigation logic.

## Properties

### type

> **type**: `"direct"` \| `"form"` \| `"api"` \| `"custom"`

Defined in: [core/types.ts:145](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L145)

The type of navigation strategy to employ.

***

### config

> **config**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:147](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L147)

Configuration object specific to the chosen navigation `type`.
