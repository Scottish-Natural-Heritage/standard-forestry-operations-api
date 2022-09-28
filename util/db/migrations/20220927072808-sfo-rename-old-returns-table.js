'use strict';

const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Returns'
      },
      'ReturnsOld'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable(
      {
        schema: databaseConfig.database.schema,
        tableName: 'ReturnsOld'
      },
      'Returns'
    );
  }
};
