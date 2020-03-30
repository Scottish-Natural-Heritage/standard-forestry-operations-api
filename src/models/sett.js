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
      SettTypeId: {
        type: Sequelize.INTEGER,
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
