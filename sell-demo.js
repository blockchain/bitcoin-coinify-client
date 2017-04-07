var Coinify = require('./src/coinify');
var fetch = require('isomorphic-fetch');
var BankAccount = require('./src/bank-account');
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

// var accounts = coinify.bank.getAll().then((result) => console.log('ACCOUNTS', result))

// var singleAccount = coinify.bank.getOne(10250).then((res) => console.log('res', res))

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

// ----- GET SELL QUOTE ----- //

coinify.getSellQuote(100000, 'EUR', 'BTC')
  .then(quote => {
    console.log(`${quote.quoteAmount / -100000000} ${quote.quoteCurrency} expires ${quote.expiresAt}`);

    quote.getSellPaymentMediums().then(paymentMediums => {
      // console.log('paymentMediums', paymentMediums);
      // console.log(paymentMediums.bank._quote._id)
      // next step should be
      // bank account choice.sell
      paymentMediums.bank.sell();
    });
  });

// ----- BANK ACCOUNT STUFF ----- //
// /*
var bank = {
  account: {
    currency: 'USD',
    bic: '12345',
    number: '6789'
  },
  holder: {
    name: 'phil',
    address: {
      street: '1 blockchain ave',
      city: 'bitville',
      zipcode: '12345',
      country: 'FR'
    }
  },
  bank: {
    name: 'bank of blockchain',
    address: {
      country: 'FR'
    }
  }
};

// var createBank = coinify.bank.create(bank).then((res) => console.log(res))

// ----- CREATE SELL TRADE ----- //

// console.log(`**BANK** Account: ${bank.currency}, holder: ${bank.holderName}, bankName: ${bank.bankName}`)

// console.log('coinify offline token', coinify._offlineToken)

/*
prompt.get(['currency'], function (err, res) {
  console.log('res', res)
  var sellQuote = coinify.getSellQuote(-25000000, 'BTC', res.currency)
  // var createBank = coinify.bank.create(bank)
  var getOneBank = coinify.bank.getOne(10250)
  Promise.all([res, sellQuote, getOneBank])
    .then(values => {
      console.log('user input', values[0])
      console.log('sell quote', values[1], values[1].id, values[1].quoteCurrency, values[1].quoteAmount, values[1].baseCurrency, values[1].baseAmount)
      console.log('bank account', values[2].id, values[2].account.currency)
      const data = {
        currency: values[0].currency,
        quote: values[1],
        bank: values[2],
        traderId: values[2].trader_id
      }
      return data;
    })
    .then(d => {
      // console.log('dataForSell', d)
      return coinify.sell(d.quote, d.bank, d.currency, d.quote.quoteAmount)
    })
    .then(result => {
      console.log('RESULT FROM SELL', result)
    })
    .catch(err => {
      console.log(':-O there was an error', err)
    })
})
*/
