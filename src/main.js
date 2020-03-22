const SHA256 = require('crypto-js/sha256');

/** @class A Transaction in the Block. */
class Transaction {
  /**
   * Creates an instance of a Transaction.
   * @param {*} fromAddress the address the amount is transfering from
   * @param {*} toAddress the address the amount to transfering to
   * @param {*} amount the amount being transfered
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

/** @class A Block on the blockchain. */
class Block {
  /**
   * Creates in instance of a Block.
   * @param {*} timestamp the time this block was minned.
   * @param {*} data the data held within the block
   * @param {*} previousHash the hash of the previous block on the chain
   */
  constructor(transactions, previousHash = '') {
    this.timestamp = new Date();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash(); // the hash of the block
    this.nonce = 0;
  }

  /**
   * Use the SHA256 hash function to calculate the hash of the block.
   * @return the hash of the block
   */
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString();
  }

  /**
   *
   * @param {*} difficulty how many zero's are required to start the hash ex: difficulty 5 = 0x00000xxx
   */
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.timestamp = new Date(); // update the date
      this.nonce += 1; // increment the nonce in order to open up more hash options
      this.hash = this.calculateHash();
    }

    console.log('Block Mined! ' + this.hash);
  }
}

/** @class The Blockchain. */
class Blockchain {
  /** Create an instance of the Blockchain */
  constructor() {
    this.chain = [this.createGenesisBlock()]; // an array of blocks
    this.difficulty = 2; // how many zero's are required to start the hash ex: difficulty 5 = 0x00000xxx
    this.pendingTransactions = []; // the list of available transactions to be added to the blocks
    this.miningReward = 100; // how many 'coins' should be given to the miner mining the Block
  }

  /** Create the first block on the blockchain - with basic data for values. */
  createGenesisBlock() {
    return new Block(
      'Genesis Block',
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
    let block = new Block(this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ]; // reset the pending transactions and add the mining reward
  }

  /**
   * Add a new transaction to the list of pending transactions.
   * @param {*} transaction the transaction to be added to the list
   */
  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  /**
   * Determine if the chain is valid. - meaning all hashes match up.
   * @return whether the chain is valid
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i += 1) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
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
}

module.exports.Block = Block;
module.exports.Blockchain = Blockchain;
