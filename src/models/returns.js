'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build a Returns model.
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} A returns model.
 */
const ReturnsModel = (sequelize) => {
  class Returns extends Model {}

  Returns.init(
    {
      ApplicationId: {
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: true
        }
      },
      startDate: {
        type: Sequelize.DATE,
        validate: {
          notEmpty: true
        }
      },
      endDate: {
        type: Sequelize.DATE,
        validate: {
          notEmpty: true
        }
      },
      usedLicence: {
        type: Sequelize.BOOLEAN
      },
      compliance: {
        type: Sequelize.BOOLEAN
      },
      complianceDetails: {
        type: Sequelize.TEXT
      },
      confirmedDeclaration: {
        type: Sequelize.BOOLEAN
      },
      createdByLicensingOfficer: {
        type: Sequelize.STRING
      }
    },
    {
      sequelize,
      modelName: 'Returns',
      timestamps: true,
      paranoid: true
    }
  );

  return Returns;
};

export {ReturnsModel as default};
