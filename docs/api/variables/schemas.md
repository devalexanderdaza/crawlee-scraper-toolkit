[**crawlee-scraper-toolkit v2.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / schemas

# Variable: schemas

> `const` **schemas**: `object`

Defined in: [utils/validators.ts:89](https://github.com/devalexanderdaza/crawlee-scraper-toolkit/blob/main/src/utils/validators.ts#L89)

Common Zod schemas

## Type declaration

### url

> **url**: `ZodString`

URL schema

### email

> **email**: `ZodString`

Email schema

### nonEmptyString

> **nonEmptyString**: `ZodString`

Non-empty string schema

### positiveNumber

> **positiveNumber**: `ZodNumber`

Positive number schema

### port

> **port**: `ZodNumber`

Port number schema

### timeout

> **timeout**: `ZodNumber`

Timeout schema (in milliseconds)

### retryCount

> **retryCount**: `ZodNumber`

Retry count schema
