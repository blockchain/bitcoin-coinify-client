let proxyquire = require('proxyquireify')(require);

let stubs = {
};

const API = proxyquire('../src/api', stubs);

describe('Coinify API', function () {
  let api;

  beforeEach(() => JasminePromiseMatchers.install());

  afterEach(() => JasminePromiseMatchers.uninstall());

  describe('class', () =>
    describe('new API()', () =>
      it('should have a null _offlineToken', function () {
        api = new API();
        expect(api._offlineToken).toEqual(null);
      })
    )
  );

  describe('instance', function () {
    beforeEach(function () {
      api = new API();
      api._offlineToken = 'offline-token';
    });

    describe('Getter', function () {
      describe('hasAccount', () =>
        it('should use offline_token to see if user has account', function () {
          api._offlineToken = undefined;
          expect(api.hasAccount).toEqual(false);

          api._offlineToken = 'token';
          expect(api.hasAccount).toEqual(true);
        })
      );

      describe('isLoggedIn', function () {
        beforeEach(function () {
          api._access_token = 'access_token';
          api._loginExpiresAt = new Date(new Date().getTime() + 100000);
        });

        it('checks if there is an access token', function () {
          expect(api.isLoggedIn).toEqual(true);

          api._access_token = undefined;
          expect(api.isLoggedIn).toEqual(false);
        });

        it("checks if the token hasn't expired", function () {
          expect(api.isLoggedIn).toEqual(true);

          api._loginExpiresAt = new Date(new Date().getTime() - 100000);
          expect(api.isLoggedIn).toEqual(false);
        });

        it('should be a few seconds on the safe side', function () {
          expect(api.isLoggedIn).toEqual(true);

          api._loginExpiresAt = new Date(new Date().getTime());
          expect(api.isLoggedIn).toEqual(false);
        });
      });
    });

    describe('_url', () => {
      it('should use app-api.coinify.com by default', () => {
        expect(api._url()).toEqual('https://app-api.coinify.com/');
      });

      it('should use sandbox when sandbox is set', () => {
        api._sandbox = true;
        expect(api._url()).toEqual('https://app-api.sandbox.coinify.com/');
      });

      it('should include the endpoint', () => {
        expect(api._url('endpoint')).toEqual('https://app-api.coinify.com/endpoint');
      });
    });

    describe('login', function () {
      beforeEach(function () {
        api._user = 'user-1';
        api._offlineToken = 'offline-token';

        return spyOn(api, 'POST').and.callFake(function (endpoint, data) {
          if (endpoint === 'auth') {
            if (data.offline_token === 'invalid-offline-token') {
              return Promise.reject({'error': 'offline_token_not_found'});
            } else if (data.offline_token === 'random-fail-offline-token') {
              return Promise.reject();
            } else {
              return Promise.resolve({access_token: 'access-token', token_type: 'bearer'});
            }
          } else {
            return Promise.reject('Unknown endpoint');
          }
        });
      });

      it('requires an offline token', function () {
        api._offlineToken = undefined;
        let promise = api.login();
        expect(promise).toBeRejectedWith('NO_OFFLINE_TOKEN');
      });

      it('should POST the offline token to /auth', function () {
        api.login();
        expect(api.POST).toHaveBeenCalled();
        expect(api.POST.calls.argsFor(0)[1].offline_token).toEqual('offline-token');
      });

      it('should store the access token', function (done) {
        let checks = () => expect(api._access_token).toEqual('access-token');

        let promise = api.login().then(checks);
        expect(promise).toBeResolved(done);
      });

      it('should handle token not found error', function (done) {
        api._offlineToken = 'invalid-offline-token';
        let promise = api.login();
        expect(promise).toBeRejectedWith(jasmine.objectContaining({error: 'offline_token_not_found'}), done);
      });

      it('should handle generic failure', function (done) {
        api._offlineToken = 'random-fail-offline-token';
        let promise = api.login();
        expect(promise).toBeRejected(done);
      });
    });

    describe('REST', function () {
      beforeEach(() => spyOn(api, '_request'));

      describe('GET', () =>
        it('should make a GET request', function () {
          api.GET('/trades');
          expect(api._request).toHaveBeenCalled();
          expect(api._request.calls.argsFor(0)[0]).toEqual('GET');
        })
      );

      describe('POST', () =>
        it('should make a POST request', function () {
          api.POST('/trades');
          expect(api._request).toHaveBeenCalled();
          expect(api._request.calls.argsFor(0)[0]).toEqual('POST');
        })
      );

      describe('PATCH', () =>
        it('should make a PATCH request', function () {
          api.PATCH('/trades');
          expect(api._request).toHaveBeenCalled();
          expect(api._request.calls.argsFor(0)[0]).toEqual('PATCH');
        })
      );

      describe('authenticated', function () {
        beforeEach(function () {
          api._access_token = 'session-token';
          api._loginExpiresAt = new Date(new Date().getTime() + 15000);
          return spyOn(api, 'login').and.callFake(function () {
            api._access_token = 'session-token';
            api._loginExpiresAt = new Date(new Date().getTime() + 15000);
            return Promise.resolve();
          });
        });

        it('should not login again if access token is valid', function () {
          api.authGET('/trades');
          api.authPOST('/trades');
          api.authPATCH('/trades');
          expect(api.login).not.toHaveBeenCalled();
        });

        it('should refuse if no offline token is present for GET', function () {
          api._access_token = null;
          api._offlineToken = null;
          api.authGET('/trades');

          expect(api._request).not.toHaveBeenCalled();
        });

        it('should refuse if no offline token is present for POST', function () {
          api._access_token = null;
          api._offlineToken = null;
          api.authPOST('/trades');

          expect(api._request).not.toHaveBeenCalled();
        });

        it('should refuse if no offline token is present for PATCH', function () {
          api._access_token = null;
          api._offlineToken = null;
          api.authPATCH('/trades');

          expect(api._request).not.toHaveBeenCalled();
        });

        it('should login first before GET if access token is absent', function () {
          api._access_token = null;
          api.authGET('/trades');
          expect(api.login).toHaveBeenCalled();
        });

        it('should login first before POST if access token is absent', function () {
          api._access_token = null;
          api.authPOST('/trades');
          expect(api.login).toHaveBeenCalled();
        });

        it('should login first before PATCH if access token is absent', function () {
          api._access_token = null;
          api.authPATCH('/trades');
          expect(api.login).toHaveBeenCalled();
        });

        it('should login first if access token is expired', function () {
          api._loginExpiresAt = new Date(new Date().getTime() - 1);
          api.authGET('/trades');
          expect(api.login).toHaveBeenCalled();
        });

        describe('GET', () =>
          it('should make a GET request', function () {
            api.authGET('/trades');
            expect(api._request).toHaveBeenCalled();
            expect(api._request.calls.argsFor(0)[0]).toEqual('GET');
            expect(api._request.calls.argsFor(0)[3]).toEqual(true);
          })
        );

        describe('POST', () =>
          it('should make a POST request', function () {
            api.authPOST('/trades');
            expect(api._request).toHaveBeenCalled();
            expect(api._request.calls.argsFor(0)[0]).toEqual('POST');
            expect(api._request.calls.argsFor(0)[3]).toEqual(true);
          })
        );

        describe('PATCH', () =>
          it('should make a PATCH request', function () {
            api.authPATCH('/trades');
            expect(api._request).toHaveBeenCalled();
            expect(api._request.calls.argsFor(0)[0]).toEqual('PATCH');
            expect(api._request.calls.argsFor(0)[3]).toEqual(true);
          })
        );

        describe('DELETE', () =>
          it('should make a DELETE request', function () {
            api.DELETE('/trades');
            expect(api._request).toHaveBeenCalled();
            expect(api._request.calls.argsFor(0)[0]).toEqual('DELETE');
            expect(api._request.calls.argsFor(0)[3]).toEqual(true);
          })
        );
      });
    });
  });
});
