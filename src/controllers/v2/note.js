import database from '../../models/index.js';

const {Note, Application} = database;

const NoteController = {
  /**
   * Create a new randomly allocated Note wrapped in a database transaction.
   *
   * Transaction completes all requests and returns the new Note transaction id.
   *
   * @param {number | undefined} id An existing application/license ID.
   * @param {any} cleanObject A new return object to be added to the database.
   * @returns {number} The newly created notes id.
   */
  async create(id, cleanObject) {
    try {
      const newNotesTransaction = await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newNotes = await Note.create(cleanObject, {transaction: t});
        return newNotes;
      });
      return newNotesTransaction.id;
    } catch {
      return undefined;
    }
  },

  /**
   * Retrieve the notes from the database.
   *
   * @param {number} id An existing note's ID.
   * @returns {Sequelize.Model} An existing note.
   */
  async findOne(id) {
    return Note.findByPk(id);
  },

  /**
   * Retrieve all notes from the database.
   *
   * @returns  {Sequelize.Model} All existing notes.
   */
  async findAll() {
    return Note.findAll();
  },

  async findAllApplicationNotes(id) {
    return Note.findAll({where: {ApplicationId: id}});
  }
};

export {NoteController as default};
