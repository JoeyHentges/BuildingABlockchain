const { Block } = require('./Blockchain/Block');
const { Blockchain } = require('./Blockchain/Blockchain');
const { Transaction } = require('./Blockchain/Transaction');

let coin = new Blockchain();

coin.createTransaction(new Transaction('address1', 'address2', 100));
coin.createTransaction(new Transaction('address1', 'address3', 20));
coin.createTransaction(new Transaction('address2', 'address1', 40));

console.log('starting a minier');
coin.minePendingTransactions('miner-address');
console.log(
  'balance of miner-address is: ' + coin.getBalanceOfAddress('miner-address')
);
console.log('starting a minier again');
coin.minePendingTransactions('miner-address');
console.log(
  'balance of miner-address is: ' + coin.getBalanceOfAddress('miner-address')
);
