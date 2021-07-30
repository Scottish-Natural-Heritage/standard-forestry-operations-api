'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build an Return model..
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} A returns model
 * model.
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
