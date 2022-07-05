'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the SettTypes meta-table
    await queryInterface.createTable('SettTypes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });

    // Fill the SettTypes meta-table
    await queryInterface.bulkInsert('SettTypes', [
      {
        id: 1,
        name: 'Main Sett',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Outlying Sett',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Annex Sett',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Subsidiary Sett',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('SettTypes', {}, {truncate: true});
    await queryInterface.dropTable('SettTypes');
  }
};
