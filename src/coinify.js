var Exchange = require('bitcoin-exchange-client');
var CoinifyProfile = require('./profile');
var Trade = require('./trade');
var CoinifyKYC = require('./kyc');
var PaymentMedium = require('./payment-medium');
var ExchangeRate = require('./exchange-rate');
var Quote = require('./quote');
var API = require('./api');
var KYC = require('./kyc');
var Helpers = require('bitcoin-exchange-client').Helpers;

var assert = require('assert');

class Coinify extends Exchange.Exchange {
  constructor (obj, delegate) {
    const api = new API('https://app-api.coinify.com/');
    super(obj, delegate, api, Trade, Quote, PaymentMedium);

    assert(delegate.getToken, 'delegate.getToken() required');
    this._partner_id = null;
    this._user = obj.user;
    this._auto_login = obj.auto_login;
    this._offlineToken = obj.offline_token;

    this._api = api;
    this._api._offlineToken = this._offlineToken;

    this._profile = new CoinifyProfile(this._api);

    this._buyCurrencies = null;
    this._sellCurrencies = null;

    this._kycs = [];

    this.exchangeRate = new ExchangeRate(this._api);
  }

  get profile () {
    if (!this._profile._did_fetch) {
      return null;
    } else {
      return this._profile;
    }
  }

  getTrades () {
    return super.getTrades(Quote);
  }

  get kycs () { return this._kycs; }

  get hasAccount () { return Boolean(this._offlineToken); }

  get partnerId () { return this._partner_id; }
  set partnerId (value) {
    this._partner_id = value;
  }

  get buyCurrencies () { return this._buyCurrencies; }

  get sellCurrencies () { return this._sellCurrencies; }

  get bank () { return this._bank; }

  toJSON () {
    var coinify = {
      user: this._user,
      offline_token: this._offlineToken,
      auto_login: this._auto_login,
      trades: Trade.filteredTrades(this._trades)
    };

    return coinify;
  }

  // Country and default currency must be set
  // Email must be set and verified
  signup (countryCode, currencyCode) {
    var self = this;
    var runChecks = function () {
      assert(!self.user, 'Already signed up');

      assert(self.delegate, 'ExchangeDelegate required');

      assert(
        countryCode &&
        Exchange.Helpers.isString(countryCode) &&
        countryCode.length === 2 &&
        countryCode.match(/[a-zA-Z]{2}/),
        'ISO 3166-1 alpha-2'
      );

      assert(currencyCode, 'currency required');

      assert(self.delegate.email(), 'email required');
      assert(self.delegate.isEmailVerified(), 'email must be verified');
    };

    var doSignup = function (emailToken) {
      assert(emailToken, 'email token missing');
      return this._api.POST('signup/trader', {
        email: self.delegate.email(),
        partnerId: self.partnerId,
        defaultCurrency: currencyCode, // ISO 4217
        profile: {
          address: {
            country: countryCode.toUpperCase()
          }
        },
        trustedEmailValidationToken: emailToken,
        generateOfflineToken: true
      });
    };

    var saveMetadata = function (res) {
      this._user = res.trader.id;
      this._offlineToken = res.offlineToken;
      this._api._offlineToken = this._offlineToken;
      return this._delegate.save.bind(this._delegate)().then(function () { return res; });
    };

    var getToken = function () {
      return this.delegate.getToken.bind(this.delegate)('coinify', {walletAge: true});
    };

    return Promise.resolve().then(runChecks.bind(this))
                            .then(getToken.bind(this))
                            .then(doSignup.bind(this))
                            .then(saveMetadata.bind(this));
  }

  fetchProfile () {
    return this._profile.fetch();
  }

  triggerKYC () {
    var addKYC = (kyc) => {
      this._kycs.push(kyc);
      return kyc;
    };

    return CoinifyKYC.trigger(this._api).then(addKYC);
  }

  updateKYCs (list, items) {
    var item;
    for (var i = 0; i < items.length; i++) {
      item = undefined;
      for (var k = 0; k < list.length; k++) {
        var itemId = Helpers.isNumber(items[i].id) ? items[i].id : items[i].id.toLowerCase();
        if (list[k]._id === itemId) {
          item = list[k];
          item.debug = this.debug;
          item.set.bind(item)(items[i]);
        }
      }
      if (item === undefined) {
        item = new KYC(items[i], this._api, this.delegate, this);
        item.debug = this.debug;
        list.push(item);
      }
    }
  }

  getKYCs () {
    var save = () => this.delegate.save.bind(this.delegate)().then(() => this._kycs);
    var update = (kycs) => {
      this.updateKYCs(this._kycs, kycs, CoinifyKYC);
    };
    return CoinifyKYC.fetchAll(this._api, this)
                       .then(update)
                       .then(save);
  }

  getBuyCurrencies () {
    var getCurrencies = function (paymentMethods) {
      var currencies = [];
      for (let [, paymentMethod] of Object.entries(paymentMethods)) {
        for (let inCurrency of paymentMethod.inCurrencies) {
          if (currencies.indexOf(inCurrency) === -1) {
            currencies.push(inCurrency);
          }
        }
      }
      this._buyCurrencies = JSON.parse(JSON.stringify(currencies));
      return currencies;
    };
    return this.getBuyMethods().then(getCurrencies.bind(this));
  }

  getSellCurrencies () {
    var getCurrencies = function (paymentMethods) {
      var currencies = [];
      for (let [, paymentMethod] of Object.entries(paymentMethods)) {
        for (let outCurrency of paymentMethod.outCurrencies) {
          if (currencies.indexOf(outCurrency) === -1) {
            currencies.push(outCurrency);
          }
        }
      }
      this._sellCurrencies = JSON.parse(JSON.stringify(currencies));
      return currencies;
    };
    return this.getSellMethods().then(getCurrencies.bind(this));
  }

  static new (delegate) {
    assert(delegate, 'Coinify.new requires delegate');
    var object = {
      auto_login: true
    };
    var coinify = new Coinify(object, delegate);
    return coinify;
  }
}

module.exports = Coinify;
