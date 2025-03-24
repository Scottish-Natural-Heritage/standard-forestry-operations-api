'use strict';

  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query('DROP VIEW sfo_Returns;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_Returns AS SELECT * FROM sfo."Returns";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_OldReturns AS SELECT * FROM sfo."OldReturns";', {
        type: Sequelize.QueryTypes.RAW
      });
    },

    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.query('DROP VIEW sfo_OldReturns;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW sfo_Returns;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_Returns AS SELECT * FROM sfo."OldReturns";', {
        type: Sequelize.QueryTypes.RAW
      });
    }
  };
