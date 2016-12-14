let proxyquire = require('proxyquireify')(require);

let stubs = {
};

let PaymentAccount = proxyquire('../src/payment-account', stubs);
let b;
let api;

beforeEach(function () {
  api = {};
  JasminePromiseMatchers.install();
});

afterEach(() => JasminePromiseMatchers.uninstall());

describe('Coinify Payment account', () =>

  describe('constructor', function () {
    let quote;

    beforeEach(() => {
      quote = {baseAmount: -1000};
    });

    it('should set the medium', function () {
      b = new PaymentAccount(api, 'bank', quote);
      expect(b._fiatMedium).toBe('bank');
    });
  })
);
