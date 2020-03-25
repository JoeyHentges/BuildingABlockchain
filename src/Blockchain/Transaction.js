const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// define helper functions
let getMethods;
let getFunctionAssigns;
let getFunctionInsideCurly;

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
        contractInstance: new contract(), // create an instance of the contract
        contractFunctionAssigns: getFunctionAssigns(contractCode, contract) // get a hashmap of the contract functions and their return types
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

/**
 * Get a string of the function inside the curly baces.
 * @param {string[]} functionSplit - an array of strings - split along '{'
 */
getFunctionInsideCurly = functionSplit => {
  let curlyBraceCount = 0;
  for (let i = 1; i < functionSplit.length; i += 1) {
    if (!functionSplit[i].includes('}')) {
      curlyBraceCount += 1;
    }
  }
  let newStr = '';
  for (let i = 1; i < curlyBraceCount + 2; i += 1) {
    newStr += functionSplit[i];
  }
  return newStr;
};

/**
 * Parse a the text of a class and determine which methods contain class variable assignments.
 * @param {string} contractCode - the text of the class being parsed
 * @param {Class} contract - the class of the object
 */
getFunctionAssigns = (contractCode, contract) => {
  const arrayMutators = ['push', 'pop', 'unshift', 'shift', 'splice'];
  let obj = new contract();
  const methods = getMethods(obj);
  const funcAssigns = {};
  for (const method of methods) {
    funcAssigns[method] = false;
    // get the lines within the function
    const lineSplit = getFunctionInsideCurly(
      contractCode.split(method)[1].split('{')
    )
      .split('}')[0]
      .split(';');
    for (const line of lineSplit) {
      // if the line is a comment - skip it
      if (line.includes('//')) {
        continue;
      }
      const equalSplit = line.split('=');
      // if there's an assignment
      if (equalSplit.length > 1) {
        // loop over the list of assignments in the line
        for (let i = 0; i < equalSplit.length; i += 1) {
          // only look at the first part of the assigment - the variable being assigned
          if (i % 2 == 0) {
            // if the assigned variable is a class variable (contains this.)
            if (equalSplit[i].includes('this.')) {
              // note this function as a class variable assigning function
              funcAssigns[method] = true;
            }
          }
        }
      } else {
        // possibly an array mutator
        if (line.includes('this.')) {
          // if accessing or modifying a class variable
          // loop through the list of possible array mutators
          for (const mutator of arrayMutators) {
            // if the line contains an array mutator - it modifies a class variable
            if (line.includes(`.${mutator}(`)) {
              funcAssigns[method] = true;
            }
          }
        }
      }
    }
  }
  return funcAssigns;
};

/**
 * Get the defined methods in an Class object - excluding the constructor and predefined functions
 * @param obj - the object of the class
 */
getMethods = obj => {
  // the list of predefined / required functions in a class
  const predefinedFunctions = [
    'constructor',
    '__defineGetter__',
    '__defineSetter__',
    'hasOwnProperty',
    '__lookupGetter__',
    '__lookupSetter__',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toString',
    'valueOf',
    'toLocaleString'
  ];
  let properties = new Set();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).map(item => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()]
    .filter(item => typeof obj[item] === 'function')
    .filter(item => !predefinedFunctions.includes(item));
};

module.exports.Transaction = Transaction;
