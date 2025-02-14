'use strict';
const process = require('process');

// The pre-migrations only make sense when running inside the production docker
// environment. They are not required for the development SQLite DB.
if (process.env.NODE_ENV !== 'all') {
  module.exports = {
    async up(queryInterface) {
      await queryInterface.createSchema('sfo');
    },
    async down(queryInterface) {
      await queryInterface.dropSchema('sfo');
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
