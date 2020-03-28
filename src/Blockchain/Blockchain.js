const superagent = require('superagent');
const fs = require('fs');
const { Block } = require('./Block');
const { Transaction } = require('./Transaction');

// Helper functions
let json2array;

/** @class The Blockchain. */
class Blockchain {
  /** Create an instance of the Blockchain */
  constructor(
    chain = [this.createGenesisBlock()],
    difficulty = 2,
    pendingTransactions = [],
    miningReward = 100,
    contracts = {},
    network = [
      {
        url: 'http://localhost:3001', // the url
        attempt: 0 // the number of times a connection attempt has been made - the is to remove any that haven't been connected to in a while
      }
    ]
  ) {
    this.chain = chain; // an array of blocks
    this.difficulty = difficulty; // how many zero's are required to start the hash ex: difficulty 5 = 0x00000xxx
    this.pendingTransactions = pendingTransactions; // the list of available transactions to be added to the blocks
    this.miningReward = miningReward; // how many 'coins' should be given to the miner mining the Block
    this.contracts = contracts; // create an empty 'Hashmap' of contracts - used for easy picking of contracts from blocks - the block index they're in
    this.network = network;
    // the chain is not a default chain
    if (chain.length > 1) {
      this.updateChain(this.chain, this.contracts, this.pendingTransactions);
    }
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
    const contractIndices = {};

    // get the contracts (hashes) in the list of transactions and add them to the list of contracts in the blockchain contracts list
    let index = 0;
    for (const transaction of this.pendingTransactions) {
      // if there is code for a contract
      if (transaction.contract) {
        contractIndices[transaction.hash] = index;
        this.contracts[transaction.hash] = this.chain.length;
      } else if (transaction.contractFunction) {
        // if instead this transaction is a contract function
        const blockIndex = this.contracts[transaction.contractFunction.hash];
        const block = this.chain[blockIndex];
        const transactionContractIndex =
          block.contracts[transaction.contractFunction.hash]; // get the index of the transaction containing the contract
        const transactionContract =
          block.transactions[transactionContractIndex]; // get the transaction
        // execute the function on the contract
        try {
          eval(
            `transactionContract.contract.contractInstance.${transaction.contractFunction.function}`
          );
        } catch (err) {
          // the function has an error - so remove it from the pendingTransactions arry
          this.pendingTransactions.splice(index, 1);
        }
      }
      index += 1;
    }

    const block = new Block(
      this.pendingTransactions,
      this.getLatestBlock().hash,
      contractIndices
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
      try {
        const response = await superagent
          .get(`${node.url}/get_chain_length`)
          .then(res => res);
        const nodeChain = JSON.parse(response.text);
        if (response.status === 200 && nodeChain.length > chainLength) {
          chainLength = nodeChain.length;
          nodeOfLargestChain = node.url;
        }
        node.attempt = 0;
      } catch (err) {
        node.attempt += 1;
        // ignore - cannot connect to node
        // check to see if to remove - unable to connect 100 times
        if (node.attempt === 100) {
          const index = this.network.indexOf(node);
          this.network.splice(index, 1);
        }
      }
    }
    if (nodeOfLargestChain !== null) {
      const response = await superagent
        .get(`${nodeOfLargestChain}/get_chain`)
        .then(res => res);
      const nodeChain = JSON.parse(response.text).chain;
      this.updateChain(
        nodeChain.chain,
        nodeChain.contracts,
        nodeChain.pendingTransactions
      );
    }
    return nodeOfLargestChain !== null;
  }

  /**
   * Update the current object with these values and create any contract instances.
   * @param {array} chain
   * @param {json} contracts
   * @param {array} pendingTransactions
   */
  updateChain(chain, contracts, pendingTransactions) {
    this.chain = chain;
    this.contracts = contracts;
    this.pendingTransactions = pendingTransactions;
    this.setContractInstances();
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
          const contractVariables = json2array(
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

  /** Export the Blockchain to a file. */
  exportToFile() {
    const folderName = '__BLOCKCHAIN__/';
    try {
      if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
      }
      fs.writeFile(
        `${folderName}blockchain.json`,
        JSON.stringify(this, null, 2),
        function(err) {
          if (err) return console.log(err);
          console.log('Successfully exported the blockchain!');
        }
      );
    } catch (err) {
      console.error(err);
    }
  }
}

/**
 * Helper function for setContractInstances()
 * Convert a json object to an array of parameters.
 * @param {*} json the json object
 * @return {array} the list of values
 */
json2array = json => {
  var result = [];
  var keys = Object.keys(json);
  keys.forEach(function(key) {
    result.push(json[key]);
  });
  return result;
};

module.exports.Blockchain = Blockchain;
