'use strict';

  module.exports = {
    async up(queryInterface) {
      await queryInterface.createSchema('sfo');
    },
    async down(queryInterface) {
      await queryInterface.dropSchema('sfo');
    }
  };
