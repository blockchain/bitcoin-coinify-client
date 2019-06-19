'use strict';

var Limit = require('./limit');

module.exports = Limits;

var findMethod = (method, methods) => methods.find(m => m.inMedium === method);

function Limits (methods) {
  var card = findMethod('card', methods);
  var bank = findMethod('bank', methods);
  var blockchain = findMethod('blockchain', methods);
  
  this._card = card ? new Limit(findMethod('card')) : null;
  this._bank = bank ? new Limit(findMethod('bank')) : null;
  this._blockchain = blockchain ? new Limit(findMethod('blockchain')) : null;
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
