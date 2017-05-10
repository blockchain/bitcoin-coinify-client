let proxyquire = require('proxyquireify')(require);

const API = () =>
  ({
    GET () {},
    POST () {},
    PATCH () {}
  })
;

let Trade = obj => obj;

Trade.monitorPayments = function () {};
Trade.filteredTrades = trades => [];

let CoinifyProfile = () =>
  ({
    fetch () {
      this._did_fetch = true;
    }
  })
;

let kycsJSON = [
  {
    id: 1,
    state: 'pending'
  }
];
let CoinifyKYC = obj => obj;
CoinifyKYC.fetchAll = () =>
  Promise.resolve([
    {
      id: kycsJSON[0].id,
      state: kycsJSON[0].state
    }
  ])
;
CoinifyKYC.trigger = () => Promise.resolve();

let delegate = {
  save () { return Promise.resolve(); },
  getToken: () => {}
};

let ExchangeDelegate = () => delegate;

let stubs = {
  './api': API,
  './trade': Trade,
  './kyc': CoinifyKYC,
  './profile': CoinifyProfile,
  './exchange-delegate': ExchangeDelegate
};

let Coinify = proxyquire('../src/coinify', stubs);

describe('Coinify', function () {
  let c;

  beforeEach(() => {
    JasminePromiseMatchers.install();
  });

  afterEach(() => JasminePromiseMatchers.uninstall());

  describe('class', function () {
    describe('new Coinify()', function () {
      it('should transform an Object to a Coinify', function () {
        c = new Coinify({auto_login: true}, delegate);
        expect(c.constructor.name).toEqual('Coinify');
      });

      it('should use fields', function () {
        c = new Coinify({auto_login: true}, delegate);
        expect(c._auto_login).toEqual(true);
      });

      it('should require a delegate', () => {
        // eslint-disable-next-line no-new
        expect(() => { new Coinify({auto_login: true}); }).toThrow();
      });

      it('should deserialize trades', function () {
        c = new Coinify({
          auto_login: true,
          trades: [{}]
        }, delegate);
        expect(c.trades.length).toEqual(1);
      });
    });

    describe('Coinify.new()', function () {
      it('sets autoLogin to true', function () {
        c = Coinify.new(delegate);
        expect(c._auto_login).toEqual(true);
      });

      it('should require a delegate', () => expect(() => { Coinify.new(); }).toThrow());
    });
  });

  describe('instance', function () {
    beforeEach(function () {
      c = Coinify.new({
        email () { return 'info@blockchain.com'; },
        isEmailVerified () { return true; },
        getToken () { return 'json-web-token'; },
        save () { return Promise.resolve(); }
      });
      c.partnerId = 18;
      c._debug = false;

      return spyOn(c._api, 'POST').and.callFake(function (endpoint, data) {
        if (endpoint === 'signup/trader') {
          if (data.email === 'duplicate@blockchain.com') {
            return Promise.reject('DUPLICATE_EMAIL');
          } else if (data.email === 'fail@blockchain.com') {
            return Promise.reject('ERROR_MESSAGE');
          } else {
            return Promise.resolve({
              trader: {id: '1'},
              offlineToken: 'offline-token'
            });
          }
        } else {
          return Promise.reject('Unknown endpoint');
        }
      });
    });

    describe('Getter', () =>
      describe('hasAccount', () =>
        it('should use offline_token to see if user has account', function () {
          c._offlineToken = undefined;
          expect(c.hasAccount).toEqual(false);

          c._offlineToken = 'token';
          expect(c.hasAccount).toEqual(true);
        })
      )
    );

    describe('JSON serializer', function () {
      let obj = {
        user: 1,
        offline_token: 'token',
        auto_login: true
      };

      let p = new Coinify(obj, delegate);

      it('should serialize the right fields', function () {
        let json = JSON.stringify(p, null, 2);
        let d = JSON.parse(json);
        expect(d.user).toEqual(1);
        expect(d.offline_token).toEqual('token');
        expect(d.auto_login).toEqual(true);
      });

      it('should serialize trades', function () {
        p._trades = [];
        let json = JSON.stringify(p, null, 2);
        let d = JSON.parse(json);
        expect(d.trades).toEqual([]);
      });

      it('should hold: fromJSON . toJSON = id', function () {
        let json = JSON.stringify(c, null, 2);
        let b = new Coinify(JSON.parse(json), delegate);
        expect(json).toEqual(JSON.stringify(b, null, 2));
      });

      it('should not serialize non-expected fields', function () {
        let expectedJSON = JSON.stringify(c, null, 2);
        c.rarefield = 'I am an intruder';
        let json = JSON.stringify(c, null, 2);
        expect(json).toEqual(expectedJSON);
      });
    });

    describe('signup', function () {
      it('sets a user and offline token', function (done) {
        let checks = function () {
          expect(c.user).toEqual('1');
          expect(c._offlineToken).toEqual('offline-token');
        };

        let promise = c.signup('NL', 'EUR').then(checks);

        expect(promise).toBeResolved(done);
      });

      it('requires the country', function () {
        expect(c.signup('NL', 'EUR')).toBeResolved();
        expect(c.signup(undefined, 'EUR')).toBeRejected();
      });

      it('requires the currency', function () {
        expect(c.signup('NL', 'EUR')).toBeResolved();
        expect(c.signup('NL')).toBeRejected();
      });

      it('requires email', function () {
        c.delegate.email = () => null;
        expect(c.signup('NL', 'EUR')).toBeRejected();
      });

      it('requires verified email', function () {
        c.delegate.isEmailVerified = () => false;
        expect(c.signup('NL', 'EUR')).toBeRejected();
      });

      it('lets the user know if email is already registered', function (done) {
        c.delegate.email = () => 'duplicate@blockchain.com';
        let promise = c.signup('NL', 'EUR');
        expect(promise).toBeRejectedWith('DUPLICATE_EMAIL', done);
      });

      it('might fail for an unexpected reason', function (done) {
        c.delegate.email = () => 'fail@blockchain.com';
        let promise = c.signup('NL', 'EUR');
        expect(promise).toBeRejectedWith('ERROR_MESSAGE', done);
      });
    });

    describe('getBuyCurrencies()', function () {
      beforeEach(() =>
        spyOn(c, 'getBuyMethods').and.callFake(() =>
          Promise.resolve([
            {
              inCurrencies: ['EUR', 'USD']
            },
            {
              inCurrencies: ['EUR']
            }
          ])
        )
      );

      it('should return a list of currencies', function (done) {
        let checks = res => expect(res).toEqual(['EUR', 'USD']);

        let promise = c.getBuyCurrencies().then(checks);

        expect(promise).toBeResolved(done);
      });

      it('should store the list', function (done) {
        let checks = function (res) {
          expect(c.buyCurrencies).toEqual(['EUR', 'USD']);
          return done();
        };

        c.getBuyCurrencies().then(checks);
      });
    });

    describe('getSellCurrencies()', function () {
      beforeEach(() =>
        spyOn(c, 'getSellMethods').and.callFake(() =>
          Promise.resolve([
            {
              outCurrencies: ['EUR', 'USD']
            },
            {
              outCurrencies: ['EUR']
            }
          ])
        )
      );

      it('should return a list of currencies', function (done) {
        let checks = res => expect(res).toEqual(['EUR', 'USD']);

        let promise = c.getSellCurrencies().then(checks);

        expect(promise).toBeResolved(done);
      });

      it('should store the list', function (done) {
        let checks = function (res) {
          expect(c.sellCurrencies).toEqual(['EUR', 'USD']);
          return done();
        };

        c.getSellCurrencies().then(checks);
      });
    });

    describe('fetchProfile()', function () {
      it('should call fetch() on profile', function () {
        spyOn(c._profile, 'fetch');
        c.fetchProfile();
        expect(c._profile.fetch).toHaveBeenCalled();
      });

      it('profile should be null before', () => expect(c.profile).toBeNull());

      it('should set .profile', function () {
        c.fetchProfile();
        expect(c.profile).not.toBeNull();
      });
    });

    describe('getKYCs()', function () {
      it('should call CoinifyKYC.fetchAll', function () {
        spyOn(CoinifyKYC, 'fetchAll').and.callThrough();
        c.getKYCs();
        expect(CoinifyKYC.fetchAll).toHaveBeenCalled();
      });

      it('should store the kycs', function (done) {
        let checks = res => expect(c.kycs.length).toEqual(1);

        let promise = c.getKYCs().then(checks).catch(fail).then(done);
        expect(promise).toBeResolved(done);
      });

      it('should resolve the kycs', function (done) {
        let checks = function (res) {
          expect(res.length).toEqual(1);
          return done();
        };

        c.getKYCs().then(checks);
      });

      it('should update existing kycs', function (done) {
        c._kycs = [
          {
            _id: 1,
            process () {},
            state: 'pending',
            set (obj) {
              this.state = obj.state;
            }
          },
          {
            _id: 2,
            process () {},
            state: 'pending',
            set (obj) {
              this.state = obj.state;
            }
          }
        ];

        kycsJSON[0].state = 'completed_test';

        let checks = function () {
          expect(c.kycs.length).toBe(2);
          expect(c.kycs[0].state).toEqual('completed_test');
          return done();
        };

        return c.getKYCs().then(checks);
      });
    });

    describe('triggerKYC()', () =>
      it('should call CoinifyKYC.trigger', function () {
        spyOn(CoinifyKYC, 'trigger').and.callThrough();
        c.triggerKYC();
        expect(CoinifyKYC.trigger).toHaveBeenCalled();
      })
    );
  });
});
