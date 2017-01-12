var assert = require('assert');
var Exchange = require('bitcoin-exchange-client');

class API extends Exchange.API {
  constructor (rootUrl) {
    super({accessTokenBased: true});
    this._offlineToken = null;
    this._rootURL = rootUrl;
    this._loginExpiresAt = null;
  }

  get offlineToken () { return this._offlineToken; }
  get hasAccount () { return Boolean(this.offlineToken); }

  login () {
    var self = this;

    var promise = new Promise(function (resolve, reject) {
      assert(self._offlineToken, 'Offline token required');

      var loginSuccess = function (res) {
        self._accessToken = res.access_token;
        self._loginExpiresAt = new Date(new Date().getTime() + res.expires_in * 1000);
        resolve();
      };

      var loginFailed = function (e) {
        reject(e);
      };
      self.POST('auth', {
        grant_type: 'offline_token',
        offline_token: self._offlineToken
      }).then(loginSuccess).catch(loginFailed);
    });

    return promise;
  }

  _request (method, endpoint, data, authorized) {
    var url = this._rootURL + endpoint;

    var headers = {};

    if (authorized) {
      headers['Authorization'] = 'Bearer ' + this._accessToken;
    }

    return super._request(method, url, data, headers, authorized);
  }
}

module.exports = API;
