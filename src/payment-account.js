var ExchangePaymentAccount = require('bitcoin-exchange-client').PaymentAccount;
var Trade = require('./trade');

class PaymentAccount extends ExchangePaymentAccount {
  constructor (api, medium, quote) {
    super(api, medium, quote, Trade);
    this._fiatMedium = medium;
  }

  buy () {
    return super.buy().then((trade) => {
      trade._getQuote = this._quote.constructor.getQuote; // Prevents circular dependency
      return trade;
    });
  }

  static add (api, obj) {
    // assert(obj.account.currency, 'Currency required');
    // assert(obj.holder.name, 'Bank account holder name required');
    // assert(obj.holder.address.country, 'Bank country required');
    // assert(obj.account.number, 'IBAN required');

    const b = {
      account: {
        currency: obj.currency,
        bic: obj.bic,
        number: obj.number
      },
      holder: {
        name: obj._holder_name,
        address: {
          street: obj._holder_address._street,
          city: obj._holder_address._city,
          zipcode: obj._holder_address._zipcode,
          country: obj._holder_address._country
        }
      },
      bank: {
        // name: obj.bank.name || null,
        address: {
          country: obj._bank_address._country,
          street: obj._bank_address._street || null,
          zipcode: obj._bank_address._zipcode || null,
          city: obj._bank_address._city || null
        }
      }
    };
    return api.authPOST('bank-accounts', b).then((res) => {
      return new PaymentAccount(res, api);
    });;
  }

  static getAll (api, quote) {
    return api.authGET('bank-accounts').then((accounts) => {
      let accountsObj = [];
      for (let account of accounts) {
        accountsObj.push(new PaymentAccount(account, api, quote));
      }
      return accountsObj;
    });
  }

  static deleteOne (api, id) {
    assert(id, 'bankAccount ID required');
    return api.DELETE(`bank-accounts/${id}`);
  };
}

}

module.exports = PaymentAccount;
