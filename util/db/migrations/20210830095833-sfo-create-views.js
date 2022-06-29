'use strict';
const process = require('process');

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query('CREATE VIEW sfo_Applications AS SELECT * FROM sfo."Applications";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_ApplyOthers AS SELECT * FROM sfo."ApplyOthers";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_Returns AS SELECT * FROM sfo."Returns";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_Revocations AS SELECT * FROM sfo."Revocations";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_Setts AS SELECT * FROM sfo."Setts";', {
        type: Sequelize.QueryTypes.RAW
      });
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.query('DROP VIEW sfo_Setts;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW sfo_Revocations;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW sfo_Returns;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW sfo_ApplyOthers;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW sfo_Applications;', {
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
