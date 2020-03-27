'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createSchema('sfo');
  },
  down: async (queryInterface) => {
    await queryInterface.dropSchema('sfo');
  }
};
