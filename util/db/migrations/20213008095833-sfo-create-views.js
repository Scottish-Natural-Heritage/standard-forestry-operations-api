'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query('CREATE VIEW applications_sfo_v AS SELECT * FROM sfo."Applications";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW apply_others_sfo_v AS SELECT * FROM sfo."ApplyOthers";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW returns_sfo_v AS SELECT * FROM sfo."Returns";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW revocations_sfo_v AS SELECT * FROM sfo."Revocations";', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW setts_sfo_v AS SELECT * FROM sfo."Setts";', {
        type: Sequelize.QueryTypes.RAW
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query('DROP VIEW setts_sfo_v;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW revocations_sfo_v;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW returns_sfo_v;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW apply_others_sfo_v;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('DROP VIEW applications_sfo_v;', {
        type: Sequelize.QueryTypes.RAW
      });
    }
  };
} else {
  module.exports = {
    up: () => {
      return Promise.resolve();
    },
    down: () => {
      return Promise.resolve();
    }
  };
}
