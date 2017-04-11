var Coinify = require('./src/coinify');
var fetch = require('isomorphic-fetch');
var BankAccount = require('./src/bank-account');
var Bank = require('./src/bank');
var API = require('./src/api');
var prompt = require('prompt');

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

coinify = new Coinify({
  user: 'some_user_id',
  offline_token: 'ID554MPxw0372FYQOKIwuhhiO0TMArwq1RQo2/joP2IgCTJU3Le7TUWxki6A9BLJ',
  auto_login: true,
  trades: []
}, delegate);

var b = new BankAccount({
  account: {
    currency: 'EUR',
    number: 12345,
    bic: 123
  },
  bank: {
    name: null,
    address: {
      country: 'GB'
    }
  },
  holder: {
    name: 'pw',
    address: {
      country: 'GB',
      street: '123 dereham',
      zip: '12345',
      city: 'london'
    }
  }
});

// var accounts = coinify.bank.getAll().then((result) => console.log('ACCOUNTS', result));

// ----- GET TRADES ----- //
// /*
// var trades = coinify.getTrades().then((trades) => {
//   if (trades.length > 0) {
//     for (let trade of trades) {
//       console.log(`**TRADE** id: ${trade.id}, outCurrency: ${trade.outCurrency}, inCurrency: ${trade.inCurrency}, createdAt: ${trade.createdAt}**`)
//     }
//   }
// });
// */

// ----- GET PROFILE ----- //
// var profile = coinify.fetchProfile().then((profile) => console.log(`**PROFILE** Email: ${profile.email}, level: ${profile.level.name}, bank inRemaining: ${profile.currentLimits.bank.inRemaining}`))

// ----- GET SELL CURRENCIES ----- //

// var currencies = coinify.getSellCurrencies().then((curr) => console.log(`**CURRENCIES** ${curr}`))



// coinify.getSellQuote(100000, 'EUR', 'BTC')
//   .then(quote => {
//     console.log(`${quote.quoteAmount / -100000000} ${quote.quoteCurrency} for ${quote.baseAmount / 100} ${quote.baseCurrency} expires ${quote.expiresAt}`);
//
//     quote.getSellPaymentMediums().then(accounts => {
//       if (accounts === []) {
//         // create bank account
//         var userBank = new BankAccount()
//       }
//     })
//   })




coinify.getSellQuote(100000, 'EUR', 'BTC')
  .then(quote => {
    console.log(`${quote.quoteAmount / -100000000} ${quote.quoteCurrency} for ${quote.baseAmount / 100} ${quote.baseCurrency} expires ${quote.expiresAt}`);

    quote.getSellPaymentMediums().then(paymentMediums => {
      // console.log('paymentMediums', paymentMediums);

      paymentMediums[0].bank.sell().then(sellResult => {
        console.log('result of sell', sellResult);
      });
    });
  });

// var createBank = coinify.bank.create(bank).then((res) => console.log(res))
