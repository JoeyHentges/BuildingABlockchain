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

    const block = new Block(
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
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
}

module.exports.Blockchain = Blockchain;
