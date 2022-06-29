'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the Setts table
    await queryInterface.createTable('Setts', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },

      ApplicationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Applications',
          key: 'id'
        }
      },
      sett: {
        type: Sequelize.STRING
      },
      SettTypeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'SettTypes',
          key: 'id'
        }
      },
      gridRef: {
        type: Sequelize.STRING
      },
      entrances: {
        type: Sequelize.INTEGER
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Setts');
  }
};
