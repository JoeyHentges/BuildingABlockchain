const SHA256 = require('crypto-js/sha256');

/** @class A Block on the blockchain. */
class Block {
  /**
   * Creates in instance of a Block.
   * @param {*} index the number this block is on the chain.
   * @param {*} timestamp the time this block was minned.
   * @param {*} data the data held within the block
   * @param {*} previousHash the hash of the previous block on the chain
   */
  constructor(index, data, previousHash = '') {
    this.index = index;
    this.timestamp = new Date();
    this.data = data;
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
    this.difficulty = 5; // how many zero's are required to start the hash ex: difficulty 5 = 0x00000xxx
  }

  /** Create the first block on the blockchain - with basic data for values. */
  createGenesisBlock() {
    return new Block(0, new Date(), 'Genesis Block', '0x0');
  }

  /**
   * Get the last block on the chain.
   * @return the last block on the blockchain
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Add a new block to the blockchain.
   */
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
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
/*
let coin = new Blockchain();

console.log('minning block 1');
coin.addBlock(new Block(1, new Date(), { amount: 10 }));
console.log('minning block 2');
coin.addBlock(new Block(2, new Date(), { amount: 20 }));
console.log('minning block 3');
coin.addBlock(new Block(3, new Date(), { amount: 50 }));
*/
