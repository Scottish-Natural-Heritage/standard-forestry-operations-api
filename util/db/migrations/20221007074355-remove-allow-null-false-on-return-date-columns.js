'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.changeColumn('Returns', 'startDate', {
      allowNull: true
    });

    await queryInterface.changeColumn('Returns', 'endDate', {
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.changeColumn('Returns', 'endDate', {
      allowNull: false
    });

    await queryInterface.changeColumn('Returns', 'startDate', {
      allowNull: false
    });
  }
};
