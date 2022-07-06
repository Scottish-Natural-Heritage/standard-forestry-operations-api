'use strict';
const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Applications'
      },
      'createdByLicensingOfficer',
      Sequelize.STRING
    );
  },
  async down(queryInterface) {
    await queryInterface.removeColumn(
      {
        schema: databaseConfig.database.schema,
        tableName: 'Applications'
      },
      'createdByLicensingOfficer'
    );
  }
};
