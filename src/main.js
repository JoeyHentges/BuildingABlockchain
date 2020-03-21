/** @class A Block on the blockchain. */
class Block {
  /**
   * Creates in instance of a Block.
   * @param {*} index the number this block is on the chain.
   * @param {*} timestamp the time this block was minned.
   * @param {*} data the data held within the block
   * @param {*} previousHash the hash of the previous block on the chain
   */
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = ''; // the hash of the block
  }

  /**
   * Use the SHA256 hash function to create a hash of the block.
   */
  calculateHash() {}
}
