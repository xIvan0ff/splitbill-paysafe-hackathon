'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChangeTransactionsSchema extends Schema {
  up () {
    this.table('transactions', (table) => {
      table.dropColumn('creditor')
    })
  }

  down () {
    this.table('transactions', (table) => {
      table.string('creditor')
    })
  }
}

module.exports = ChangeTransactionsSchema
