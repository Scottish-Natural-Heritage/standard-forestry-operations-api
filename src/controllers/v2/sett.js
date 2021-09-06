import database from '../../models/index.js';

const {Sett, Application} = database;

const SettController = {
  /**
   * Create a new randomly allocated Sett wrapped in a database transaction.
   *
   * Transaction completes all requests and returns the new Sett id.
   *
   * @param {number | undefined} id An existing application/license ID.
   * @param {any} cleanObject A new Sett object to be added to the database.
   * @returns {number} The newly created sett id.
   */
  create: async (id, cleanObject) => {
    try {
      const newSettTransaction = await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newSett = await Sett.create(cleanObject, {transaction: t});
        return newSett;
      });
      return newSettTransaction.id;
    } catch {
      return undefined;
    }
  },

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
