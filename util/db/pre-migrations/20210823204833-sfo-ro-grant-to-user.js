'use strict';

// The pre-migrations only make sense when running inside the production docker
// environment. They are not required for the development SQLite DB.
if (process.env.NODE_ENV === 'production') {
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query('grant connect on database licensing to rosfo;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('grant usage on schema sfo to rosfo;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('grant select on all tables in schema sfo to rosfo;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query(
        'alter default privileges for role licensing, sfo in schema sfo grant select on tables to rosfo;',
        {
          type: Sequelize.QueryTypes.RAW
        }
      );
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query(
        'alter default privileges for role licensing, sfo in schema sfo revoke select on tables to rosfo;',
        {
          type: Sequelize.QueryTypes.RAW
        }
      );

      await queryInterface.sequelize.query('revoke select on schema sfo from rosfo;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('revoke usage on schema sfo from rosfo;', {
        type: Sequelize.QueryTypes.RAW
      });

      await queryInterface.sequelize.query('revoke all on database licensing from rosfo;', {
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
