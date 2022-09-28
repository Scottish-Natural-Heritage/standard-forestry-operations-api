'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('SettPhotos', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      ReturnId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Returns',
          key: 'id'
        }
      },
      SettId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Setts',
          key: 'id'
        }
      },
      beforeObjConRef: {
        type: Sequelize.STRING,
        alowNull: true
      },
      afterObjConRef: {
        type: Sequelize.STRING,
        alowNull: true
      },
      beforeFileName: {
        type: Sequelize.STRING,
        alowNull: true
      },
      afterFileName: {
        type: Sequelize.STRING,
        alowNull: true
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

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable('SettPhotos');
  }
};
