const SHA256 = require('crypto-js/sha256');

/** @class A Block on the blockchain. */
class Block {
  /**
   * Creates in instance of a Block.
   * @param {*} timestamp the time this block was minned.
   * @param {*} data the data held within the block
   * @param {*} previousHash the hash of the previous block on the chain
   */
  constructor(transactions, previousHash = '', contracts = {}) {
    this.timestamp = new Date();
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash(); // the hash of the block
    this.nonce = 0;
    this.contracts = contracts; // a hashmap of contract hashs => they point to their transaction list index
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
        JSON.stringify(this.transactions) +
        JSON.stringify(this.contracts) +
        this.nonce
    ).toString();
  }

  /**
   * Starts the mining process on the block.
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

  /** Verify all the transactions in the Block are valid. */
  hasValidTransactions() {
    for (const tx of this.transactions) {
      // check if transaction is valid
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Block = Block;
