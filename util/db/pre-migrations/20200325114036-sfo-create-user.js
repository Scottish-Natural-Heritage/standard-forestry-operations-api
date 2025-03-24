'use strict';

  // Even though this is a 'pre-migrations' migration, we need to import the
  // production config as we're setting the password the production account will
  // use.
  const config = require('../../../src/config/database').database;

  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query('create role sfo with noinherit login password :sfoPassword;', {
        type: Sequelize.QueryTypes.RAW,
        replacements: {
          sfoPassword: config.password
        }
      });
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.query('drop role sfo;', {
        type: Sequelize.QueryTypes.RAW
      });
    }
  };
