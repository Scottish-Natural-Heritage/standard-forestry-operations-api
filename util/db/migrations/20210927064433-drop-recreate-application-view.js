'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query('DROP VIEW sfo_applications;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_applications AS SELECT * FROM sfo."Applications";', {
        type: Sequelize.QueryTypes.RAW
      });
    },

    down: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query('DROP VIEW sfo_applications;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('CREATE VIEW sfo_applications AS SELECT * FROM sfo."Applications";', {
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
