'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserBankAccountsSchema extends Schema {
  up () {
    this.create('user_bank_accounts', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.string('bank_id', 16).notNullable().defaultTo('dsk')
      table.string('access_token', 1024).notNullable().defaultTo('')
      table.string('refresh_token', 1024).notNullable().defaultTo('')
      table.timestamps()
    })
  }

  down () {
    this.drop('user_bank_accounts')
  }
}

module.exports = UserBankAccountsSchema
