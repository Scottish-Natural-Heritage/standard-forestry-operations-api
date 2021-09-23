import utils from 'naturescot-utils';
import database from '../../models/index.js';

const {Application, Returns, Sett, Revocation} = database;

/**
 * Clean an incoming PATCH request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} body The incoming request's body.
 * @returns {any} CleanedBody a json object that's just got our cleaned up fields on it.
 */
const cleanPatchInput = (body) => {
  const cleanedBody = {};

  // Check for the existence of each field and if found clean it if required and add to the cleanedBody object.
  if (body.fullName) {
    cleanedBody.fullName = body.fullName.trim();
  }

  if (body.companyOrganisation) {
    cleanedBody.companyOrganisation = body.companyOrganisation.trim();
  }

  if (body.emailAddress) {
    cleanedBody.emailAddress = utils.recipients.validateAndFormatEmailAddress(body.emailAddress);
  }

  if (body.addressLine1) {
    cleanedBody.addressLine1 = body.addressLine1.trim();
  }

  if (body.addressLine2) {
    cleanedBody.addressLine2 = body.addressLine2.trim();
  }

  if (body.addressTown) {
    cleanedBody.addressTown = body.addressTown.trim();
  }

  if (body.addressCounty) {
    cleanedBody.addressCounty = body.addressCounty.trim();
  }

  if (body.addressPostcode) {
    cleanedBody.addressPostcode = utils.postalAddress.formatPostcodeForPrinting(body.addressPostcode);
    if (!utils.postalAddress.isaRealUkPostcode(cleanedBody.addressPostcode)) {
      throw new Error('Invalid postcode.');
    }
  }

  if (body.phoneNumber) {
    cleanedBody.phoneNumber = body.phoneNumber.trim();
  }

  if (body.convictions) {
    cleanedBody.convictions = body.convictions;
  }

  if (body.createdByLicensingOfficer) {
    cleanedBody.createdByLicensingOfficer = body.createdByLicensingOfficer();
  }

  return cleanedBody;
};

/**
 * An object to perform 'persistence' operations on our application objects.
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
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
   * Create a new randomly allocated Application wrapped in a database transaction.
   *
   * Transaction completes all requests and returns the new Application id.
   *
   * @param {any} cleanObject A new Application object to be added to the database.
   * @returns {number} The newly created Application id.
   */
  create: async (cleanObject) => {
    // Take the cleanObject that has been passed in and split the application and
    // the setts into 2 separate variables.
    const {setts, ...app} = cleanObject;

    let newApp;
    let remainingAttempts = 10;
    // Loop until we have a suitable random ID for a new application or we run out of attempts,
    // whichever happens first.
    while (newApp === undefined && remainingAttempts > 0) {
      try {
        // Generate a random 5 digit ID
        const appId = Math.floor(Math.random() * 99_999);
        // Begin the database transaction.
        // eslint-disable-next-line no-await-in-loop
        await database.sequelize.transaction(async (t) => {
          // See if you can find an application in the database with the random 5 digit ID
          newApp = await Application.findByPk(appId, {transaction: t});
          // If we did not find one then we need to set the id of our new application in the app variable with the
          // random 5 digit ID and then create a new application.
          if (newApp === null) {
            app.id = appId;
            newApp = await Application.create(app, {transaction: t});

            // After creating the new application we need to create the setts that are associated with the application.
            // Because there can be many setts that come in with the application we use promise all which basically sends off
            // all the setts that need to be created and assuming they all create successfully then we can carry on however if
            // any of them fail to create then the database transaction will roll back any changes it has made.
            await Promise.all(
              setts.map(async (jsonSett) => {
                await Sett.create(
                  {
                    ApplicationId: app.id,
                    sett: jsonSett.id,
                    gridRef: jsonSett.gridReference,
                    entrances: jsonSett.entrances,
                    createdByLicensingOfficer: jsonSett.createdByLicensingOfficer
                  },
                  {transaction: t}
                );
              })
            );
          } else {
            // Else if we found one then we need to set newApp to undefined as it cant be used
            // (this will also meets the conditions of our while loop).
            newApp = undefined;
          }
        });
        // We did not manage to find a suitable ID for the new application so we decrement
        // the number of attempts left in the while loop.
        remainingAttempts--;
      } catch {
        // If the try failed then we need to set newApp to undefined as we were unable to create a new application
        // (this will also meets the conditions of our while loop).
        newApp = undefined;
      }
    }

    // If we run out of attempts or we were unable to create a new application then we need to let the
    // calling code know by raising an error.
    if (newApp === undefined) {
      throw new Error('Unable to create new application.');
    }

    // On success, return the new application's ID.
    return newApp.id;
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
      // Start the transaction.
      await database.sequelize.transaction(async (t) => {
        // Check the application/license exists.
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        // Create the revocation entry.
        await Revocation.create(cleanObject, {transaction: t});
        // Soft Delete any setts attached to the application/license.
        await Sett.destroy({where: {ApplicationId: id}, transaction: t});
        // Soft Delete any returns attached to the application/license.
        await Returns.destroy({where: {ApplicationId: id}, transaction: t});
        // Soft Delete the Application/License.
        await Application.destroy({where: {id}, transaction: t});
        // If everything worked then return true.
        return true;
      });
    } catch {
      // If something went wrong during the transaction return false.
      return false;
    }
  },

  /**
   * Update a application in the database with partial JSON model.
   *
   * @param {number} id An existing application's ID.
   * @param {any} application A JSON version of the model containing only the fields to be updated.
   * @returns {boolean} True if the record is updated, otherwise false.
   */
  // eslint-disable-next-line unicorn/prevent-abbreviations
  update: async (id, application) => {
    // Save the new values to the database.
    const result = await Application.update(application, {where: {id}});

    // Check to make sure the saving process went OK.
    const success = result.length > 0 && result[0] === 1;
    if (success) {
      // Return JSON with the updated fields on successful update.
      return application;
    }

    // If something went wrong, return undefined to signify this.
    return undefined;
  }
};

export {ApplicationController as default, cleanPatchInput};
