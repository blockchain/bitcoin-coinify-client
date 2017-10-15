'use strict';

module.exports = Level;

function Level (obj) {
  this._currency = obj.currency;
  this._feePercentage = obj.feePercentage;
  this._requirements = obj.requirements;
  this._name = obj.name;
}

Object.defineProperties(Level.prototype, {
  'currency': {
    configurable: false,
    get: function () {
      return this._currency;
    }
  },
  'feePercentage': {
    configurable: false,
    get: function () {
      return this._feePercentage;
    }
  },
  'limits': {
    configurable: false,
    get: function () {
      return this._limits;
    }
  },
  'name': {
    configurable: false,
    get: function () {
      return this._name;
    }
  },
  'requirements': {
    configurable: false,
    get: function () {
      return this._requirements;
    }
  }
});
