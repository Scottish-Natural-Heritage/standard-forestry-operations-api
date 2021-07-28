import Sequelize from 'sequelize';
// eslint-disable-next-line unicorn/import-index, import/no-useless-path-segments
import database from '../models/index.js';

const {Sett} = database;

const SettController = {
  /**
   * Retrieve the specified sett from the database.
   *
   * @param {number} id An existing sett's ID.
   * @returns {Sequelize.Model} An existing sett.
   */
  findOne: async (id) => {
    return Sett.findByPk(id);
  },

  /**
   * Retrieve all setts from the database.
   *
   * @returns  {Sequelize.Model} All existing setts.
   */
  findAll: async () => {
    return Sett.findAll();
  }
};

export {SettController as default};
