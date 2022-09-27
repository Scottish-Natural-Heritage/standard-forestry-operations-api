'use strict';

const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Returns'
      },
      'beforeObjectiveRef'
    );

    await queryInterface.removeColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Returns'
      },
      'afterObjectiveRef'
    );

    await queryInterface.renameColumn('Returns', 'fromDate', 'startDate');
    await queryInterface.renameColumn('Returns', 'toDate', 'endDate');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Returns', 'endDate', 'toDate');
    await queryInterface.renameColumn('Returns', 'startDate', 'fromDate');

    await queryInterface.addColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Returns'
      },
      'afterObjectiveRef',
      Sequelize.STRING
    );

    await queryInterface.addColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Returns'
      },
      'beforeObjectiveRef',
      Sequelize.STRING
    );
  }
};
