'use strict';

// This migration is basically the opposite of create setts, so we just import
// it and run it in reverse.
const settTypes = require('./20200326111631-sfo-create-setts-types');
module.exports = {
  up: async (queryInterface) => {
    await settTypes.down(queryInterface);
  },

  down: async (queryInterface, Sequelize) => {
    await settTypes.up(queryInterface, Sequelize);
  }
};
