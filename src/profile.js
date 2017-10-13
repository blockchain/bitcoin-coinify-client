'use strict';

var assert = require('assert');
var Limits = require('./limits');
var Level = require('./level');

module.exports = CoinifyProfile;

function CoinifyProfile (api) {
  this._api = api;
  this._did_fetch;
}

Object.defineProperties(CoinifyProfile.prototype, {
  'fullName': {
    configurable: false,
    get: function () {
      return this._full_name;
    }
  },
  'defaultCurrency': { // read-only
    configurable: false,
    get: function () {
      return this._default_currency;
    }
  },
  'email': { // ready-only
    configurable: false,
    get: function () {
      return this._email;
    }
  },
  'gender': {
    configurable: false,
    get: function () {
      return this._gender;
    }
  },
  'mobile': { // setter not implemented yet
    configurable: false,
    get: function () {
      return this._mobile;
    }
  },
  'city': {
    configurable: false,
    get: function () {
      return this._city;
    }
  },
  'country': {
    configurable: false,
    get: function () {
      return this._country;
    }
  },
  'state': { // ISO 3166-2, the part after the dash
    configurable: false,
    get: function () {
      return this._state;
    }
  },
  'street': {
    configurable: false,
    get: function () {
      return this._street;
    }
  },
  'zipcode': {
    configurable: false,
    get: function () {
      return this._zipcode;
    }
  },
  'level': {
    configurable: false,
    get: function () {
      return this._level;
    }
  },
  'nextLevel': {
    configurable: false,
    get: function () {
      return this._nextLevel;
    }
  },
  'currentLimits': {
    configurable: false,
    get: function () {
      return this._currentLimits;
    }
  },
  'limits': {
    configurable: false,
    get: function () {
      return this._limits;
    }
  },
  'canTrade': {
    configurable: false,
    get: function () {
      return this._canTrade;
    }
  },
  'canTradeAfter': {
    configurable: false,
    get: function () {
      return this._canTradeAfter;
    }
  },
  'cannotTradeReason': {
    configurable: false,
    get: function () {
      return this._cannotTradeReason;
    }
  }
});

CoinifyProfile.prototype.fetch = function () {
  var parentThis = this;

  var processProfile = (res) => {
    parentThis._full_name = res.profile.name;
    parentThis._gender = res.profile.gender;

    parentThis._email = res.email;

    if (res.profile.mobile.countryCode) {
      parentThis._mobile = '+' + res.profile.mobile.countryCode + res.profile.mobile.number.replace('-', '');
    }

    parentThis._default_currency = res.defaultCurrency;

    // TODO: use new Address(res.profile.address);
    parentThis._street = res.profile.address.street;
    parentThis._city = res.profile.address.city;
    parentThis._state = res.profile.address.state;
    parentThis._zipcode = res.profile.address.zipcode;
    parentThis._country = res.profile.address.country;

    parentThis._level = new Level(res.level);
    parentThis._limits = parentThis.limits || {};
    parentThis._currentLimits = res.currentLimits;

    parentThis._canTrade = res.canTrade == null ? true : Boolean(res.canTrade);
    parentThis._canTradeAfter = new Date(res.canTradeAfter);
    parentThis._cannotTradeReason = res.cannotTradeReason;

    parentThis._did_fetch = true;

    return parentThis;
  };

  var getLimits = function () {
    return parentThis._api.hasAccount
           ? parentThis._api.authGET('trades/payment-methods')
           : parentThis._api.GET('trades/payment-methods');
  };

  var setLimits = function (methods) {
    parentThis._limits = new Limits(methods);
  };

  if (this._api.hasAccount) {
    return this._api.authGET('traders/me')
      .then(processProfile)
      .then(getLimits)
      .then(setLimits);
  } else {
    return getLimits().then(setLimits);
  }
};

CoinifyProfile.prototype.setFullName = function (value) {
  var parentThis = this;

  return this.update({profile: {name: value}}).then(function (res) {
    parentThis._full_name = res.profile.name;
  });
};

CoinifyProfile.prototype.setGender = function (value) {
  assert(value === null || value === 'male' || value === 'female', 'invalid gender');
  var parentThis = this;

  return this.update({profile: {gender: value}}).then(function (res) {
    parentThis._gender = res.profile.gender;
  });
};

CoinifyProfile.prototype.setCity = function (value) {
  var parentThis = this;

  return this.update({profile: {address: {city: value}}}).then(function (res) {
    parentThis._city = res.profile.address.city;
  });
};

CoinifyProfile.prototype.setCountry = function (value) {
  var parentThis = this;

  return this.update({profile: {address: {country: value}}}).then(function (res) {
    parentThis._country = res.profile.address.country;
  });
};

CoinifyProfile.prototype.setState = function (value) {
  var parentThis = this;

  return this.update({profile: {address: {state: value}}}).then(function (res) {
    parentThis._state = res.profile.address.state;
  });
};

CoinifyProfile.prototype.setStreet = function (value) {
  var parentThis = this;

  return this.update({profile: {address: {street: value}}}).then(function (res) {
    parentThis._street = res.profile.address.street;
  });
};

CoinifyProfile.prototype.setZipcode = function (value) {
  var parentThis = this;
  return this.update({profile: {address: {zipcode: value}}}).then(function (res) {
    parentThis._zipcode = res.profile.address.zipcode;
  });
};

CoinifyProfile.prototype.update = function (values) {
  return this._api.authPATCH('traders/me', values);
};
