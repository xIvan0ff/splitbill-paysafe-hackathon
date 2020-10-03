'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddBankTokenExpireTimeSchema extends Schema {
  up () {
    this.table('user_bank_accounts', (table) => {
      table.integer('expires_in').after('access_token').notNullable().defaultTo(3600)
    })
  }

  down () {
    this.table('user_bank_accounts', (table) => {
      table.dropColumn('expires_in')
    })
  }
}

module.exports = AddBankTokenExpireTimeSchema
