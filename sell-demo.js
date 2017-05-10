// var Coinify = require('./src/coinify');
// var fetch = require('isomorphic-fetch');
// var prompt = require('prompt');
//
// var delegate = {
//   save: () => {
//     return Promise.resolve();
//   },
//   email: () => email,
//   isEmailVerified: () => true,
//   getToken: () => {
//     console.log('Obtaining signed email token from Blockchain.info');
//     let url = `https://blockchain.info/wallet/signed-token?fields=email|wallet_age&guid=${walletIdentifier}&sharedKey=${sharedKey}`;
//
//     const processResponse = (response) => response.json();
//
//     return fetch(url)
//       .then(processResponse)
//       .then((result) => result.token)
//       .catch((e) => {
//         console.error(e);
//       });
//   },
//   monitorAddress: (address, callback) => {},
//   checkAddress: (address) => {},
//   getReceiveAddress: (trade) => {
//     return receiveAddress;
//   },
//   reserveReceiveAddress: () => {
//     return {
//       receiveAddress: receiveAddress,
//       commit: () => {}
//     };
//   },
//   releaseReceiveAddress: () => {},
//   serializeExtraFields: (obj, trade) => {},
//   deserializeExtraFields: (obj, trade) => {}
// };
//
// var coinify = new Coinify({
//   user: 'some_user_id',
//   offline_token: 'ID554MPxw0372FYQOKIwuhhiO0TMArwq1RQo2/joP2IgCTJU3Le7TUWxki6A9BLJ',
//   auto_login: true,
//   trades: []
// }, delegate);
//
// var b = {
//   account: {
//     currency: 'GBP',
//     number: 'GB29 NWBK 6016 1331 9268 19',
//     bic: 'DLFKJ'
//   },
//   bank: {
//     name: null,
//     address: {
//       country: 'GB'
//     }
//   },
//   holder: {
//     name: 'prw',
//     address: {
//       country: 'GB',
//       street: '987 dereham',
//       zipcode: '123ABC',
//       city: 'Chelsea'
//     }
//   }
// };
//
// // ----- GET TRADES ----- //
// // /*
// // var trades = coinify.getTrades().then((trades) => {
// //   if (trades.length > 0) {
// //     for (let trade of trades) {
// //       console.log(`**TRADE** id: ${trade.id}, outCurrency: ${trade.outCurrency}, inCurrency: ${trade.inCurrency}, createdAt: ${trade.createdAt}**`)
// //     }
// //   }
// // });
// // */
//
// // ----- GET PROFILE ----- //
// // var profile = coinify.fetchProfile().then((profile) => console.log(`**PROFILE** Email: ${profile.email}, level: ${profile.level.name}, bank inRemaining: ${profile.currentLimits.bank.inRemaining}`))
//
// // ----- FLOW START TO FINISH ----- //
//
// delegate.trades = coinify.trades;
//
// coinify.getSellQuote(1000, 'GBP', 'BTC')
//   .then(quote => {
//     console.log(`${quote.quoteAmount / -100000000} ${quote.quoteCurrency} for ${quote.baseAmount / 100} ${quote.baseCurrency} expires ${quote.expiresAt}`);
//
//     quote.getPayoutMediums().then(mediums => {
//       /* get all */
//       mediums.bank.getAccounts().then(bankAccounts => {
//         // console.log('bankAccounts', bankAccounts);
//         bankAccounts.forEach(bank => console.log(bank.id));
//         // bankAccounts[0].delete();
//         bankAccounts[0].sell();
//       });
//       /* add */
//       // mediums.bank.addBankAccount(b).then(res => {
//       //   console.log('addBank res', res._id);
//       // });
//     });
//   });
