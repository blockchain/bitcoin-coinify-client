
let proxyquire = require('proxyquireify')(require);

let Limits = () => ({limits: 'limits_mock'});

let stubs = {
  './limits': Limits
};

let Level = proxyquire('../src/level', stubs);

describe('CoinifyLevel', function () {
  let obj;
  let level;

  beforeEach(() => {
    obj = {
      currency: 'EUR',
      feePercentage: 3,
      limits: {},
      requirements: {},
      name: '1'
    };
  });

  describe('class', () =>
    describe('constructor', function () {
      it('should set properties', function () {
        level = new Level(obj);
        expect(level._name).toEqual('1');
        expect(level._requirements).toEqual({});
        expect(level._feePercentage).toEqual(3);
        expect(level._currency).toEqual('EUR');
      });

      it('should create a Limits object', function () {
        level = new Level(obj);
        expect(level._limits).toEqual({limits: 'limits_mock'});
      });
    })
  );

  describe('instance', function () {
    beforeEach(() => {
      level = new Level(obj);
    });

    it('should have getters', function () {
      expect(level.currency).toEqual('EUR');
      expect(level.name).toEqual('1');
      expect(level.requirements).toEqual({});
      expect(level.limits).toEqual({limits: 'limits_mock'});
      expect(level.feePercentage).toEqual(3);
    });
  });
});
