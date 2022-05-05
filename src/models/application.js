/* eslint-disable unicorn/prevent-abbreviations */
'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build an Application model.
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} An Application model.
 */
const ApplicationModel = (sequelize) => {
  class Application extends Model {}

  Application.init(
    {
      convictions: {
        type: Sequelize.BOOLEAN
      },
      complyWithTerms: {
        type: Sequelize.BOOLEAN
      },
      fullName: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      companyOrganisation: {
        type: Sequelize.STRING
      },
      addressLine1: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      addressLine2: {
        type: Sequelize.STRING
      },
      addressTown: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      addressCounty: {
        type: Sequelize.STRING
      },
      addressPostcode: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      phoneNumber: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      emailAddress: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true,
          isEmail: true
        }
      },
      createdByLicensingOfficer: {
        type: Sequelize.STRING
      },
      expiryDate: {
        type: Sequelize.DATE
      },
      uprn: {
        type: Sequelize.STRING
      }
    },
    {
      sequelize,
      modelName: 'Application',
      timestamps: true,
      paranoid: true
    }
  );

  return Application;
};

export {ApplicationModel as default};
