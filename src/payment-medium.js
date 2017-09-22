var ExchangePaymentMedium = require('bitcoin-exchange-client').PaymentMedium;
var PaymentAccount = require('./payment-account');
var Trade = require('./trade');
var BankAccount = require('./bank-account');

class PaymentMedium extends ExchangePaymentMedium {
  constructor (obj, api, quote) {
    super(api, quote, Trade);

    this._TradeClass = Trade;

    this._inMedium = obj.inMedium;
    this._outMedium = obj.outMedium;
    this._minimumInAmounts = obj.minimumInAmounts;
    this._limitInAmounts = obj.limitInAmounts;

    /* istanbul ignore else */
    if (this._inMedium === 'card' || this._outMedium === 'card') {
      this._fiatMedium = 'card';
    } else if (this._inMedium === 'bank' || this._outMedium === 'bank') {
      this._fiatMedium = 'bank';
    } else {
      console.warn('Unknown fiat medium', this._inMedium, this._outMedium);
    }

    this._name = obj.name;

    this._inCurrencies = obj.inCurrencies;
    this._outCurrencies = obj.outCurrencies;

    this._inCurrency = obj.inCurrency;
    this._outCurrency = obj.outCurrency;

    if (this._inCurrency === 'BTC') {
      this._inFixedFee = Math.round(obj.inFixedFee * 100000000);
      this._outFixedFee = Math.round(obj.outFixedFee * 100);
    } else {
      this._inFixedFee = Math.round(obj.inFixedFee * 100);
      this._outFixedFee = Math.round(obj.outFixedFee * 100000000);
    }
    this._inPercentageFee = obj.inPercentageFee;
    this._outPercentageFee = obj.outPercentageFee;

    this._bankId = obj.bankId;
    this._bankAccount = obj.bankAccount;

    if (quote) {
      let amt = quote.baseCurrency === 'BTC' ? quote.quoteAmount : quote.baseAmount;
      let percentageFee = amt < 0 ? this.inPercentageFee : -this.outPercentageFee;
      this._fee = Math.round(this.inFixedFee + -amt * (percentageFee / 100));
      this._total = -amt + this._fee;
    }
  }

  get name () { return this._name; }
  get limitInAmounts () { return this._limitInAmounts; }
  get minimumInAmounts () { return this._minimumInAmounts; }

  getAccounts () {
    return Promise.resolve([new PaymentAccount(this._api, this.fiatMedium, this._quote)]);
  }

  // There are no PaymentAccounts when buying, so just call it directly:
  buy () {
    let account = new PaymentAccount(this._api, this.fiatMedium, this._quote);
    return account.buy();
  }

  static getAll (inCurrency, outCurrency, api, quote) {
    var params = {};
    if (inCurrency) {
      /* including inCurrency restricts the response to only include limits in that one currency */
      // params.inCurrency = inCurrency;
    }
    if (outCurrency) {
      params.outCurrency = outCurrency;
    }

    var output = [];
    var request = api.hasAccount ? api.authGET('trades/payment-methods', params) : api.GET('trades/payment-methods', params);
    return request.then(function (res) {
      output = {};
      for (var i = 0; i < res.length; i++) {
        let medium = new PaymentMedium(res[i], api, quote);
        if (inCurrency !== 'BTC') { // Buy
          output[medium.inMedium] = medium;
        } else { // Sell
          output[medium.outMedium] = medium;
        }
      }
      return Promise.resolve(output);
    });
  }

  getBankAccounts () {
    if (this._fiatMedium === 'card') return;
    return BankAccount.getAll(this._api, this._quote).then(accounts => {
      this._accounts = accounts;
      return accounts;
    });
  }

  addBankAccount (obj) {
    return BankAccount.add(obj, this._api, this._quote).then(res => {
      this._accounts.push(res);
      return res;
    });
  }
}

module.exports = PaymentMedium;
