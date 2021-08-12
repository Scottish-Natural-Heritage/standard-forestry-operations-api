import Sequelize from 'sequelize';
// eslint-disable-next-line unicorn/import-index, import/no-useless-path-segments
import database from '../../models/index.js';

const {Application, Returns, Sett, Revocation} = database;

/**
 * An object to perform 'persistence' operations on our application objects.
 */
const ApplicationController = {
  /**
   * Retrieve the specified application from the database.
   *
   * @param {number} id An existing application's ID.
   * @returns {Sequelize.Model} An existing application.
   */
  findOne: async (id) => {
    return Application.findByPk(id, {include: [Sett, Returns]});
  },

  /**
   * Retrieve all applications from the database.
   *
   * @returns  {Sequelize.Model} All existing applications.
   */
  findAll: async () => {
    return Application.findAll({include: Sett});
  },

  /**
   * Soft delete a application in the database.
   *
   * @param {number} id A possible ID of a application.
   * @param {object} cleanObject A new revocation object to be added to the database.
   * @returns {boolean} True if the record is deleted, otherwise false.
   */
  delete: async (id, cleanObject) => {
    try {
      await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        await Revocation.create(cleanObject, {transaction: t});
        await Application.destroy({where: {id}, transaction: t});
        return true;
      });
    } catch {
      return false;
    }
  }
};

export {ApplicationController as default};
