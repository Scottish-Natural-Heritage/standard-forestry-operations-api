'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build an OldReturns model..
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} An old returns model.
 */
const OldReturnsModel = (sequelize) => {
  class OldReturns extends Model {}

  OldReturns.init(
    {
      ApplicationId: {
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: true
        }
      },
      beforeObjectiveRef: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      afterObjectiveRef: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      fromDate: {
        type: Sequelize.DATE,
        validate: {
          notEmpty: true
        }
      },
      toDate: {
        type: Sequelize.DATE,
        validate: {
          notEmpty: true
        }
      },
      comment: {
        type: Sequelize.TEXT
      },
      createdByLicensingOfficer: {
        type: Sequelize.STRING
      }
    },
    {
      sequelize,
      modelName: 'OldReturns',
      timestamps: true,
      paranoid: true
    }
  );

  return OldReturns;
};

export {OldReturnsModel as default};
