'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build a SettPhotos model.
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} A sett photos model.
 */
const SettPhotosModel = (sequelize) => {
  class SettPhotos extends Model {}

  SettPhotos.init(
    {
      ReturnId: {
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: true
        }
      },
      SettId: {
        type: Sequelize.INTEGER,
        validate: {
          notEmpty: true
        }
      },
      beforeObjConRef: {
        type: Sequelize.STRING
      },
      afterObjConRef: {
        type: Sequelize.STRING
      },
      beforeFileName: {
        type: Sequelize.STRING
      },
      afterFileName: {
        type: Sequelize.STRING
      }
    },
    {
      sequelize,
      modelName: 'SettPhotos',
      timestamps: true,
      paranoid: true
    }
  );

  return SettPhotos;
};

export {SettPhotosModel as default};
