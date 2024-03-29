'use strict';

const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  async up(queryInterface) {
    await queryInterface.renameTable(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Returns'
      },
      'OldReturns'
    );
  },

  async down(queryInterface) {
    await queryInterface.renameTable(
      {
        schema: databaseConfig.database.schema,
        tableName: 'OldReturns'
      },
      'Returns'
    );
  }
};
