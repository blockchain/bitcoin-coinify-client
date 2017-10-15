'use strict';

module.exports = Limit;

let fallbackLimits = {DKK: Infinity, EUR: Infinity, USD: Infinity, GBP: Infinity, BTC: Infinity};

function Limit (method) {
  this._inRemaining = method.limitInAmounts || fallbackLimits;
  this._minimumInAmounts = method.minimumInAmounts;
}

Object.defineProperties(Limit.prototype, {
  'inRemaining': {
    configurable: false,
    get: function () {
      return this._inRemaining;
    }
  },
  'minimumInAmounts': {
    configurable: false,
    get: function () {
      return this._minimumInAmounts;
    }
  }
});
