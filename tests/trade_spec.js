let proxyquire = require('proxyquireify')(require);

let CoinifyBank = () => ({mock: 'coinify-bank'});

let stubs = {
  './coinify-bank': CoinifyBank
};

let Trade = proxyquire('../src/trade', stubs);

describe('Coinify Trade', function () {
  let tradeJSON;
  let tradeJSON2;

  let api;

  let delegate;

  beforeEach(function () {
    jasmine.clock().uninstall();
    jasmine.clock().install();

    tradeJSON = {
      id: 1142,
      inCurrency: 'USD',
      outCurrency: 'BTC',
      inAmount: 40,
      transferIn: {
        medium: 'card',
        details: {
          paymentId: '05e18928-7b29-4b70-b29e-84cfe9fbc5ac'
        }
      },
      transferOut: {
        details: {
          account: '19g1YFsoR5duHgTFcs4HKnjKHH7PgNqBJM'
        }
      },
      outAmountExpected: 0.06454481,
      state: 'awaiting_transfer_in',
      receiptUrl: 'my url',
      createTime: '2016-08-26T14:53:26.650Z',
      updateTime: '2016-08-26T14:54:00.000Z',
      quoteExpireTime: '2016-08-26T15:10:00.000Z'
    };

    tradeJSON2 = JSON.parse(JSON.stringify(tradeJSON));
    tradeJSON2.id = 1143;
  });

  afterEach(() => jasmine.clock().uninstall());

  describe('class', () =>
    describe('new Trade()', function () {
      beforeEach(function () {
        delegate = {
          getReceiveAddress () {},
          deserializeExtraFields () {}
        };
        api = {};
      });

      it('should warn if there is an unknown state type', function () {
        tradeJSON.state = 'unknown';
        spyOn(window.console, 'warn');
        // eslint-disable-next-line no-new
        new Trade(tradeJSON, api, delegate);
        expect(window.console.warn).toHaveBeenCalled();
        expect(window.console.warn.calls.argsFor(0)[1]).toEqual('unknown');
      });
    })
  );

  describe('instance', function () {
    let profile;
    let trade;
    delegate = undefined;

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

      delegate = {
        reserveReceiveAddress () {
          return { receiveAddress: '1abcd', commit () {} };
        },
        removeLabeledAddress () {},
        releaseReceiveAddress () {},
        save () { return Promise.resolve(); },
        deserializeExtraFields () {},
        getReceiveAddress () {},
        serializeExtraFields () {},
        monitorAddress () {}
      };

      api = {
        authGET (method) {
          return Promise.resolve({
            id: 1,
            defaultCurrency: 'EUR',
            email: 'john@do.com',
            profile,
            feePercentage: 3,
            currentLimits: {
              card: {
                in: {
                  daily: 100
                }
              },
              bank: {
                in: {
                  daily: 0,
                  yearly: 0
                },
                out: {
                  daily: 100,
                  yearly: 1000
                }
              }
            },

            requirements: [],
            level: {name: '1'},
            nextLevel: {name: '2'},
            state: 'awaiting_transfer_in'
          });
        },
        authPOST () { return Promise.resolve('something'); }
      };
      spyOn(api, 'authGET').and.callThrough();
      spyOn(api, 'authPOST').and.callThrough();
      trade = new Trade(tradeJSON, api, delegate);
      trade._getQuote = (api, amount, currency) => Promise.resolve({quoteAmount: 0.071});
    });

    describe('getters', function () {
      it('should have some simple ones restored from trades JSON', function () {
        trade = new Trade({
          id: 1142,
          state: 'awaiting_transfer_in',
          tx_hash: null,
          confirmed: false,
          is_buy: true
        }, api, delegate);

        expect(trade.id).toEqual(1142);
        expect(trade.state).toEqual('awaiting_transfer_in');
        expect(trade.confirmed).toEqual(false);
        expect(trade.isBuy).toEqual(true);
        expect(trade.txHash).toEqual(null);
      });

      it('should have more simple ones loaded from API', function () {
        trade = new Trade(null, api, delegate);
        trade.setFromAPI(tradeJSON);
        expect(trade.id).toEqual(1142);
        expect(trade.iSignThisID).toEqual('05e18928-7b29-4b70-b29e-84cfe9fbc5ac');
        expect(trade.quoteExpireTime).toEqual(new Date('2016-08-26T15:10:00.000Z').getTime());
        expect(trade.createdAt).toEqual(new Date('2016-08-26T14:53:26.650Z').getTime());
        expect(trade.updatedAt).toEqual(new Date('2016-08-26T14:54:00.000Z').getTime());
        expect(trade.inCurrency).toEqual('USD');
        expect(trade.outCurrency).toEqual('BTC');
        expect(trade.inAmount).toEqual(4000);
        expect(trade.medium).toEqual('card');
        expect(trade.state).toEqual('awaiting_transfer_in');
        expect(trade.sendAmount).toEqual(0);
        expect(trade.outAmount).toEqual(0);
        expect(trade.outAmountExpected).toEqual(6454481);
        expect(trade.receiptUrl).toEqual('my url');
        expect(trade.receiveAddress).toEqual('19g1YFsoR5duHgTFcs4HKnjKHH7PgNqBJM');
        expect(trade.bitcoinReceived).toEqual(false);
        expect(trade.confirmed).toEqual(false);
        expect(trade.isBuy).toEqual(true);
        expect(trade.txHash).toEqual(null);
      });

      it('should have a bank account for a bank trade', function () {
        tradeJSON.transferIn = {
          medium: 'bank',
          details: {} // Bank account details are mocked
        };
        trade = new Trade(null, api, delegate);
        trade.setFromAPI(tradeJSON);
        expect(trade.bankAccount).toEqual({mock: 'coinify-bank'});
      });
    });

    describe('deserialize from trades JSON', function () {
      beforeEach(() => {
        tradeJSON = {
          id: 1142,
          state: 'awaiting_transfer_in',
          tx_hash: 'hash',
          confirmed: false,
          is_buy: true
        };
      });

      it('should ask the delegate to deserialize extra fields', function () {
        spyOn(delegate, 'deserializeExtraFields');
        // eslint-disable-next-line no-new
        new Trade(tradeJSON, api, delegate);
        expect(delegate.deserializeExtraFields).toHaveBeenCalled();
      });

      it('should pass in self, so delegate can set extra fields', function () {
        tradeJSON.extra = 'test';
        delegate.deserializeExtraFields = (deserialized, t) => {
          t.extra = deserialized.extra;
        };

        trade = new Trade(tradeJSON, api, delegate);
        expect(trade.extra).toEqual('test');
      });
    });

    describe('serialize', function () {
      it('should store several fields', function () {
        trade._txHash = 'hash';
        expect(JSON.stringify(trade)).toEqual(JSON.stringify({
          id: 1142,
          state: 'awaiting_transfer_in',
          tx_hash: 'hash',
          confirmed: false,
          is_buy: true
        }));
      });

      it('should ask the delegate to store more fields', function () {
        spyOn(trade._delegate, 'serializeExtraFields');
        JSON.stringify(trade);
        expect(trade._delegate.serializeExtraFields).toHaveBeenCalled();
      });

      it('should serialize any fields added by the delegate', function () {
        trade._delegate.serializeExtraFields = t => { t.extra_field = 'test'; };

        let s = JSON.stringify(trade);
        expect(JSON.parse(s).extra_field).toEqual('test');
      });
    });

    describe('isBuy', function () {
      it('should equal _is_buy if set', function () {
        trade._is_buy = false;
        expect(trade.isBuy).toEqual(false);

        trade._is_buy = true;
        expect(trade.isBuy).toEqual(true);
      });

      it('should default to true for older test wallets', function () {
        trade._is_buy = undefined;
        trade._outCurrency = undefined;
        expect(trade.isBuy).toEqual(true);
      });

      it('should be true if out currency is BTC', function () {
        trade._is_buy = undefined;
        trade._outCurrency = 'BTC';
        expect(trade.isBuy).toEqual(true);

        trade._outCurrency = 'EUR';
        expect(trade.isBuy).toEqual(false);
      });
    });

    describe('setFromAPI(obj)', function () {
      it('should not change id', function () {
        let oldId = tradeJSON.id;
        tradeJSON.id = 100;
        tradeJSON.inCurrency = 'monopoly';
        trade._id = oldId;
        trade.setFromAPI(tradeJSON);
        expect(trade._id).toBe(oldId);
        expect(trade._inCurrency).toBe(tradeJSON.inCurrency);
      });

      it('should round correctly for buy', function () {
        tradeJSON.inAmount = 35.05;
        tradeJSON.transferIn.sendAmount = 35.05;
        tradeJSON.outAmount = 0.00003505;
        tradeJSON.outAmountExpected = 0.00003505;

        trade.setFromAPI(tradeJSON);
        expect(trade.inAmount).toEqual(3505);
        expect(trade.sendAmount).toEqual(3505);
        expect(trade.outAmount).toEqual(3505);
        expect(trade.outAmountExpected).toEqual(3505);
      });

      it('should round correctly for sell', function () {
        tradeJSON.inCurrency = 'BTC';
        tradeJSON.outCurrency = 'EUR';
        tradeJSON.inAmount = 0.00003505;
        tradeJSON.transferIn.sendAmount = 0.00003505;
        tradeJSON.outAmount = 35.05;
        tradeJSON.outAmountExpected = 35.05;

        trade.setFromAPI(tradeJSON);
        expect(trade.inAmount).toEqual(3505);
        expect(trade.sendAmount).toEqual(3505);
        expect(trade.outAmount).toEqual(3505);
        expect(trade.outAmountExpected).toEqual(3505);
      });

      it("state should stay 'rejected' after card decline", function () {
        trade._isDeclined = true;
        trade.setFromAPI(tradeJSON); // {state: 'awaiting_transfer_in'}
        expect(trade.state).toEqual('rejected');
      });
    });

    describe('from API', () => {
      beforeEach(function () {
        trade.setFromAPI(tradeJSON);
      });

      describe('declined()', function () {
        beforeEach(() => trade.setFromAPI(tradeJSON));

        it('should change state to rejected and set _isDeclined', function () {
          trade.declined();
          expect(trade.state).toEqual('rejected');
          expect(trade._isDeclined).toEqual(true);
        });
      });

      describe('cancel()', function () {
        beforeEach(function () {
          api.authPATCH = () => {
            return ({
              then (cb) {
                return cb({state: 'cancelled'});
              }
            });
          };

          return spyOn(api, 'authPATCH').and.callThrough();
        });

        it('should cancel a trade and update its state', function () {
          trade.cancel();
          expect(api.authPATCH).toHaveBeenCalledWith(`trades/${trade._id}/cancel`);
          expect(trade._state).toBe('cancelled');
        });

        it('should notifiy the delegate the receive address is no longer needed', function () {
          spyOn(delegate, 'releaseReceiveAddress');
          trade.cancel();
          expect(delegate.releaseReceiveAddress).toHaveBeenCalled();
        });
      });

      describe('fakeBankTransfer()', () =>
        it('should POST a fake bank-transfer', function () {
          trade.fakeBankTransfer();
          expect(api.authPOST).toHaveBeenCalledWith('trades/1142/test/bank-transfer', {
            sendAmount: 40,
            currency: 'USD'
          });
        })
      );

      describe('buy()', function () {
        let quote;

        beforeEach(function () {
          spyOn(Trade.prototype, '_monitorAddress').and.callFake(function () {});
          api.authPOST = () => Promise.resolve(tradeJSON);

          quote = {
            id: 101,
            expiresAt: new Date(new Date().getTime() + 100000),
            api,
            delegate,
            debug: true,
            _TradeClass: Trade
          };
        });

        it('should check that quote  is still valid', function () {
          quote.expiresAt = new Date(new Date().getTime() - 100000);
          expect(() => { Trade.buy(quote, 'card'); }).toThrow();
        });

        it('should POST the quote and resolve the trade', function (done) {
          spyOn(api, 'authPOST').and.callThrough();
          let testTrade = function (t) {
            expect(api.authPOST).toHaveBeenCalled();
            expect(t.id).toEqual(1142);
          };

          let promise = Trade.buy(quote, 'bank')
            .then(testTrade);

          expect(promise).toBeResolved(done);
        });

        it('should watch the address', function (done) {
          let checks = trade => expect(trade._monitorAddress).toHaveBeenCalled();

          let promise = Trade.buy(quote, 'bank')
            .then(checks);

          expect(promise).toBeResolved(done);
        });
      });

      describe('fetchAll()', function () {
        beforeEach(() => spyOn(delegate, 'releaseReceiveAddress').and.callThrough());

        it('should fetch all the trades', function (done) {
          api.authGET = () => Promise.resolve([tradeJSON, tradeJSON2]);

          let check = function (res) {
            expect(res.length).toBe(2);
            return done();
          };

          let promise = Trade.fetchAll(api).then(check);
          expect(promise).toBeResolved();
        });
      });

      describe('btcExpected', function () {
        beforeEach(function () {
          let now = new Date(2016, 9, 25, 12, 10, 0); // 12:10:00
          jasmine.clock().mockDate(now);
          trade._quoteExpireTime = new Date(2016, 9, 25, 12, 15, 0);
        }); // 12:15:00

        it("should use the quote if that's still valid", function () {
          let promise = trade.btcExpected();
          expect(promise).toBeResolvedWith(0.06454481);
        });

        describe('when quote expired', function () {
          beforeEach(function () {
            trade._lastBtcExpectedGuessAt = new Date(2016, 9, 25, 12, 15, 15); // 12:15:15
            trade._lastBtcExpectedGuess = 0.07;
          });

          it('should use the last value if quote expired less than a minute ago', function () {
            jasmine.clock().mockDate(new Date(2016, 9, 25, 12, 15, 45)); // 12:15:45

            let promise = trade.btcExpected();
            expect(promise).toBeResolvedWith(0.07);
          });

          it('should get and store quote', function (done) {
            let now = new Date(2016, 9, 25, 12, 16, 15);
            jasmine.clock().mockDate(now); // 12:16:15
            spyOn(trade, '_getQuote').and.callThrough();

            let checks = function () {
              expect(trade._lastBtcExpectedGuessAt).toEqual(now);
              expect(trade._lastBtcExpectedGuess).toEqual(0.071);
              return done();
            };

            let promise = trade.btcExpected().then(checks);
            expect(promise).toBeResolvedWith(0.071);
          });
        });
      });

      describe('expireQuote', () =>
        it('should expire the quote sooner', function () {
          let now = new Date(2016, 9, 25, 11, 50, 0);
          let threeSeconds = new Date(2016, 9, 25, 11, 50, 3);
          trade._quoteExpireTime = new Date(2016, 9, 25, 12, 0);
          jasmine.clock().mockDate(now);
          trade.expireQuote();
          expect(trade.quoteExpireTime).toEqual(threeSeconds);
        })
      );

      describe('refresh()', function () {
        beforeEach(function () {
          api.authGET = () => Promise.resolve({});
          spyOn(api, 'authGET').and.callThrough();
          spyOn(trade, 'setFromAPI').and.callFake(() => {});
        });

        it('should authGET /trades/:id and update the trade object', function (done) {
          let checks = function () {
            expect(api.authGET).toHaveBeenCalledWith(`trades/${trade.id}`);
            expect(trade.setFromAPI).toHaveBeenCalled();
          };

          let promise = trade.refresh().then(checks).catch(fail).then(done);

          expect(promise).toBeResolved();
        });

        it('should save metadata', function (done) {
          let checks = () => expect(trade._delegate.save).toHaveBeenCalled();

          trade.setFromAPI = () => Promise.resolve(trade);
          spyOn(trade._delegate, 'save').and.callThrough();
          let promise = trade.refresh().then(checks);

          expect(promise).toBeResolved(done);
        });

        it('should resolve with trade object', function (done) {
          let checks = res => expect(res).toEqual(trade);

          trade.setFromAPI = () => Promise.resolve(trade);
          let promise = trade.refresh().then(checks);

          expect(promise).toBeResolved(done);
        });
      });
    });
  });
});
