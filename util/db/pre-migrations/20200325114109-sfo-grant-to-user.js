'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query('grant connect on database licensing to sfo;', {
        type: Sequelize.QueryTypes.RAW
      }),
      queryInterface.sequelize.query('grant all on schema sfo to sfo;', {
        type: Sequelize.QueryTypes.RAW
      })
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.sequelize.query('revoke all on schema sfo from sfo;', {
        type: Sequelize.QueryTypes.RAW
      }),
      queryInterface.sequelize.query('revoke all on database licensing from sfo;', {
        type: Sequelize.QueryTypes.RAW
      })
    ]);
  }
};
