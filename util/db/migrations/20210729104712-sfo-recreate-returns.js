'use strict';
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable('Returns', {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },
      ApplicationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'id'
        }
      },
      beforeObjectiveRef: {
        type: Sequelize.STRING,
        allowNull: false
      },
      afterObjectiveRef: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fromDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      toDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdByLicensingOfficer: {
        type: Sequelize.STRING,
        allowNull: true
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
  down(queryInterface) {
    return queryInterface.dropTable('Returns');
  }
};
