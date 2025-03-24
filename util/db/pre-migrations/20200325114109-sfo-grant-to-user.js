'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Allow our app's user to connect to the database.
    await queryInterface.sequelize.query('grant connect on database licensing to sfo;', {
      type: Sequelize.QueryTypes.RAW
    });

    // Grant our app's user full control of their own schema.
    await queryInterface.sequelize.query('grant all on schema sfo to sfo;', {
      type: Sequelize.QueryTypes.RAW
    });
  },

  async down(queryInterface, Sequelize) {
    // Revoke our app's user's privileges from its schema.
    await queryInterface.sequelize.query('revoke all on schema sfo from sfo;', {
      type: Sequelize.QueryTypes.RAW
    });

    // Prevent our app's user from connecting to the database.
    await queryInterface.sequelize.query('revoke all on database licensing from sfo;', {
      type: Sequelize.QueryTypes.RAW
    });
  }
};
