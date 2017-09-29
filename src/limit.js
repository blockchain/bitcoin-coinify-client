'use strict';

module.exports = Limit;

let isBitCurrency = (curr) => curr === 'BTC';

let formatRate = (rate, multiplier) => {
  let decimalPlaces = isBitCurrency(rate.curr) ? 8 : 2;
  return parseFloat((rate.amt * multiplier).toFixed(decimalPlaces));
};

function Limit (max, min, rates) {
  this._inRemaining = {};
  this._outRemaining = {};
  this._minimumInAmounts = min;
  rates.forEach((rate) => { this.inRemaining[rate.curr] = formatRate(rate, max.in); });
  rates.forEach((rate) => { this.outRemaining[rate.curr] = formatRate(rate, max.out); });
}

Object.defineProperties(Limit.prototype, {
  'inRemaining': {
    configurable: false,
    get: function () {
      return this._inRemaining;
    }
  },
  'outRemaining': {
    configurable: false,
    get: function () {
      return this._outRemaining;
    }
  },
  'minimumInAmounts': {
    configurable: false,
    get: function () {
      return this._minimumInAmounts;
    }
  }
});
