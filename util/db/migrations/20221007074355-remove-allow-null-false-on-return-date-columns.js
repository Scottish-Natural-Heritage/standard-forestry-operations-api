'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Returns', 'startDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.changeColumn('Returns', 'endDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Returns', 'endDate', {
      type: Sequelize.DATE,
      allowNull: false
    });

    await queryInterface.changeColumn('Returns', 'startDate', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};
