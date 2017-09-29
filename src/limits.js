'use strict';

var Limit = require('./limit');

module.exports = Limits;

function Limits (max, min, rates) {
  this._card = new Limit(max.card, min.find((medium) => medium.inMedium === 'card'), rates);
  this._bank = new Limit(max.bank, min.find((medium) => medium.inMedium === 'bank'), rates);
  this._blockchain = new Limit(max.bank, min.find((medium) => medium.inMedium === 'blockchain'), rates);
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
