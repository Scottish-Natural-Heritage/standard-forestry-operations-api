import database from '../../models/index.js';

const {Note} = database;

const NoteController = {
  /**
   * The create function writes the incoming Note to the appropriate database tables.
   *
   * @param {any } appId The application that the Note will be based on.
   * @param {any | undefined} incomingNote The Note details.
   * @returns {any} Returns newNote, the newly created Note.
   */
  // prettier-ignore
  async create (appId, incomingNote) {
    let newNote;
    // Start a transaction.
    await database.sequelize.transaction(async (t) => {
      incomingNote.ApplicationId = appId;

      // Add the Note to the DB.
      newNote = await Note.create(incomingNote, {transaction: t});
    });

    // If all went well and we have a new application return it.
    if (newNote) {
      return newNote;
    }

    // If no new application was added to the DB return undefined.
    return undefined;
  },

  /**
   * Retrieve the notes from the database.
   *
   * @param {number} id An existing sett's ID.
   * @returns {Sequelize.Model} An existing sett.
   */
  // prettier-ignore
  async findOne (id) {
    return Note.findByPk(id);
  },

  // prettier-ignore
  async findAll () {
    return Note.findAll();
  },

  // prettier-ignore
  async findAllApplicationNotes (id) {
    return Note.findAll({where: {ApplicationId: id}});
  }
};

export {NoteController as default};
