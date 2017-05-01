var ExchangePaymentAccount = require('bitcoin-exchange-client').PaymentAccount;
var Trade = require('./trade');
var assert = require('assert');

class PaymentAccount extends ExchangePaymentAccount {
  constructor (api, medium, quote, account) {
    super(api, medium, quote, Trade);
    this._fiatMedium = medium;
    this._account = account;
  }

  buy () {
    return super.buy().then((trade) => {
      trade._getQuote = this._quote.constructor.getQuote; // Prevents circular dependency
      return trade;
    });
  }

  sell (bankId) {
    return super.sell(bankId).then(trade => {
      console.log('*** SELL TRADE CREATED ***', trade);
      return trade;
    });
  }

  add (obj) {
    assert(obj, 'bank obj is required');

    const b = {
      account: {
        currency: obj.account.currency,
        bic: obj.account.bic,
        number: obj.account.number
      },
      holder: {
        name: obj.holder.name,
        address: {
          street: obj.holder.address.street,
          city: obj.holder.address.city,
          zipcode: obj.holder.address.zipcode,
          country: obj.holder.address.country
        }
      },
      bank: {
        address: {
          country: obj.bank.address.country,
          street: obj.bank.address.street || null,
          zipcode: obj.bank.address._ipcode || null,
          city: obj.bank.address.city || null
        }
      }
    };
    return this._api.authPOST('bank-accounts', b).then(res => {
      return new PaymentAccount(this._api, undefined, undefined, res);
    });
  }

  getAll (quote) {
    return this._api.authGET('bank-accounts').then((accounts) => {
      let accountsObj = [];
      for (let account of accounts) {
        accountsObj.push(new PaymentAccount(this._api, undefined, quote, account));
      }
      return accountsObj;
    });
  }

  delete (id) {
    assert(id, 'bank id is required');
    return this._api.DELETE(`bank-accounts/${id}`).then(res => console.log('delete should return undefined:', res));
  }
}

module.exports = PaymentAccount;
