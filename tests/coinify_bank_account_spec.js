let proxyquire = require('proxyquireify')(require);

let stubs = {
};

let BankAccount = proxyquire('../src/bank-account', stubs);
let b;
let api;

beforeEach(function () {
  api = {};
  JasminePromiseMatchers.install();
});

afterEach(() => JasminePromiseMatchers.uninstall());

describe('Coinify bank account', () =>

  describe('constructor', function () {
    let quote;
    let account;

    beforeEach(() => {
      quote = {baseAmount: -1000};
      account = {
        id: 12345,
        trader_id: '123ABC',
        account: {
          bic: '112233AABBCC',
          number: '1234 ABCD 5678 EFGH',
          currency: 'EUR',
          type: 'sepa'
        },
        bank: {
          address: {
            country: 'FR'
          }
        },
        holder: {
          name: 'Phil',
          address: {
            country: 'FR',
            city: 'Paris',
            zipcode: '12345',
            street: '11 Main St'
          }
        }
      };
    });

    it('should set bank values', function () {
      b = new BankAccount(account, api, quote);
      expect(b._id).toBe(12345);
    });
  }),

  describe('add', function () {
    let obj;
    let quote;

    beforeEach(() => {
      quote = {baseAmount: -1000};
      obj = {
        id: 12345,
        trader_id: '123ABC',
        account: {
          bic: '112233AABBCC',
          number: '1234 ABCD 5678 EFGH',
          currency: 'EUR',
          type: 'sepa'
        },
        bank: {
          address: {
            country: 'FR'
          }
        },
        holder: {
          name: 'Phil',
          address: {
            country: 'FR',
            city: 'Paris',
            zipcode: '12345',
            street: '11 Main St'
          }
        }
      };
      api = {
        authPOST () { return Promise.resolve('something'); }
      };
    });

    it('should add a bank account', function () {
      spyOn(api, 'authPOST').and.callThrough();
      BankAccount.add(obj, api, quote);
      expect(api.authPOST).toHaveBeenCalled();
    });
  }),
  describe('getAll', function () {
    let api;
    let quote;

    beforeEach(() => {
      quote = {baseAmount: -1000};
      api = {
        authGET () { return Promise.resolve('something'); }
      };
    });

    it('should get bank accounts', function () {
      spyOn(api, 'authGET').and.callThrough();
      BankAccount.getAll(api, quote);
      expect(api.authGET).toHaveBeenCalledWith('bank-accounts');
    });
  }),

  describe('delete', function () {
    let api;
    let b;
    let obj;
    let quote;

    beforeEach(() => {
      quote = {baseAmount: -1000};
      obj = {
        id: 12345,
        trader_id: '123ABC',
        account: {
          bic: '112233AABBCC',
          number: '1234 ABCD 5678 EFGH',
          currency: 'EUR',
          type: 'sepa'
        },
        bank: {
          address: {
            country: 'FR'
          }
        },
        holder: {
          name: 'Phil',
          address: {
            country: 'FR',
            city: 'Paris',
            zipcode: '12345',
            street: '11 Main St'
          }
        }
      };
      api = {
        DELETE () { return Promise.resolve('something'); }
      };
      b = new BankAccount(obj, api, quote);
    });

    it('should delete the bank account', function () {
      spyOn(api, 'DELETE').and.callThrough();
      b.delete();
      expect(api.DELETE).toHaveBeenCalled();
    });
  })
);
