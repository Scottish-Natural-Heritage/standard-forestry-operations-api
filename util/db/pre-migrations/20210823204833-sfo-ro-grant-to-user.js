'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('grant connect on database licensing to rosfo;', {
      type: Sequelize.QueryTypes.RAW
    });

    await queryInterface.sequelize.query('grant usage on schema sfo to rosfo;', {
      type: Sequelize.QueryTypes.RAW
    });

    await queryInterface.sequelize.query('grant select on all tables in schema sfo to rosfo;', {
      type: Sequelize.QueryTypes.RAW
    });

    await queryInterface.sequelize.query('grant sfo to licensing;', {
      type: Sequelize.QueryTypes.RAW
    });

    await queryInterface.sequelize.query(
      'alter default privileges for role licensing, sfo in schema sfo grant select on tables to rosfo;',
      {
        type: Sequelize.QueryTypes.RAW
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'alter default privileges for role licensing, sfo in schema sfo revoke select on tables to rosfo;',
      {
        type: Sequelize.QueryTypes.RAW
      }
    );

    await queryInterface.sequelize.query('revoke sfo from licensing;', {
      type: Sequelize.QueryTypes.RAW
    });

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
