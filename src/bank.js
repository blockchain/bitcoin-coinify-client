'use strict';

var assert = require('assert');

module.exports = Bank;

function Bank (api, delegate) {
  this._api = api;
  this._delegate = delegate;
}

Bank.prototype.create = function (bankObj) {
  assert(bankObj.account.currency, 'Currency required');
  assert(bankObj.holder.name, 'Bank account holder name required');
  assert(bankObj.holder.address.country, 'Bank country required');
  assert(bankObj.account.number, 'IBAN required');

  const b = {
    account: {
      currency: bankObj.account.currency,
      bic: bankObj.account.bic,
      number: bankObj.account.number
    },
    holder: {
      name: bankObj.holder.name,
      address: {
        street: bankObj.holder.address.street,
        city: bankObj.holder.address.city,
        zipcode: bankObj.holder.address.zipcode,
        country: bankObj.holder.address.country,
        state: bankObj.holder.address.state || null
      }
    },
    bank: {
      name: bankObj.bank.name || null,
      address: {
        country: bankObj.bank.address.country,
        street: bankObj.bank.address.street || null,
        zipcode: bankObj.bank.address.zipcode || null,
        city: bankObj.bank.address.city || null
      }
    }
  };
  return this._api.authPOST('bank-accounts', b);
};

Bank.prototype.getAll = function () {
  return this._api.authGET('bank-accounts');
};

Bank.prototype.getOne = function (id) {
  return this._api.authGET(`bank-accounts/${id}`);
};

Bank.prototype.deleteOne = function (id) {
  assert(id, 'bankAccount ID required');
  return this._api.DELETE(`bank-accounts/${id}`);
};
