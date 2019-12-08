import { useState } from 'react'
import sha1 from 'sha1'
import { pwnedPasswordRange } from 'hibp'

// https://haveibeenpwned.com/API/v2#SearchingPwnedPasswordsByRange
const hashPrefixLength = 5

// https://haveibeenpwned.com/API/v2#RateLimiting
export const minRateLimit = 1500

export const defaultOptions = {
  minLength: 8,
  maxLength: 128
}

export const statusCodes = [
  'MIN_LENGTH',
  'MAX_LENGTH',
  'WAITING',
  'CHECKING',
  'PWNED',
  'NOT_PWNED',
  'CHECK_FAILED'
].reduce((acc, code) => ({ ...acc, [code]: code }), {})

let rateLimit = minRateLimit
let cache = {}
let previousCheckTimestamp = null
let isChecking = false
let checkTimer = null

export const usePasswordCheck = (options = {}) => {
  const [status, setStatus] = useState(null)

  const opts = {
    ...defaultOptions,
    options
  }

  return [
    status,
    password => {

      if (password.length < opts.minLength) {
        setStatus(statusCodes.MIN_LENGTH)
        return
      }

      if (password.length > opts.maxLength) {
        setStatus(statusCodes.MAX_LENGTH)
        return
      }

      const hash = sha1(password).toUpperCase()

      // cache lookup
      if (cache[hash]) {
        setStatus(cache[hash])
        return
      }

      // API request pending
      if (checkTimer) {
        setStatus(statusCodes.WAITING)
        return
      }

      // prevent parallel API request
      if (isChecking) {
        setStatus(statusCodes.WAITING)
        checkTimer = setTimeout(() => {
          check({ hash, setStatus })
          checkTimer = null
        }, rateLimit)
        return
      }

      // respect rate limit
      const now = new Date().getTime()
      const waitingTime = previousCheckTimestamp
        ? rateLimit - (now - previousCheckTimestamp)
        : 0

      if (waitingTime > 0) {
        setStatus(statusCodes.WAITING)
        checkTimer = setTimeout(() => {
          check({
            hash,
            setStatus: status =>
              setStatus(checkTimer ? statusCodes.WAITING : status)
          })
          checkTimer = null
        }, waitingTime)
        return
      }

      check({ hash, setStatus })
    }
  ]
}

export const setRateLimit = milliseconds => {
  if (milliseconds < minRateLimit) {
    throw new Error(`Minimum rate limit is ${minRateLimit} ms.`)
  }
  rateLimit = milliseconds
}


const check = ({ hash, setStatus }) => {
  setStatus(statusCodes.CHECKING)
  isChecking = true
  previousCheckTimestamp = new Date().getTime()

  const prefix = hash.substr(0, hashPrefixLength)
  const suffix = hash.substr(hashPrefixLength)

  pwnedPasswordRange(prefix)
    .then(results => {
      const found = results.find(result => result.suffix === suffix)
      const status = found ? statusCodes.PWNED : statusCodes.NOT_PWNED
      cache[hash] = status
      isChecking = false
      setStatus(status)
    })
    .catch(e => {
      isChecking = false
      setStatus(statusCodes.CHECK_FAILED)
    })
}
