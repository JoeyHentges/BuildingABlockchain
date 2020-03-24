const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/** @class A Transaction in the Block. */
class Transaction {
  /**
   * Creates an instance of a Transaction.
   * @param {string} fromAddress the address the amount is transfering from
   * @param {string} toAddress the address the amount to transfering to
   * @param {float} amount the amount being transfered
   * @param {class} contract the class of the contract
   * @param {string} contractCode the code (string) of the contract
   * @param {*} contractHash
   * @param {*} contractFunction
   */
  constructor(
    fromAddress,
    toAddress,
    amount,
    contract = null,
    contractCode = null,
    contractHash = null,
    contractFunction = null
  ) {
    this.timestamp = new Date();
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    // if there is contract code
    if (contract) {
      this.contract = {
        contractCode, // save a copy of the code
        contractInstance: new contract() // create an instance of the contract
      };
    } else if (contractHash) {
      // if instead there's a contract function call
      this.contractFunction = {
        hash: contractHash,
        function: contractFunction
      };
    }
    this.hash = this.calculateHash();
  }

  /**
   * Calcuate the SHA256 hash of the transaction.
   * @return {string}
   */
  calculateHash() {
    return SHA256(
      this.fromAddress +
        this.toAddress +
        this.amount +
        this.timestamp +
        JSON.stringify(this.contractCode)
    ).toString();
  }

  /**
   * Sign a transaction.
   * @param {string} signingKey the key signing the transaction - sender
   */
  signTransaction(signingKey) {
    // check if the public key equals the fromAddress of the transaction
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }
    const hashTx = this.calculateHash();
    const signature = signingKey.sign(hashTx, 'base64');
    this.signature = signature.toDER('hex');
  }

  /**
   * Verify if the transaction is a valid (signed) transaction
   * @returns {boolean}
   */
  isValid() {
    // transaction is a mining reward
    if (this.fromAddress === null) {
      return true;
    }
    // transaction is not signed or signed illigally
    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction!');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

module.exports.Transaction = Transaction;
