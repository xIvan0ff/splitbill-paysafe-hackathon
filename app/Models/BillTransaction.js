'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class BillTransaction extends Model {

  /**
   * Return the bill transaction's transaction.
   *
   * @method transaction
   *
   * @return {Object}
   */
  transaction () {
    return this.belongsTo('App/Models/Transaction')
  }

}

module.exports = BillTransaction
