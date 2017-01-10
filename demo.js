var Coinify = require('./src/coinify');
var prompt = require('prompt');

var fetch = require('isomorphic-fetch');

console.log('Bitcoin Coinify Client Demo');

var coinify;



var delegate = {
  save: () => {
    console.log('Save called:', JSON.stringify(coinify));
    return Promise.resolve();
  },
  email: () => email,
  isEmailVerified: () => true,
  getEmailToken: () => {
    console.log('Obtaining signed email token from Blockchain.info');
    let url = `https://blockchain.info/wallet/signed-token?fields=email|wallet_age&guid=${ wallet_identifier }&sharedKey=${ shared_key }`

    const processResponse = (response) => response.json()

    return fetch(url)
      .then(processResponse)
      .then((result) => result.token)
      .catch((e) => {
        console.error(e);
      });
  }

  // * `monitorAddress(address, callback)` : `callback(amount)` if btc received
  // * `checkAddress(address)` : look for existing transaction at address
  // * `getReceiveAddress(trade)` : return the trades receive address
  // * `reserveReceiveAddress()`
  // * `commitReceiveAddress()`
  // * `releaseReceiveAddress()`
  // * `serializeExtraFields(obj, trade)` : e.g. `obj.account_index = ...`
  // * `deserializeExtraFields(obj, trade)`
}

var coinify = Coinify.new(delegate);
coinify.partnerId = 19;

if (process.env.OFFLINE_TOKEN) {

} else {
  var wallet_identifier;
  var shared_key;
  var email;

  console.log('Please create a Blockchain wallet with a unique email and verify your email');
  console.log('Get the wallet identifier: Blockchain.MyWallet.wallet.guid')
  console.log('Get the shared key: Blockchain.MyWallet.wallet.sharedKey')

  prompt.get(['email', 'wallet_identifier', 'shared_key'], function (err, result) {
    email = result.email;
    wallet_identifier = result.wallet_identifier;
    shared_key = result.shared_key;

    coinify.signup('NL', 'EUR').then(() => {
      console.log('To continue the demo with this Coinify account:');
      console.log(`OFFLINE_TOKEN=${ coinify._offlineToken } node demo.js`);
    });
  })
}







// delegate.save()
