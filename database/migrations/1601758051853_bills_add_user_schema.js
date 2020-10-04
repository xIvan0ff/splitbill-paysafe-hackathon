'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BillsAddUserSchema extends Schema {
  up () {
    this.table('bills', (table) => {
      table.integer('user_id').unsigned().after('participants').references('id').inTable('users')
    })
  }

  down () {
    this.table('bills', (table) => {
      table.dropColumn('user_id')
    })
  }
}

module.exports = BillsAddUserSchema
