var PaymentAccount = require('./payment-account');
var assert = require('assert');

class BankAccount extends PaymentAccount {
  constructor (account, api, quote) {
    super(api, quote);
    this._quote = quote;
    this._id = account.id;
    this._trader_id = account.trader_id;
    this._account = {
      _bic: account.account.bic,
      _currency: account.account.currency,
      _number: account.account.number,
      _type: account.account.type
    };
    this._bank = {
      _address: {
        _country: account.bank.address.country
      }
    };
    this._holder = {
      _name: account.holder.name,
      _address: {
        _city: account.holder.address.city,
        _country: account.holder.address.country,
        _street: account.holder.address.street,
        _zipcode: account.holder.address.zipcode
      }
    };
  }

  static add (obj, api, quote) {
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
    return api.authPOST('bank-accounts', b).then(bankObj => {
      return new BankAccount(bankObj, api, quote);
    });
  }

  static getAll (api, quote) {
    return api.authGET('bank-accounts').then((accountObjs) => {
      let accounts = [];
      for (let accountObj of accountObjs) {
        accounts.push(new BankAccount(accountObj, api, quote));
      }
      return accounts;
    });
  }

  delete () {
    const ID = this._id;
    return this._api.DELETE(`bank-accounts/${ID}`).then(res => console.log('delete should return undefined:', res));
  }

  sell () {
    return super.sell().then(trade => {
      console.log('*** SELL TRADE CREATED ***', trade);
      return trade;
    });
  }

  updateQuote (quote) {
    this._quote = quote;
  }
}

module.exports = BankAccount;
