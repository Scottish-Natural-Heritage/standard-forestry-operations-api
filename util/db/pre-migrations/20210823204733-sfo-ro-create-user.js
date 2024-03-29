'use strict';
const process = require('process');

// The pre-migrations only make sense when running inside the production docker
// environment. They are not required for the development SQLite DB.
if (process.env.NODE_ENV === 'production') {
  // Even though this is a 'pre-migrations' migration, we need to import the
  // production config as we're setting the password the production account will
  // use.
  const config = require('../../../src/config/database.js').ssDatabase;

  module.exports = {
    async up(queryInterface, Sequelize) {
      return queryInterface.sequelize.query('create role rosfo with noinherit login password :roSfoPassword;', {
        type: Sequelize.QueryTypes.RAW,
        replacements: {
          roSfoPassword: config.password
        }
      });
    },
    async down(queryInterface, Sequelize) {
      return queryInterface.sequelize.query('drop role rosfo;', {
        type: Sequelize.QueryTypes.RAW
      });
    }
  };
} else {
  module.exports = {
    up() {
      return Promise.resolve();
    },
    down() {
      return Promise.resolve();
    }
  };
}
