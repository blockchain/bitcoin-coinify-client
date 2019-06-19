'use strict';

var Limit = require('./limit');

module.exports = Limits;

function Limits (methods) {
  var card = methods.find((method) => method.inMedium === 'card');
  let bank = methods.find((method) => method.inMedium === 'bank');
  let blockchain = methods.find((method) => method.inMedium === 'blockchain');

  this._card = card ? new Limit(card) : null;
  this._bank = bank ? new Limit(bank) : null;
  this._blockchain = blockchain ? new Limit(blockchain) : null;
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
