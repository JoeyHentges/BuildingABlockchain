const superagent = require('superagent');
const { Block } = require('./Block');
const { Transaction } = require('./Transaction');

/** @class The Blockchain. */
class Blockchain {
  /** Create an instance of the Blockchain */
  constructor() {
    this.chain = [this.createGenesisBlock()]; // an array of blocks
    this.difficulty = 2; // how many zero's are required to start the hash ex: difficulty 5 = 0x00000xxx
    this.pendingTransactions = []; // the list of available transactions to be added to the blocks
    this.miningReward = 100; // how many 'coins' should be given to the miner mining the Block
    this.contracts = {}; // create an empty 'Hashmap' of contracts - used for easy picking of contracts from blocks - the block index they're in
    this.network = ['http://localhost:3000'];
  }

  /** Create the first block on the blockchain - with basic data for values. */
  createGenesisBlock() {
    return new Block(
      [],
      '0000000000000000000000000000000000000000000000000000000000000000'
    );
  }

  /**
   * Get the last block on the chain.
   * @return the last block on the blockchain
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Mine a block on the blockchain.
   * @param {*} miningRewardAddress the miner mining the block - send the reward to this address
   */
  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    // get the contracts (hashes) in the list of transactions and add them to the list of contracts in the blockchain contracts list
    for (const transaction of this.pendingTransactions) {
      // if there is code for a contract
      if (transaction.contract) {
        this.contracts[transaction.hash] = this.chain.length;
      } else if (transaction.contractFunction) {
        // if instead this transaction is a contract function
        const blockIndex = this.contracts[transaction.contractFunction.hash];
        const block = this.chain[blockIndex];
        for (const trans of block.transactions) {
          if (trans.hash === transaction.contractFunction.hash) {
            const contract = trans.contract.contractInstance;
            eval(`contract.${transaction.contractFunction.function}`);
          }
        }
      }
    }

    const block = new Block(
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
    return block;
  }

  /**
   * Add a new transaction to the list of pending transactions.
   * @param {*} transaction the transaction to be added to the list
   */
  addTransaction(transaction) {
    // check if the from address and to address are filled in
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include a from and to address!');
    }
    // verify the transaction is valid
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transactions to the chain!');
    }

    this.pendingTransactions.push(transaction);
  }

  /**
   * Get the number of coins an address has
   * @param {*} address the address to get the balance of
   */
  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        // subtract from balance - sending 'coins'
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
        // add to balance - receiving 'coins'
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }
    return balance;
  }

  /**
   * Determine if the chain is valid. - meaning all hashes match up.
   * @return whether the chain is valid
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i += 1) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      // check if the block has all valid transactions
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }
      // check if each block's hash is actually what it should be - if not, false
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
      // check if the block points to a correct previous block - if not, false
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true; // the block is valid
  }

  /**
   * Loop through all of the connected nodes in the network and find which has the longest chain.
   * If longer than the current chain, retreive it and swap with the current one.
   */
  async replaceChain() {
    let chainLength = this.chain.length;
    let nodeOfLargestChain = null;
    for (const node of this.network) {
      const response = await superagent
        .get(`${node}/get_chain_length`)
        .then(res => res);
      const nodeChain = JSON.parse(response.text);
      if (response.status === 200 && nodeChain.length > chainLength) {
        chainLength = nodeChain.length;
        nodeOfLargestChain = node;
      }
    }
    if (nodeOfLargestChain !== null) {
      const response = await superagent
        .get(`${nodeOfLargestChain}/get_chain`)
        .then(res => res);
      const nodeChain = JSON.parse(response.text).chain;
      this.chain = nodeChain.chain;
      this.contracts = nodeChain.contracts;
      this.pendingTransactions = nodeChain.pendingTransactions;
      this.setContractInstances();
    }
    return nodeOfLargestChain !== null;
  }

  /**
   * Loop through all of the contracts in the new chain and set their instances.
   * Specifically, setting variables in the instances.
   */
  setContractInstances() {
    // loop over all of the contracts in the contracts list
    for (const contractHash in this.contracts) {
      const blockIndex = this.contracts[contractHash];
      const block = this.chain[blockIndex];
      for (const transaction of block.transactions) {
        if (transaction.hash === contractHash) {
          var fixedContract = `(${transaction.contract.contractCode})`;
          const contractVariables = this.json2array(
            transaction.contract.contractInstance
          );

          const contract = eval(fixedContract);
          const instance = new contract();
          instance.applyParameters(...contractVariables);
          transaction.contract.contractInstance = instance;
        }
      }
    }
  }

  /**
   * Helper function for setContractInstances()
   * Convert a json object to an array of parameters.
   * @param {*} json the json object
   * @return {array} the list of values
   */
  json2array(json) {
    var result = [];
    var keys = Object.keys(json);
    keys.forEach(function(key) {
      result.push(json[key]);
    });
    return result;
  }
}

module.exports.Blockchain = Blockchain;
