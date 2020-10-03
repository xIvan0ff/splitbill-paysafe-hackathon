'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserOauthSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.uuid('bank_oauth_state').after('password')
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('bank_oauth_state')
    })
  }
}

module.exports = UserOauthSchema
