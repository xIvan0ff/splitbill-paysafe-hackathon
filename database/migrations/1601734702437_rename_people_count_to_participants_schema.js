'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RenamePeopleCountToParticipantsSchema extends Schema {
  up () {
    this.table('bills', (table) => {
      table.renameColumn('people_count', 'participants')
    })
  }

  down () {
    this.table('bills', (table) => {
      table.renameColumn('participants', 'people_count')
    })
  }
}

module.exports = RenamePeopleCountToParticipantsSchema
