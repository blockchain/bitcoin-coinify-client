let proxyquire = require('proxyquireify')(require);

let stubs = {
};

let ExchangeRate = proxyquire('../src/exchange-rate', stubs);

describe('Coinify: Exchange Rate', function () {
  beforeEach(() => JasminePromiseMatchers.install());

  afterEach(() => JasminePromiseMatchers.uninstall());

  describe('constructor', () =>
    it('coinify reference must be preserved', function () {
      let fakeCoinify = {};
      let e = new ExchangeRate(fakeCoinify);
      expect(e._coinify).toBe(fakeCoinify);
    })
  );

  describe('get', () =>
    it('must obtain the right rate', function (done) {
      let coinify = {
        GET (method, object) {
          return {
            then (cb) {
              return cb({ rate: 1000 });
            }
          };
        }
      };

      let baseC = 'litecoin';
      let quoteC = 'dogecoin';
      let e = new ExchangeRate(coinify);
      let promise = e.get(baseC, quoteC);
      expect(promise).toBeResolvedWith(1000, done);
    })
  );

  describe('get', () =>
    it('coinify.GET must be called', function (done) {
      let coinify = {
        GET (method, object) {
          return {
            then (cb) {
              return cb({ rate: 1000 });
            }
          };
        }
      };
      spyOn(coinify, 'GET').and.callThrough();
      let baseC = 'litecoin';
      let quoteC = 'dogecoin';
      let e = new ExchangeRate(coinify);
      let promise = e.get(baseC, quoteC);
      let argument = {
        baseCurrency: baseC,
        quoteCurrency: quoteC
      };
      let testCalls = () => expect(coinify.GET).toHaveBeenCalledWith('rates/approximate', argument);
      return promise
        .then(testCalls)
        .then(done);
    })
  );
});
