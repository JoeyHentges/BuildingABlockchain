const express = require('express');
const router = express.Router();

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const { coin } = require('../app');
const { Transaction } = require('../src/Blockchain/Transaction');

router.get('/new_wallet', (req, res) => {
  const key = ec.genKeyPair();
  const privateKey = key.getPrivate('hex');
  res.status(200).send({
    message:
      'Congraduations, you just generated a new wallet! Use your private key to mine blocks and submit transactions!',
    privateKey
  });
});

router.get('/mine_block', (req, res) => {
  const { minerAddress } = req.body;
  console.log(minerAddress);
  const block = coin.minePendingTransactions(minerAddress);
  coin.exportToFile(); // export the new blockchain
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

router.get('/export_chain', (req, res) => {
  coin.exportToFile();
  res.status(200).send({
    message: 'Successfully exported chain to C://__BLOCKCHAIN__/'
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
  const {
    privateKey,
    toAddress,
    amount,
    contractCode,
    contractFunctionsSchema
  } = req.body;
  const key = ec.keyFromPrivate(privateKey);
  const walletAddress = key.getPublic('hex');
  var fixedContract = `(${contractCode})`;
  const tx = new Transaction(
    walletAddress,
    toAddress,
    Number(amount),
    eval(fixedContract),
    contractCode,
    contractFunctionsSchema
  );
  tx.signTransaction(key);
  coin.addTransaction(tx);
  coin.exportToFile(); // export the new blockchain
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

  // make a check to see if this private key - address can even make changes to the contract
  // get the transaction
  const chain = coin.chain; // get the chain
  const contracts = coin.contracts; // get the contracts hashmap
  const blockIndex = contracts[contractHash]; // get the index of the block containing the specified contract
  const block = chain[blockIndex]; // get the block
  const transactionContractIndex = block.contracts[contractHash]; // get the index of the transaction containing the contract
  const transactionContract = block.transactions[transactionContractIndex]; // get the transaction
  console.log(transactionContract);
  // make the check
  if (transactionContract.contract.contractKey !== walletAddress) {
    res.status(401).send({
      message: 'Wallet Address does not match the contract key!'
    });
  }

  const tx = new Transaction(
    walletAddress,
    toAddress,
    Number(amount),
    null,
    null,
    null,
    contractHash,
    contractFunction
  );
  tx.signTransaction(key);
  coin.addTransaction(tx);
  coin.exportToFile(); // export the new blockchain
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
  coin.exportToFile(); // export the new blockchain
  res.status(200).send({
    message: 'Successfully added a transaction!',
    transactionHash: tx.hash
  });
});

router.get('/replace_chain', async (req, res) => {
  const replaced = await coin.replaceChain();
  res.status(200).send('replaced chain ' + replaced);
});

router.get('/contract_get', (req, res) => {
  const { transactionHash, func } = req.body;
  const chain = coin.chain; // get the chain
  const contracts = coin.contracts; // get the contracts hashmap
  const blockIndex = contracts[transactionHash]; // get the index of the block containing the specified contract
  const block = chain[blockIndex]; // get the block
  const transactionContractIndex = block.contracts[transactionHash]; // get the index of the transaction containing the contract
  const transactionContract = block.transactions[transactionContractIndex]; // get the transaction
  // check if the contract function doesn't return anything - assuming this means it's a setter
  if (
    transactionContract.contract.contractFunctionAssigns[func.split('(')[0]] ===
    true
  ) {
    res.status(200).send({
      message:
        'You cannot call functions that set variables! Use a transaction instead!'
    });
    return;
  }
  // execute the contract and send the result
  res
    .status(200)
    .send(eval(`transactionContract.contract.contractInstance.${func}`));
});

module.exports.router = router;
