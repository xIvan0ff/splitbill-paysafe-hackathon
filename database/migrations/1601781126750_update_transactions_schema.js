'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UpdateTransactionsSchema extends Schema {
  up () {
    this.table('transactions', (table) => {
      table.string('debtor_iban').after('debtor')
      table.string('iban').after('debtor_iban')
    })
  }

  down () {
    this.table('transactions', (table) => {
      table.dropColumn('debtor_iban')
      table.dropColumn('iban')
    })
  }
}

module.exports = UpdateTransactionsSchema
