'use strict';

// This migration is basically the opposite of create setts, so we just import
// it and run it in reverse.
const settTypes = require('./20200326111631-sfo-create-setts-types');

module.exports = {
  async up(queryInterface) {
    await settTypes.down(queryInterface);
  },

  async down(queryInterface, Sequelize) {
    await settTypes.up(queryInterface, Sequelize);
  }
};
