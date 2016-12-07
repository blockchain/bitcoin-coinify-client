# Bitcoin Coinify Javascript Client [![Build Status](https://travis-ci.org/blockchain/bitcoin-coinify-client.png?branch=master)](https://travis-ci.org/blockchain/bitcoin-coinify-client) [![Coverage Status](https://coveralls.io/repos/blockchain/bitcoin-coinify-client/badge.svg?branch=master&service=github)](https://coveralls.io/github/blockchain/bitcoin-coinify-client?branch=master)

This is used by [My-Wallet-V3](https://github.com/blockchain/My-Wallet-V3/).

## Install

`npm install bitcoin-coinify-client --save`

## Usage

Three things are needed:

1. `delegate` object with functions that provide the following:
 * save() -> e.g. `function () { return JSON.stringify(this._coinify);` }
 * `email()` -> String : the users email address
 * `isEmailVerified()` -> Boolean : whether the users email is verified
 * `getEmailToken()` -> stringify : JSON web token {email: 'me@example.com'}
 * `monitorAddress(address, callback)` : `callback(amount)` if btc received
 * `checkAddress(address)` : look for existing transaction at address
 * `getReceiveAddress(trade)` : return the trades receive address
 * `reserveReceiveAddress()`
 * `commitReceiveAddress()`
 * `releaseReceiveAddress()`
 * `serializeExtraFields(obj, trade)` : e.g. `obj.account_index = ...`
 * `deserializeExtraFields(obj, trade)`

2. Coinify partner identifier

```js
var object = {user: 1, offline_token: 'token'};
var coinify = new Coinify(object, delegate);
coinify.partnerId = ...;
coinify.delegate.save.bind(coinify.delegate)();
// "{"user":1,"offline_token":"token"}"
```

## Release

Change version in `package.json`.

```sh
git commit -a -m "v0.1.0"
git push
git tag -s v0.1.0
git push --tags
```
