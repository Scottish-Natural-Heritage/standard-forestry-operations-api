'use strict';

import Sequelize from 'sequelize';

const {Model} = Sequelize;

/**
 * Build a Note model.
 *
 * @param {Sequelize.Sequelize} sequelize A Sequelize connection.
 * @returns {Sequelize.Model} An Note model.
 */
const NoteModel = (sequelize) => {
  class Note extends Model {}

  Note.init(
    {
      note: {
        type: Sequelize.TEXT
      },
      createdBy: {
        type: Sequelize.STRING
      }
    },
    {
      sequelize,
      modelName: 'Note',
      timestamps: true,
      paranoid: true
    }
  );

  return Note;
};

export {NoteModel as default};
