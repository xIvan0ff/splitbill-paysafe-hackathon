'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserNameSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.string('name').after('id').notNullable().defaultTo('John Doe')
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('name')
    })
  }
}

module.exports = UserNameSchema
