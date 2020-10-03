'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddCompletedColumnBillSchema extends Schema {
  up () {
    this.table('bills', (table) => {
      table.integer('completed').after('participants').notNullable().defaultTo(0)
    })
  }

  down () {
    this.table('bills', (table) => {
      table.dropColumn('completed')
    })
  }
}

module.exports = AddCompletedColumnBillSchema
