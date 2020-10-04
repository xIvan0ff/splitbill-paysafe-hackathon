'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Bill extends Model {

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
