'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RemoveUsernameSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.dropColumn('username')
    })
  }

  down () {
    this.table('users', (table) => {
      table.string('username', 80).notNullable().unique()
    })
  }
}

module.exports = RemoveUsernameSchema
