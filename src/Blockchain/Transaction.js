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

module.exports.Transaction = Transaction;
