const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const { Block } = require('./Blockchain/Block');
const { Blockchain } = require('./Blockchain/Blockchain');
const { Transaction } = require('./Blockchain/Transaction');

const myKey = ec.keyFromPrivate(
  '6a6f12d841d959912d373e7759bd397f4fe80c51284a457269025fd87b68cca6'
);
const myWalletAddress = myKey.getPublic('hex');

let coin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
coin.addTransaction(tx1);

const tx2 = new Transaction(
  myWalletAddress,
  'public key goes here',
  0,
  class ContractTest {
    constructor() {
      this.greeting = 'Hello world!';
    }
    setGreeting(greeting) {
      this.greeting = greeting;
    }
    getGreeting() {
      return this.greeting;
    }
  }
);
tx2.signTransaction(myKey);
coin.addTransaction(tx2);

console.log('starting a minier');
coin.minePendingTransactions(myWalletAddress);
console.log(
  'balance of miner-address is: ' + coin.getBalanceOfAddress(myWalletAddress)
);

console.log('Is chain valid? ' + coin.isChainValid());

console.log(JSON.stringify(coin, null, 4));

const code = coin.chain[1].transactions[1].contractCode;
console.log(code);

const temp = new code();
console.log(temp.getGreeting());
console.log(temp.setGreeting('Hey Joey!'));
console.log(temp.getGreeting());
