'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChangeTransactionsAddUserSchema extends Schema {
  up () {
    this.table('transactions', (table) => {
      table.integer('user_id').unsigned().after('id').references('id').inTable('users')
    })
  }

  down () {
    this.table('transactions', (table) => {
      table.dropColumn('user_id')
    })
  }
}

module.exports = ChangeTransactionsAddUserSchema
