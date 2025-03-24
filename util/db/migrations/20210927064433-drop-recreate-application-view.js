'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW sfo_applications;', {
      type: Sequelize.QueryTypes.RAW
    });

    await queryInterface.sequelize.query('CREATE VIEW sfo_applications AS SELECT * FROM sfo."Applications";', {
      type: Sequelize.QueryTypes.RAW
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP VIEW sfo_applications;', {
      type: Sequelize.QueryTypes.RAW
    });

    await queryInterface.sequelize.query('CREATE VIEW sfo_applications AS SELECT * FROM sfo."Applications";', {
      type: Sequelize.QueryTypes.RAW
    });
  }
};
