'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Returns', {
      id: {
        allowNull: false,
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
      beforeObjectiveRef: {
        type: Sequelize.STRING
      },
      afterObjectiveRef: {
        type: Sequelize.STRING
      },
      fromDate: {
        type: Sequelize.DATE
      },
      toDate: {
        type: Sequelize.DATE
      },
      comment: {
        type: Sequelize.TEXT
      },
      createdByLicensingOfficer: {
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
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Returns');
  }
};
