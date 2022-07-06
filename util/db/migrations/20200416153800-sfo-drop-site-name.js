'use strict';

const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Applications'
      },
      'siteName'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Applications'
      },
      'siteName',
      Sequelize.STRING
    );
  }
};
