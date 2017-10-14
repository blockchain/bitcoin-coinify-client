
let proxyquire = require('proxyquireify')(require);

let stubs = {
};

let Limits = proxyquire('../src/limits', stubs);

// Tests both limits.js and limit.js
describe('CoinifyLimits', function () {
  let limits;

  beforeEach(function () {
    let methods = [
      {
        'inMedium': 'card',
        'limitInAmounts': {'GBP': 100, 'EUR': 100, 'USD': 100, 'DKK': 100}
      },
      {
        'inMedium': 'bank',
        'limitInAmounts': {'GBP': 1000, 'EUR': 1000, 'USD': 1000, 'DKK': 1000}
      },
      {
        'inMedium': 'blockchain',
        'limitInAmounts': {'BTC': 1}
      }
    ]

    limits = new Limits(methods);
  });

  describe('class', () =>
    describe('new Limits()', function () {
      it('should process remaining amounts', function () {
        expect(limits.card.inRemaining['USD']).toBe(100);
        expect(limits.bank.inRemaining['USD']).toBe(1000);
        expect(limits.blockchain.inRemaining['BTC']).toBe(1);
      });
    })
  );
});
