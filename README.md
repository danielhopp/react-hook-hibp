# react-hook-hibp

[![npm](https://img.shields.io/npm/v/react-hook-hibp.svg)](https://www.npmjs.com/package/react-hook-hibp)

_[React Hook](https://reactjs.org/hooks) for password input validation based on [Justin Hall](https://github.com/wKovacs64)'s [hibp](https://github.com/wkovacs64/hibp) based on [Troy Hunt](https://www.troyhunt.com/)'s [Have I been pwned?](https://haveibeenpwned.com/)_

**Warning: React Hooks are currently a RFC proposal and may be subject to change.**


## [Demo](https://danielhopp.github.io/react-hook-hibp/)

## Description

This module implements [NIST](https://www.nist.gov/) password guidelines applied to to input elements within the body of a [functional React Component](https://reactjs.org/docs/components-and-props.html#function-and-class-components).

> Memorized secrets SHALL be at least 8 characters in length […]
>
> There should no longer be a requirement to have a certain mix of special characters, upper case letters and numbers for a password. […]
>
> Mandatory validation of newly created passwords against a list of commonly-used, expected, or compromised passwords. […]

Source: [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)


## Installation

```shell
yarn add react-hook-hibp
```

## Usage

### Example

```javascript
import React, { useState, useEffect } from 'react'
import usePasswordCheck from 'react-hook-hibp'

export default () => {
  const [value, setValue] = useState('')
  const [statusCode, checkPassword] = usePasswordCheck()
  useEffect(() => checkPassword(value), [value])

  return (
    <>
      <input
        type="password"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <p>{value !== '' && statusCode}</p>
    </>
  )
}
```

### usePasswordCheck()

```javascript
const [statusCode, checkPassword] = usePasswordCheck(options)
```

Call `checkPassword()` on input change, handle form validation according to `statusCode`.

### options

```javascript
export const defaultOptions = {
  minLength: 8,
  maxLength: 128
}
```

### statusCodes

| Key        | Description |
| ---------- | ----------- |
| MIN_LENGTH | Password is too short. |
| MAX_LENGTH | Password is too long. |
| WAITING | Waiting for API access for next check. |
| CHECKING | Checking password |
| CHECK_FAILED | Checking password failed  |
| PWNED | Password insecure |
| NOT_PWNED | Password (probably) secure |

## setRateLimit()

[API Rate limiting](https://haveibeenpwned.com/API/v2#RateLimiting) is being respected and reflected in `statusCodes.WAITING`. Increase rate limit if you expect concurrent usage by different processes/apps/devices using the same IP.
Example:
```javascript
import usePasswordCheck, { setRateLimit } from 'react-hook-hibp'

setRateLimit(3000)
```

## Notes

* [k-anonymity](https://en.wikipedia.org/wiki/K-anonymity): Only the first five characters of the *hashed* password are submitted to the [haveibeenpwned.com range API](https://haveibeenpwned.com/API/v2#SearchingPwnedPasswordsByRange) service.

* API results are being cached non-persistently

## License

This module is distributed under the [MIT License][license].
