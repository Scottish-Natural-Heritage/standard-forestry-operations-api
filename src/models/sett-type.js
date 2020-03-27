'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

const SettTypeModel = (sequelize) => {
  class SettType extends Model {}

  SettType.init(
    {
      name: {
        type: Sequelize.STRING,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      sequelize,
      modelName: 'SettType',
      timestamps: true,
      paranoid: true
    }
  );

  return SettType;
};

export {SettTypeModel as default};
