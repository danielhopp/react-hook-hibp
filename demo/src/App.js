import React, { useState, useRef, useEffect } from 'react'

import { usePasswordCheck, defaultOptions, statusCodes } from 'react-hook-hibp'
import htmlFor from './htmlFor'

import './App.css'

const { minLength, maxLength } = defaultOptions

const messages = {
  MIN_LENGTH: `Your password must be at least ${minLength} characters long.`,
  MAX_LENGTH: `Your password maximum length is ${maxLength} characters.`,
  WAITING: 'Waiting...',
  CHECKING: 'Checking...',
  PWNED: 'This password is insecure. Please pick a different one.',
  NOT_PWNED: 'Your password looks fine.',
  CHECK_FAILED: 'Remote password check failed!'
}

export default () => {
  const [value, setValue] = useState('')
  const inputElement = useRef(null)
  const [passwordCheckStatus, checkPassword] = usePasswordCheck()
  useEffect(() => checkPassword(value), [value, checkPassword])
  const isValid = passwordCheckStatus === statusCodes.NOT_PWNED
  useEffect(
    () => {
      if (!isValid) {
        inputElement.current.focus()
      }
      return
    },
    [isValid]
  )

  return (
    <div className="App">
      <div style={{ float: 'right' }}>
        <a
          className="github-button"
          href="https://github.com/danielhopp/react-hook-hibp/issues"
          data-size="large"
          aria-label="Issue danielhopp/react-hook-hibp on GitHub">
          Issue
        </a>
      </div>
      <h1>Demo</h1>
      <form onSubmit={e => e.preventDefault() && console.log(value)}>
        <p>
          <label htmlFor={htmlFor(inputElement)}>Choose a password</label>
          <input
            ref={inputElement}
            type="password"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </p>
        <p style={{ minHeight: 18 }}>
          {value !== '' && messages[passwordCheckStatus]}
        </p>
        <p>
          <button type="submit" disabled={!isValid}>
            Submit
          </button>
        </p>
      </form>
    </div>
  )
}
