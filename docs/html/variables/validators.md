[**crawlee-scraper-toolkit v1.0.0**](../README.md)

***

[crawlee-scraper-toolkit](../globals.md) / validators

# Variable: validators

> `const` **validators**: `object`

Defined in: utils/validators.ts:26

Common validation functions

## Type declaration

### email()

> **email**: (`value`) => [`ValidationResult`](../type-aliases/ValidationResult.md)

Validate email format

#### Parameters

##### value

`string`

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)

### url()

> **url**: (`value`) => [`ValidationResult`](../type-aliases/ValidationResult.md)

Validate URL format

#### Parameters

##### value

`string`

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)

### nonEmptyString()

> **nonEmptyString**: (`value`) => [`ValidationResult`](../type-aliases/ValidationResult.md)

Validate non-empty string

#### Parameters

##### value

`string`

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)

### positiveNumber()

> **positiveNumber**: (`value`) => [`ValidationResult`](../type-aliases/ValidationResult.md)

Validate positive number

#### Parameters

##### value

`number`

#### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)

### minArrayLength()

> **minArrayLength**: (`minLength`) => (`value`) => [`ValidationResult`](../type-aliases/ValidationResult.md)

Validate array with minimum length

#### Parameters

##### minLength

`number`

#### Returns

> (`value`): [`ValidationResult`](../type-aliases/ValidationResult.md)

##### Parameters

###### value

`unknown`[]

##### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)

### hasProperties()

> **hasProperties**: (`properties`) => (`value`) => [`ValidationResult`](../type-aliases/ValidationResult.md)

Validate object has required properties

#### Parameters

##### properties

`string`[]

#### Returns

> (`value`): [`ValidationResult`](../type-aliases/ValidationResult.md)

##### Parameters

###### value

`Record`\<`string`, `unknown`\>

##### Returns

[`ValidationResult`](../type-aliases/ValidationResult.md)
