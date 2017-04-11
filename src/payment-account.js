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

  sell () {
    console.log('called sell', this);
    const sellData = {
      priceQuoteId: this._quote._id,
      transferIn: {
        medium: 'blockchain'
      },
      transferOut: {
        medium: 'bank',
        mediumReceiveAccountId: this._account.id
      }
    };
    console.log('sell payload', sellData);
    return this._api.authPOST('trades', sellData);
  }

  static add (api, obj) {
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
        // name: obj.bank.name || null,
        address: {
          country: obj.bank.address.country,
          street: obj.bank.address.street || null,
          zipcode: obj.bank.address._ipcode || null,
          city: obj.bank.address.city || null
        }
      }
    };
    return api.authPOST('bank-accounts', b).then(res => {
      return new PaymentAccount(api, undefined, undefined, res);
    });
  }

  static getAll (api, quote) {
    return api.authGET('bank-accounts').then((accounts) => {
      let accountsObj = [];
      for (let account of accounts) {
        accountsObj.push(new PaymentAccount(api, undefined, quote, account));
      }
      return accountsObj;
    });
  }

  deleteOne (api) {
    const id = this._account.id;
    return this._api.DELETE(`bank-accounts/${id}`).then(res => console.log('delete should return undefined:', res));
  }
}

module.exports = PaymentAccount;
