[**crawlee-scraper-toolkit v1.0.1**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / ScraperHook

# Type Alias: ScraperHook

> **ScraperHook** = `"beforeRequest"` \| `"afterRequest"` \| `"onSuccess"` \| `"onError"` \| `"onRetry"`

Defined in: [core/types.ts:91](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/core/types.ts#L91)

Defines the types of hooks available in the scraper lifecycle.
- `beforeRequest`: Executed before a scraping request is made (e.g., before navigation).
- `afterRequest`: Executed after a scraping request has completed, regardless of success or failure.
- `onSuccess`: Executed only if the `parse` function completes successfully and returns data.
- `onError`: Executed if any error occurs during the scraping process (navigation, parsing, etc.).
- `onRetry`: Executed before a retry attempt is made after a failure.
