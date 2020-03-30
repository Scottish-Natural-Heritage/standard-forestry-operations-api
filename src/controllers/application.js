// eslint-disable-next-line unicorn/import-index, import/no-useless-path-segments
import database from '../models/index.js';
import Sequelize from 'sequelize';

const {Application, Sett, SettType} = database;

/**
 * Attempt to create an empty, randomly allocated application.
 *
 * Generates a random number and attempts to create an empty record in the
 * database with that ID. If it fails because another record already exists,
 * then it returns undefined. If any errors occur, it bubbles them back to the
 * calling code.
 *
 * @returns {Sequelize.Model | undefined} A new empty model is successful,
 * otherwise undefined.
 */
const tryCreate = async () => {
  try {
    // Generate a random 5 digit number and attempt to create a new record with
    // that ID.
    const newApp = await Application.create({id: Math.floor(Math.random() * 99999)});

    // X.create only ever returns if it's successful, so we can just return our
    // new model.
    return newApp;
  } catch (error) {
    // There are two possible error conditions here...

    // The first is if we try to create a duplicate ID, which we manually check
    // for and return undefined as an indicator.
    if (error instanceof Sequelize.UniqueConstraintError) {
      return undefined;
    }

    // The second error condition is 'anything else' i.e. a proper DB error. In
    // that case, just throw it up to the calling code.
    throw error;
  }
};

/**
 * An object to perform 'persistence' operations on our application objects.
 */
const ApplicationController = {
  /**
   * Create a new randomly allocated application.
   *
   * Takes up to 10 attempts to create a new empty application. If it fails, it throws.
   *
   * @returns {Sequelize.Model} The new application.
   */
  create: async () => {
    let newApp;
    let remainingAttempts = 10;
    // Loop until we have a new empty application or we run out of attempts,
    // whichever happens first.
    while (newApp === undefined && remainingAttempts > 0) {
      newApp = await tryCreate(); // eslint-disable-line no-await-in-loop
      remainingAttempts--;
    }

    // If we run out of attempts let the calling code know by raising an error.
    if (newApp === undefined) {
      throw new Error('Unable to generate new application number.');
    }

    // On success, return the new application.
    return newApp;
  },

  /**
   * Retrieve the specified application from the database.
   *
   * @param {number} id An existing application's ID.
   * @returns {Sequelize.Model} An existing application.
   */
  findOne: async (id) => {
    return Application.findByPk(id, {include: [{model: Sett, include: SettType}]});
  },

  /**
   * Replace an application in the database with our new JSON model.
   *
   * @param {number} id An existing application's ID.
   * @param {any} jsonApp A JSON version of the model to replace the database's copy.
   * @returns {Sequelize.Model} The updated application.
   */
  update: async (id, jsonApp) => {
    // Grab the already existing object from the database.
    const existingApp = await Application.findByPk(id);

    // It doesn't exist, you say?
    if (existingApp === undefined) {
      // Tell the caller.
      return undefined;
    }

    // Split the incoming json blob in to each object to be persisted.
    const {setts, ...app} = jsonApp;

    // Update the application object with the new fields.
    const updatedApp = await existingApp.update(app);

    // Loop over the array of setts we've received and map them into an array
    // of promises and then resolve them all so that they...
    await Promise.all(
      setts.map(async (jsonSett) => {
        // Create the new sett object.
        const sett = await Sett.create({
          sett: jsonSett.id,
          gridRef: jsonSett.gridReference,
          entrances: jsonSett.entrances
        });

        // Find the right sett type object...
        const settType = await SettType.findByPk(jsonSett.type);
        // ...and associate it.
        await sett.setSettType(settType);

        // Associate the sett to the application.
        await sett.setApplication(updatedApp);
      })
    );

    // Fetch the now fully updated application object and return it
    return Application.findByPk(id, {include: [{model: Sett, include: SettType}]});
  }
};

export {ApplicationController as default};
