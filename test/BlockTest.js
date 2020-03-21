const assert = require('assert');
const { Block } = require('../src/main');

it('should create an empty block', () => {
  const block = new Block();
  assert.equal(block.index, undefined);
  assert.equal(block.data, undefined);
  assert.equal(block.nonce, 0);
  assert.notEqual(block.hash, undefined);
});
