import database from '../../models/index.js';

const {SettPhotos, Return} = database;

const SettPhotosController = {
  /**
   * Create a new SettPhotos instance wrapped in a DB transaction.
   * Transaction completes all requests and returns the new SettPhoto transaction id.
   *
   * @param {number | undefined} id An existing return ID.
   * @param {any} cleanObject A new SettPhoto object to be added to the database.
   * @returns {number} The newly created SettPhoto id.
   */
  async create(id, cleanObject) {
    try {
      const newSettPhotoTransaction = await database.sequelize.transaction(async (t) => {
        await Return.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newSettPhotos = await SettPhotos.create(cleanObject, {transaction: t});
        return newSettPhotos;
      });
      return newSettPhotoTransaction.id;
    } catch {
      return undefined;
    }
  },

  /**
   * Retrieve the SettPhotos from the database.
   *
   * @param {number} id An existing SettPhoto's ID.
   * @returns {Sequelize.Model} An existing SettPhotos model.
   */
  async findOne(id) {
    return SettPhotos.findByPk(id);
  },

  /**
   * Retrieve all SettPhotos from the database.
   *
   * @returns  {Sequelize.Model} All existing SettPhotos models.
   */
  async findAll() {
    return SettPhotos.findAll();
  },

  /**
   * Retrieve all SettPhotos for a given return from the database.
   *
   * @param {number} id
   * @returns
   */
  async findAllSettPhotosForReturn(id) {
    return SettPhotos.findAll({where: {ReturnId: id}});
  }
};

export {SettPhotosController as default};
