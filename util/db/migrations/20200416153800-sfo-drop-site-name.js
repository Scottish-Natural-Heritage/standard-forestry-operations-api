'use strict';

const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn(
      {
        schema: databaseConfig.production.schema,
        tableName: 'Applications'
      },
      'siteName'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      {
        schema: databaseConfig.production.schema,
        tableName: 'Applications'
      },
      'siteName',
      Sequelize.STRING
    );
  },
};
