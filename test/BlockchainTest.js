const assert = require('assert');
const { Blockchain } = require('../src/main');

it('should create a blockchain with one block', () => {
  const blockchain = new Blockchain();
  assert.equal(blockchain.chain.length, 1);
});
