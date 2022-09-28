'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
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
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      usedLicence: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      compliance: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      complianceDetails: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      confirmedDeclaration: {
        type: Sequelize.BOOLEAN,
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

  async down (queryInterface, Sequelize) {
    return queryInterface.dropTable('Returns');
  }
};
