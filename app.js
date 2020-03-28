// Requirements
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');

// Blockchain
const { Blockchain } = require('./src/Blockchain/Blockchain');
let coin = new Blockchain();
// check for an existing blockchain
const blockchainPath = './__BLOCKCHAIN__/blockchain.json';
try {
  if (fs.existsSync(blockchainPath)) {
    let rawdata = fs.readFileSync('./__BLOCKCHAIN__/blockchain.json');
    const {
      chain,
      difficulty,
      pendingTransactions,
      miningReward,
      contracts,
      network
    } = JSON.parse(rawdata);
    coin = new Blockchain(
      chain,
      difficulty,
      pendingTransactions,
      miningReward,
      contracts,
      network
    );
  } else {
    coin.exportToFile();
  }
  // check to replace the base chain with any connected nodes
  // then export the new chain if it is new
  coin.replaceChain().then(res => {
    coin.exportToFile();
  });
} catch (err) {
  console.error(err);
}

const app = express();

app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Export app to be used in Server.js
module.exports.app = app;
module.exports.coin = coin;

// Add Routes to the app
app.use('/', require('./main/routes').router);
