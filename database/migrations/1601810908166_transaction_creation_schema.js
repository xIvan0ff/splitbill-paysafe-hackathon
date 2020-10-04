'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionCreationSchema extends Schema {
  up () {
    this.table('transactions', (table) => {
      table.string('date').after('description')
    })
  }

  down () {
    this.table('transactions', (table) => {
      table.dropColumn('date')
    })
  }
}

module.exports = TransactionCreationSchema
