'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

const Transaction = use('App/Models/Transaction')

class Bill extends Model {
  static boot () {
    super.boot()

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (billInstance) => {
      let amount = 0
      const trans = this.transactions()
      for (const billTransaction of trans) {
        const transaction = await Transaction.find(billTransaction.transaction_id)
        amount += transaction.amount
      }
      billInstance.amount = amount
    })
  }

  /**
   * Return the bill's users.
   *
   * @method users
   *
   * @return {Object}
   */
  users () {
    return this.hasMany('App/Models/BillUser')
  }

  /**
   * Return the bill's transactions.
   *
   * @method transactions
   *
   * @return {Object}
   */
  transactions () {
    return this.hasMany('App/Models/BillTransaction')
  }
}

module.exports = Bill
