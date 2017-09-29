'use strict';

var Limit = require('./limit');

module.exports = Limits;

function Limits (max, min, rates) {
  this._card = new Limit(max.card, min, rates);
  this._bank = new Limit(max.bank, min, rates);
  this._blockchain = new Limit(max.bank, min, rates);
}

Object.defineProperties(Limits.prototype, {
  'card': {
    configurable: false,
    get: function () {
      return this._card;
    }
  },
  'bank': {
    configurable: false,
    get: function () {
      return this._bank;
    }
  },
  'blockchain': {
    configurable: false,
    get: function () {
      return this._blockchain;
    }
  }
});
