'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BillsSchema extends Schema {
  up () {
    this.create('bills', (table) => {
      table.increments()
      table.string('name')
      table.float('price')
      table.integer('people_count')
      table.timestamps()
    })

    this.create('transactions', (table) => {
      table.increments()
      table.string('creditor')
      table.string('debtor')
      table.float('amount')
      table.text('description')
      table.timestamps()
    })

    this.create('bill_transactions', (table) => {
      table.increments()
      table.integer('bill_id').unsigned().references('id').inTable('bills')
      table.integer('transaction_id').unsigned().references('id').inTable('transactions')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.timestamps()
    })

    this.create('bill_users', (table) => {
      table.increments()
      table.integer('bill_id').unsigned().references('id').inTable('bills')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.timestamps()
    })
  }

  down () {
    this.drop('bills')
    this.drop('transactions')
    this.drop('bill_transactions')
    this.drop('bills_users')
  }
}

module.exports = BillsSchema
