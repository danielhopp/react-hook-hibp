/*! react-hook-hibp v1.1.0 by Daniel Hopp <mail@danielhopp.de> */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('core-js/modules/es6.array.find');
require('core-js/modules/es6.object.assign');
require('core-js/modules/es6.array.reduce');
var react = require('react');
var sha1 = _interopDefault(require('sha1'));
var hibp = require('hibp');

var hashPrefixLength = 5;
var minRateLimit = 1500;
var defaultOptions = {
  minLength: 8,
  maxLength: 128
};
var statusCodes = ['MIN_LENGTH', 'MAX_LENGTH', 'WAITING', 'CHECKING', 'PWNED', 'NOT_PWNED', 'CHECK_FAILED'].reduce(function (acc, code) {
  var _Object$assign;

  return Object.assign({}, acc, (_Object$assign = {}, _Object$assign[code] = code, _Object$assign));
}, {});
var rateLimit = minRateLimit;
var cache = {};
var previousCheckTimestamp = null;
var isChecking = false;
var checkTimer = null;
var usePasswordCheck = function usePasswordCheck(options) {
  if (options === void 0) {
    options = {};
  }

  var _useState = react.useState(null),
      status = _useState[0],
      _setStatus = _useState[1];

  var opts = Object.assign({}, defaultOptions, {
    options: options
  });
  return [status, function (password) {
    if (password.length < opts.minLength) {
      _setStatus(statusCodes.MIN_LENGTH);

      return;
    }

    if (password.length > opts.maxLength) {
      _setStatus(statusCodes.MAX_LENGTH);

      return;
    }

    var hash = sha1(password).toUpperCase();

    if (cache[hash]) {
      _setStatus(cache[hash]);

      return;
    }

    if (checkTimer) {
      _setStatus(statusCodes.WAITING);

      return;
    }

    if (isChecking) {
      _setStatus(statusCodes.WAITING);

      checkTimer = setTimeout(function () {
        check({
          hash: hash,
          setStatus: _setStatus
        });
        checkTimer = null;
      }, rateLimit);
      return;
    }

    var now = new Date().getTime();
    var waitingTime = previousCheckTimestamp ? rateLimit - (now - previousCheckTimestamp) : 0;

    if (waitingTime > 0) {
      _setStatus(statusCodes.WAITING);

      checkTimer = setTimeout(function () {
        check({
          hash: hash,
          setStatus: function setStatus(status) {
            return _setStatus(checkTimer ? statusCodes.WAITING : status);
          }
        });
        checkTimer = null;
      }, waitingTime);
      return;
    }

    check({
      hash: hash,
      setStatus: _setStatus
    });
  }];
};
var setRateLimit = function setRateLimit(milliseconds) {
  if (milliseconds < minRateLimit) {
    throw new Error("Minimum rate limit is " + minRateLimit + " ms.");
  }

  rateLimit = milliseconds;
};

var check = function check(_ref) {
  var hash = _ref.hash,
      setStatus = _ref.setStatus;
  setStatus(statusCodes.CHECKING);
  isChecking = true;
  previousCheckTimestamp = new Date().getTime();
  var prefix = hash.substr(0, hashPrefixLength);
  var suffix = hash.substr(hashPrefixLength);
  hibp.pwnedPasswordRange(prefix).then(function (results) {
    var found = results.find(function (result) {
      return result.suffix === suffix;
    });
    var status = found ? statusCodes.PWNED : statusCodes.NOT_PWNED;
    cache[hash] = status;
    isChecking = false;
    setStatus(status);
  }).catch(function () {
    isChecking = false;
    setStatus(statusCodes.CHECK_FAILED);
  });
};

exports.minRateLimit = minRateLimit;
exports.defaultOptions = defaultOptions;
exports.statusCodes = statusCodes;
exports.usePasswordCheck = usePasswordCheck;
exports.setRateLimit = setRateLimit;
//# sourceMappingURL=index.cjs.js.map
