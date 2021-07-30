// eslint-disable-next-line unicorn/import-index, import/no-useless-path-segments
import database from '../models/index.js';
const {Application, Returns} = database;

/**
 * An object to perform 'persistence' operations on our Return objects.
 */
const ReturnsController = {
  /**
   * Create a new randomly allocated Return wrapped in a database transaction.
   *
   * Transaction completes all requests and returns the new return transaction id.
   *
   * @param {number} id An existing return's ID.
   * @param {any} cleanObject A new revocation object to be added to the database.
   * @returns {number} The new Return transaction id.
   */
  create: async (id, cleanObject) => {
    try {
      const newReturnTransaction = await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newReturn = await Returns.create(cleanObject, {transaction: t});
        return newReturn;
      });
      return newReturnTransaction.id;
    } catch {
      return undefined;
    }
  }
};

export {ReturnsController as default};
