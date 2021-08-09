'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

const SettModel = (sequelize) => {
  class Sett extends Model {}

  Sett.init(
    {
      ApplicationId: {
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: true
        }
      },
      sett: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      gridRef: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
      entrances: {
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: true
        }
      },
      createdByLicensingOfficer: {
        type: Sequelize.STRING
      }
    },
    {
      sequelize,
      modelName: 'Sett',
      timestamps: true,
      paranoid: true
    }
  );

  return Sett;
};

export {SettModel as default};
