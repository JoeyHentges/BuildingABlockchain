var fs = require('fs');

const express = require('express');
const router = express.Router();

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const { coin } = require('../app');
const { Transaction } = require('../src/Blockchain/Transaction');

router.get('/mine_block', (req, res) => {
  const { minerAddress } = req.body;
  console.log(minerAddress);
  const block = coin.minePendingTransactions(minerAddress);
  res.status(200).send({
    message: 'Congraduations, you just mined a block!',
    block
  });
});

router.get('/get_chain', (req, res) => {
  res.status(200).send({
    chain: coin,
    length: coin.chain.length
  });
});

router.get('/is_valid', (req, res) => {
  const is_valid = coin.isChainValid();
  if (is_valid) {
    res.status(200).send({
      message: 'All good. The Blockchain is valid.'
    });
  } else {
    res.status(200).send({
      message: 'Houston, we have a problem. The Blockchain is not valid.'
    });
  }
});

router.post('/add_transaction', async (req, res) => {
  const { privateKey, toAddress, amount, contractCode } = req.body;
  const key = ec.keyFromPrivate(privateKey);
  const walletAddress = key.getPublic('hex');

  var filepath = 'trash/script_executable.js';
  var fileContent = `
    module.exports.contract = ${contractCode}
  `;
  await fs.unlinkSync(filepath);
  await fs.writeFile(filepath, fileContent, err => {
    if (err) throw err;

    console.log('The file was succesfully saved!');
    const { contract } = require('../trash/script_executable');

    const tx = new Transaction(
      walletAddress,
      toAddress,
      Number(amount),
      contract,
      contractCode
    );
    tx.signTransaction(key);
    coin.addTransaction(tx);
    res.status(200).send({
      message: 'Successfully added a transaction!',
      transactionHash: tx.hash
    });
  });
});

router.get('/replace-chain', async (req, res) => {
  const replaced = await coin.replaceChain();
  res.status(200).send('replaced chain ' + replaced);
});

router.post('/contract_function', (req, res) => {
  const { transactionHash, func } = req.body;
  const chain = coin.chain;
  const contracts = coin.contracts;
  const blockIndex = contracts[transactionHash];
  const block = chain[blockIndex];
  for (const transaction of block.transactions) {
    if (transaction.hash === transactionHash) {
      res.status(200).send(eval(`transaction.contractInstance.${func}`));
    }
  }
});

module.exports.router = router;
