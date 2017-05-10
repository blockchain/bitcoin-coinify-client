let proxyquire = require('proxyquireify')(require);

let Level = obj =>
  ({
    name: obj.name
  })
;

let Limits = obj =>
  ({
    card: {
      in: obj.card.in
    }
  })
;

let stubs = {
  './level': Level,
  './limits': Limits
};

let CoinifyProfile = proxyquire('../src/profile', stubs);

describe('CoinifyProfile', function () {
  beforeEach(() => JasminePromiseMatchers.install());
  afterEach(() => JasminePromiseMatchers.uninstall());

  describe('class', () =>
    describe('new CoinifyProfile()', () =>

      it('should keep a reference to API object', function () {
        let api = {};
        let p = new CoinifyProfile(api);
        expect(p._api).toBe(api);
      })
    )
  );

  describe('instance', function () {
    let p;
    let coinify;
    let profile;

    beforeEach(function () {
      profile = {
        name: 'John Do',
        gender: 'male',
        mobile: {
          countryCode: '1',
          number: '1234'
        },
        address: {
          street: 'Hoofdstraat 1',
          city: 'Amsterdam',
          zipcode: '1111 AA',
          state: 'NH',
          country: 'NL'
        }
      };
      coinify = {
        authGET (method) {
          return {
            then (cb) {
              cb({
                id: 1,
                defaultCurrency: 'EUR',
                email: 'john@do.com',
                profile,
                feePercentage: 3,
                canTrade: true,
                canTradeAfter: false,
                cannotTradeReason: 'awaiting_trade_completion',
                currentLimits: {
                  card: {
                    in: 100
                  },
                  bank: {
                    in: 0
                  }
                },

                requirements: [],
                level: {name: '1'}
              });
              return {
                catch () {}
              };
            }
          };
        },
        authPATCH () {}
      };
      spyOn(coinify, 'authGET').and.callThrough();
      spyOn(coinify, 'authPATCH').and.callThrough();
      p = new CoinifyProfile(coinify);
    });

    describe('fetch()', function () {
      it('calls /traders/me', function () {
        p.fetch();
        expect(coinify.authGET).toHaveBeenCalledWith('traders/me');
      });

      it('populates the profile', function () {
        p.fetch();
        expect(p.fullName).toEqual('John Do');
        expect(p.defaultCurrency).toEqual('EUR');
        expect(p.email).toEqual('john@do.com');
        expect(p.gender).toEqual('male');
        expect(p.mobile).toEqual('+11234');
        expect(p.city).toEqual('Amsterdam');
        expect(p.country).toEqual('NL');
        expect(p.state).toEqual('NH');
        expect(p.street).toEqual('Hoofdstraat 1');
        expect(p.zipcode).toEqual('1111 AA');
        expect(p.level.name).toEqual('1');
        expect(p.currentLimits.card.in).toEqual(100);
        expect(p.canTrade).toEqual(true);
        expect(p.canTradeAfter).toEqual(new Date(12/31/1969));
        expect(p.cannotTradeReason).toEqual('awaiting_trade_completion');
      });
    });

    describe('update()', () =>
      it('should update', function () {
        p.update({profile: {name: 'Jane Do'}});
        expect(coinify.authPATCH).toHaveBeenCalledWith('traders/me', {profile: { name: 'Jane Do' }});
      })
    );

    describe('Setter', function () {
      beforeEach(() =>
        spyOn(p, 'update').and.callFake(values =>
          ({
            then (cb) {
              if (values.profile) {
                profile.name = values.profile.name || profile.name;
                if (values.profile.gender !== undefined) { // can be null
                  profile.gender = values.profile.gender;
                }
                if (values.profile.address) {
                  profile.address.city = values.profile.address.city || profile.city;
                  profile.address.country = values.profile.address.country || profile.country;
                  profile.address.state = values.profile.address.state || profile.state;
                  profile.address.street = values.profile.address.street || profile.street;
                  profile.address.zipcode = values.profile.address.zipcode || profile.zipcode;
                }
              }

              cb({profile});
              return {
                catch () {}
              };
            }
          })
        )
      );

      describe('setFullName', () =>
        it('should update', function () {
          p.setFullName('Jane Do');
          expect(p.update).toHaveBeenCalledWith({profile: { name: 'Jane Do' }});
          expect(p.fullName).toEqual('Jane Do');
        })
      );

      describe('setGender', function () {
        it('should update', function () {
          p.setGender('female');
          expect(p.update).toHaveBeenCalledWith({profile: { gender: 'female' }});
          expect(p.gender).toEqual('female');

          p.setGender('male');
          expect(p.gender).toEqual('male');
        });

        it('can be unset', function () {
          p.setGender(null);
          expect(p.gender).toEqual(null);
        });

        it('should only accept male, female or null', function () {
          try {
            p.setGender('wrong');
          } catch (e) {
            expect(e.toString()).toEqual('AssertionError: invalid gender');
          }

          expect(p.update).not.toHaveBeenCalled();
        });
      });

      describe('setCity', () =>
        it('should update', function () {
          p.setCity('London');
          expect(p.update).toHaveBeenCalledWith({profile: {address: {city: 'London'}}});
          expect(p.city).toEqual('London');
        })
      );

      describe('setCountry', () =>
        it('should update', function () {
          p.setCountry('GB');
          expect(p.update).toHaveBeenCalledWith({profile: {address: {country: 'GB'}}});
          expect(p.country).toEqual('GB');
        })
      );

      describe('setState', () =>
        it('should update', function () {
          p.setState('LND');
          expect(p.update).toHaveBeenCalledWith({profile: {address: {state: 'LND'}}});
          expect(p.state).toEqual('LND');
        })
      );

      describe('setStreet', () =>
        it('should update', function () {
          p.setStreet('Main St 1');
          expect(p.update).toHaveBeenCalledWith({profile: { address: {street: 'Main St 1'} }});
          expect(p.street).toEqual('Main St 1');
        })
      );

      describe('setZipcode', () =>
        it('should update', function () {
          p.setZipcode('1234');
          expect(p.update).toHaveBeenCalledWith({profile: { address: {zipcode: '1234'} }});
          expect(p.zipcode).toEqual('1234');
        })
      );
    });
  });
});
