'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build an apply-on-behalf-of-others-email-notification model.
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} An apply-on-behalf-of-others-email-notification
 * model.
 */
const ApplyOtherModel = (sequelize) => {
  class ApplyOther extends Model {}

  ApplyOther.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      emailAddress: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true,
          isEmail: true
        }
      }
    },
    {
      sequelize,
      modelName: 'ApplyOther',
      timestamps: true,
      paranoid: true
    }
  );

  return ApplyOther;
};

export {ApplyOtherModel as default};
