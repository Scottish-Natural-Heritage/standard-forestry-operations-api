'use strict';

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createSchema('sfo');
  },
  down: (queryInterface) => {
    return queryInterface.dropSchema('sfo');
  }
};
