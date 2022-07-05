import database from '../../models/index.js';

const {Note} = database;

const NoteController = {
  /**
   * The create function writes the incoming Note to the appropriate database tables.
   *
   * @param {any } applicationId The application that the Note will be based on.
   * @param {any | undefined} incomingNote The Note details.
   * @returns {any} Returns newNote, the newly created Note.
   */
  // eslint-disable-next-line unicorn/prevent-abbreviations
  create: async (applicationId, incomingNote) => {
    let newNote;
    // Start a transaction.
    await database.sequelize.transaction(async (t) => {
      incomingNote.ApplicationId = applicationId;

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
  findOne: async (id) => {
    return Note.findByPk(id);
  },

  findAll: async () => {
    return Note.findAll();
  },

  findAllApplicationNotes: async (id) => {
    return Note.findAll({where: {ApplicationId: id}});
  }
};

export {NoteController as default};
