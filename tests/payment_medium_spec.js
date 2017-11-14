let proxyquire = require('proxyquireify')(require);

let PaymentAccount = (api, medium, quote) =>
  ({
    mock: 'payment-account',
    fiatMedium: medium,
    quote
  })
;

let BankAccount = (obj, api, quote) =>
  ({
    mock: 'bank-account',
    add: () => Promise.resolve('something'),
    getAll: () => Promise.resolve('something')
  })
;

let stubs = {
  './payment-account': PaymentAccount,
  './bank-account': BankAccount
};

let PaymentMethod = proxyquire('../src/payment-medium', stubs);
let o;
let coinify;
let b;
let s;
let api;
let quote;

beforeEach(function () {
  api = {};
  o = {
    inMedium: 'bank',
    outMedium: 'blockchain',
    name: 'name',
    inCurrencies: 'inCurrencies',
    outCurrencies: 'outCurrencies',
    inCurrency: 'EUR',
    outCurrency: 'BTC',
    inFixedFees: { 'EUR': 1 },
    outFixedFees: { 'BTC': 0.01 },
    inPercentageFee: 3,
    outPercentageFee: 0,
    minimumInAmounts: {}
  };
  let sell = {
    inMedium: 'blockchain',
    outMedium: 'bank',
    name: 'name',
    inCurrencies: 'inCurrencies',
    outCurrencies: 'outCurrencies',
    inCurrency: 'EUR',
    outCurrency: 'BTC',
    inFixedFees: { 'BTC': 0 },
    outFixedFees: { 'EUR': 0 },
    inPercentageFee: 3,
    outPercentageFee: 0
  };
  let sellQuote = {baseAmount: 0.5, baseCurrency: 'BTC', quoteAmount: 25000};

  s = new PaymentMethod(sell, api, sellQuote);
  return JasminePromiseMatchers.install();
});

afterEach(() => JasminePromiseMatchers.uninstall());

describe('Coinify Payment medium', function () {
  describe('constructor', function () {
    quote = undefined;

    beforeEach(() => {
      quote = {baseAmount: -1000, baseCurrency: 'EUR', quoteAmount: 2};
    });

    it('must put everything on place', function () {
      b = new PaymentMethod(o, api);
      expect(b._inMedium).toBe(o.inMedium);
      expect(b._outMedium).toBe(o.outMedium);
      expect(b._name).toBe(o.name);
      expect(b._inCurrencies).toBe(o.inCurrencies);
      expect(b._outCurrencies).toBe(o.outCurrencies);
      expect(b._inCurrency).toBe(o.inCurrency);
      expect(b._outCurrency).toBe(o.outCurrency);
      expect(b._inFixedFees).toBe(o.inFixedFees);
      expect(b._outFixedFees).toBe(o.outFixedFees);
      expect(b._inPercentageFee).toBe(o.inPercentageFee);
      expect(b._outPercentageFee).toBe(o.outPercentageFee);
      expect(b._minimumInAmounts).toBe(o.minimumInAmounts);
    });

    it('should have getters', function () {
      b = new PaymentMethod(o, api);
      expect(b.name).toEqual(o.name);
    });

    it('should set fee, given a fiat quote', function () {
      b = new PaymentMethod(o, api, quote);
      expect(b.fee).toEqual(30 + 1);
    });

    it('should set total, given a BTC quote', function () {
      quote = {baseAmount: -10000000, baseCurrency: 'BTC', quoteAmount: -200};
      b = new PaymentMethod(o, api, quote);
      expect(b.total).toEqual(200 + 6 + 1);
    });

    it('should set total, given a quote', function () {
      b = new PaymentMethod(o, api, quote);
      expect(b.total).toEqual(1000 + 30 + 1);
    });

    it('must correctly round the fixed fee for fiat to BTC', function () {
      b = new PaymentMethod(o, api);
      expect(b._inFixedFees['EUR']).toEqual(1);
      expect(b._outFixedFees['BTC']).toEqual(.01);
    });

    it('must correctly round the fixed fee for BTC to fiat', function () {
      o.inCurrency = 'BTC';
      o.outCurrency = 'EUR';
      o.inFixedFees = { 'BTC': 35.05 };
      o.outFixedFees = { 'EUR': 35.05 };
      b = new PaymentMethod(o, api);
      expect(b._inFixedFees[o.inCurrency]).toEqual(35.05);
      expect(b._outFixedFees[o.outCurrency]).toEqual(35.05);
    });

    it('should set the fiat medium', function () {
      o.inMedium = 'blockchain';
      o.outMedium = 'bank';
      b = new PaymentMethod(o, api);
      expect(b.fiatMedium).toEqual('bank');

      o.inMedium = 'card';
      o.outMedium = 'blockchain';
      b = new PaymentMethod(o, api);
      expect(b.fiatMedium).toEqual('card');
    });
  });

  describe('getAll()', function () {
    beforeEach(() => {
      coinify = {
        GET (method, params) {
          if (params.inCurrency === 'EUR') {
            return Promise.resolve([o, o, o, o]);
          } else {
            return Promise.resolve([s]);
          }
        }
      };
    });

    it('should GET trades/payment-methods with the correct arguments', function (done) {
      spyOn(coinify, 'GET').and.callThrough();

      let promise = PaymentMethod.getAll('EUR', 'BTC', coinify);
      let argument = {
        inCurrency: 'EUR',
        outCurrency: 'BTC'
      };
      let testCalls = () => expect(coinify.GET).toHaveBeenCalledWith('trades/payment-methods', argument);
      return promise
        .then(testCalls)
        .then(done);
    });

    it('should return {bank: ..., card: ...} for buy', function (done) {
      let promise = PaymentMethod.getAll('EUR', 'BTC', coinify);

      let testCalls = res => expect(res.bank).toBeDefined();

      return promise
        .then(testCalls)
        .then(done);
    });

    it('should return {bank: ...} for sell', function (done) {
      let promise = PaymentMethod.getAll('BTC', 'EUR', coinify);

      let testCalls = res => expect(res.bank).toBeDefined();

      return promise
        .then(testCalls)
        .then(done);
    });
  });
});
