'use strict';

var Limit = require('./limit');

module.exports = Limits;

function Limits (methods) {
  this._card = new Limit(methods.find((method) => method.inMedium === 'card'));
  this._bank = new Limit(methods.find((method) => method.inMedium === 'bank'));
  this._blockchain = new Limit(methods.find((method) => method.inMedium === 'blockchain'));
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
