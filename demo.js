var Coinify = require('./src/coinify');
var prompt = require('prompt');

var fetch = require('isomorphic-fetch');

console.log('Bitcoin Coinify Client Demo');

var coinify;

var delegate = {
  save: () => {
    return Promise.resolve();
  },
  email: () => email,
  isEmailVerified: () => true,
  getToken: () => {
    console.log('Obtaining signed email token from Blockchain.info');
    let url = `https://blockchain.info/wallet/signed-token?fields=email|wallet_age&guid=${walletIdentifier}&sharedKey=${sharedKey}`;

    const processResponse = (response) => response.json();

    return fetch(url)
      .then(processResponse)
      .then((result) => result.token)
      .catch((e) => {
        console.error(e);
      });
  },
  monitorAddress: (address, callback) => {},
  checkAddress: (address) => {},
  getReceiveAddress: (trade) => {
    return receiveAddress;
  },
  reserveReceiveAddress: () => {
    return {
      receiveAddress: receiveAddress,
      commit: () => {}
    };
  },
  releaseReceiveAddress: () => {},
  serializeExtraFields: (obj, trade) => {},
  deserializeExtraFields: (obj, trade) => {}
};

if (process.env.OFFLINE_TOKEN) {
  var receiveAddress;

  coinify = new Coinify({
    user: 'some_user_id',
    offline_token: process.env.OFFLINE_TOKEN,
    auto_login: true,
    trades: []
  }, delegate);

  delegate.trades = coinify.trades;

  coinify.debug = true;

  console.log('Fetching previous trades');
  coinify.getTrades().then((trades) => {
    if (trades.length > 0) {
      for (let trade of trades) {
        console.log(`Trade ${trade.id} for ${trade.inAmount} on ${trade.createdAt}`);
      }
    } else {
      console.log('No trades found');
    }

    console.log('Get quote for €10.00 worth of Bitcoin');
    coinify.getBuyQuote(10 * 100, 'EUR', 'BTC').then((quote) => {
      console.log(`${quote.quoteAmount / 100000000} ${quote.quoteCurrency} expires ${quote.expiresAt}`);

      quote.getPaymentMediums().then((paymentMediums) => {
        console.log(`Bank fee: €${(paymentMediums.bank.fee / 100).toFixed(2)}`);
        console.log(`Card fee: €${(paymentMediums.card.fee / 100).toFixed(2)}`);
        prompt.get(['card_or_bank', 'receive_address'], (err, result) => {
          if (err) {
            // Ignore
          }
          receiveAddress = result.receive_address;

          if (result.card_or_bank === 'card') {
            console.log('Creditcard trade');
            paymentMediums.card.buy().then((trade) => {
              console.log(`Created trade ${trade.id}`);
              console.log('Complete in your browser:', `https://verify.isignthis.com/landing/${trade.iSignThisID}`);
            });
          } else if (result.card_or_bank === 'bank') {
            console.log('Bank trade demo not implemented yet');
            // TODO: check level, handle KYC first if needed
          }
        });
      });
    });
  });
} else {
  coinify = Coinify.new(delegate);
  coinify.partnerId = 19;
  coinify.debug = true;
  delegate.trades = coinify.trades;

  var walletIdentifier;
  var sharedKey;
  var email;

  console.log('Please create a Blockchain wallet with a unique email and verify your email');
  console.log('Get the wallet identifier: Blockchain.MyWallet.wallet.guid');
  console.log('Get the shared key: Blockchain.MyWallet.wallet.sharedKey');

  prompt.get(['email', 'walletIdentifier', 'sharedKey'], function (err, result) {
    if (err) {
      // Ignore
    }
    email = result.email;
    walletIdentifier = result.walletIdentifier;
    sharedKey = result.sharedKey;

    coinify.signup('NL', 'EUR').then(() => {
      console.log('To continue the demo with this Coinify account:');
      console.log(`OFFLINE_TOKEN=${coinify._offlineToken} node demo.js`);
    });
  });
}
