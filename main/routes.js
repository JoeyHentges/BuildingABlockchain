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

router.get('/get_chain_length', (req, res) => {
  res.status(200).send({
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

router.get('/get_balance', async (req, res) => {
  res.status(200).send({
    address: req.body.address,
    balance: coin.getBalanceOfAddress(req.body.address)
  });
});

router.post('/add_contract', (req, res) => {
  const { privateKey, toAddress, amount, contractCode } = req.body;
  const key = ec.keyFromPrivate(privateKey);
  const walletAddress = key.getPublic('hex');
  var fixedContract = `(${contractCode})`;
  const tx = new Transaction(
    walletAddress,
    toAddress,
    Number(amount),
    eval(fixedContract),
    contractCode
  );
  tx.signTransaction(key);
  coin.addTransaction(tx);
  res.status(200).send({
    message: 'Successfully added a contract!',
    transactionHash: tx.hash
  });
});

router.post('/contract_set', (req, res) => {
  const {
    privateKey,
    toAddress,
    amount,
    contractHash,
    contractFunction
  } = req.body;
  const key = ec.keyFromPrivate(privateKey);
  const walletAddress = key.getPublic('hex');
  const tx = new Transaction(
    walletAddress,
    toAddress,
    Number(amount),
    null,
    null,
    contractHash,
    contractFunction
  );
  tx.signTransaction(key);
  coin.addTransaction(tx);
  res.status(200).send({
    message: 'Successfully commit a contract transaction!',
    contractHash: contractHash,
    transactionHash: tx.hash
  });
});

router.post('/add_transaction', (req, res) => {
  const { privateKey, toAddress, amount } = req.body;
  const key = ec.keyFromPrivate(privateKey);
  const walletAddress = key.getPublic('hex');
  const tx = new Transaction(walletAddress, toAddress, Number(amount));
  tx.signTransaction(key);
  coin.addTransaction(tx);
  res.status(200).send({
    message: 'Successfully added a transaction!',
    transactionHash: tx.hash
  });
});

router.get('/replace_chain', async (req, res) => {
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
      res
        .status(200)
        .send(eval(`transaction.contract.contractInstance.${func}`));
    }
  }
});

module.exports.router = router;
