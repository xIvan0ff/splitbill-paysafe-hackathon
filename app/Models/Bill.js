'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Bill extends Model {

  /**
   * Return the bill's users.
   *
   * @method user
   *
   * @return {Object}
   */
  users () {
    return this.hasMany('App/Models/User')
  }
}

module.exports = Bill
