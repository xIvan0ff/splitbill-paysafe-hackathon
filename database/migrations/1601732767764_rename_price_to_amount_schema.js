'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RenamePriceToAmountSchema extends Schema {
  up () {
    this.table('bills', (table) => {
      table.renameColumn('price', 'amount')
    })
  }

  down () {
    this.table('bills', (table) => {
      table.renameColumn('amount', 'price')
    })
  }
}

module.exports = RenamePriceToAmountSchema
