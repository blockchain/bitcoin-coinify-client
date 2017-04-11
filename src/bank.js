'use strict';

var assert = require('assert');

module.exports = BankAction;

function BankAction (api, delegate, obj) {
  this._api = api;
  this._delegate = delegate;
}

BankAction.prototype.create = function (obj) {
  console.log('bankAction.create', obj);
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
  return this._api.authPOST('bank-accounts', b);
};
//
// Bank.prototype.getAll = function () {
//   return this._api.authGET('bank-accounts');
// };
//
// Bank.prototype.getOne = function (id) {
//   return this._api.authGET(`bank-accounts/${id}`);
// };
//
// Bank.prototype.deleteOne = function (id) {
//   assert(id, 'bankAccount ID required');
//   return this._api.DELETE(`bank-accounts/${id}`);
// };
