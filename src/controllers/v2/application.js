import utils from 'naturescot-utils';
import NotifyClient from 'notifications-node-client';
import database from '../../models/index.js';
import config from '../../config/app.js';
import jsonConsoleLogger, {unErrorJson} from '../../json-console-logger.js';

const {Application, Returns, Sett, Revocation} = database;

// Disabling as linter wants us to use "app" instead of "application".
/* eslint-disable  unicorn/prevent-abbreviations */

/**
 * This function returns a summary address built from the address fields of an application object.
 *
 * @param {any} application The application to use to build the summary address from.
 * @returns {string} Returns a string containing the summary address.
 */
const createSummaryAddress = (application) => {
  const address = [];
  address.push(application.addressLine1.trim());
  // As addressLine2 is optional we need to check if it exists.
  if (application.addressLine2) {
    address.push(application.addressLine2.trim());
  }

  address.push(application.addressTown.trim(), application.addressCounty.trim(), application.addressPostcode.trim());

  return address.join(', ');
};

/**
 * Creates a string with a formatted list of the sett details, used by the Notify API in email creation.
 *
 * @param {any} setts The array of setts to use to create the formatted string.
 * @returns {string} Returns a formatted string of all setts to which the application pertains.
 */
const createDisplayableSetts = (setts) => {
  const settList = [];

  for (const sett of setts) {
    const badgerHouse = `* Sett: ${sett.id}, at grid reference ${sett.gridReference}, with ${sett.entrances} entrances`;
    settList.push(badgerHouse);
  }

  return settList.join('\n');
};

/**
 * Creates a string with a formatted list of the sett details, used by the Notify API in email creation
 * when resending a licence.
 *
 * @param {any} setts The array of setts to use to create the formatted string.
 * @returns {string} Returns a formatted string of all setts to which the application pertains.
 */
const createSettsFromApplication = (setts) => {
  const settList = [];

  for (const sett of setts) {
    const badgerHouse = `* Sett: ${sett.sett}, at grid reference ${sett.gridRef}, with ${sett.entrances} entrances`;
    settList.push(badgerHouse);
  }

  return settList.join('\n');
};

/**
 * Send emails to the applicant to let them know it was successful.
 *
 * @param {string} notifyApiKey API key for sending emails.
 * @param {any} application An enhanced JSON version of the model.
 */
const sendSuccessEmail = async (notifyApiKey, application, emailAddress) => {
  if (notifyApiKey) {
    try {
      const notifyClient = new NotifyClient.NotifyClient(notifyApiKey);

      const currentYear = new Date().getFullYear();

      let startDate;
      let endDate;

      // Calculate the start and end dates.
      if (new Date(application.createdAt).getMonth() + 1 < 7) {
        startDate = `01/07/${currentYear}`;
        endDate = `30/11/${currentYear}`;
      } else if (new Date(application.createdAt).getMonth() + 1 < 12) {
        startDate = new Date(application.createdAt).toLocaleDateString('en-GB');
        endDate = `30/11/${currentYear}`;
      } else {
        startDate = `01/07/${new Date().getFullYear() + 1}`;
        endDate = `30/11/${new Date().getFullYear() + 1}`;
      }

      // Send the email via notify.
      await notifyClient.sendEmail('09ba502f-c4fe-4c69-948f-dbe1fc42ecf0', emailAddress, {
        personalisation: {
          licenceNo: application.id,
          validFrom: startDate,
          expiryDate: endDate,
          fullName: application.fullName,
          lhAddress: createSummaryAddress(application),
          setts: createDisplayableSetts(application.setts)
        },
        reference: `NS-SFO-${application.id}`,
        emailReplyToId: '4b49467e-2a35-4713-9d92-809c55bf1cdd'
      });
    } catch (error) {
      jsonConsoleLogger.error(unErrorJson(error));
      throw error;
    }
  }
};

const resendLicenceEmail = async (notifyApiKey, application, emailAddress) => {
  if (notifyApiKey) {
    try {
      const notifyClient = new NotifyClient.NotifyClient(notifyApiKey);

      const currentYear = new Date(application.createdAt).getFullYear();

      let startDate;
      let endDate;

      // Calculate the start and end dates.
      if (new Date(application.createdAt).getMonth() + 1 < 7) {
        startDate = `01/07/${currentYear}`;
        endDate = `30/11/${currentYear}`;
      } else if (new Date(application.createdAt).getMonth() + 1 < 12) {
        startDate = new Date(application.createdAt).toLocaleDateString('en-GB');
        endDate = `30/11/${currentYear}`;
      } else {
        startDate = `01/07/${new Date(application.createdAt).getFullYear() + 1}`;
        endDate = `30/11/${new Date(application.createdAt).getFullYear() + 1}`;
      }

      // Send the email via notify.
      await notifyClient.sendEmail('09ba502f-c4fe-4c69-948f-dbe1fc42ecf0', emailAddress, {
        personalisation: {
          licenceNo: application.id,
          validFrom: startDate,
          expiryDate: endDate,
          fullName: application.fullName,
          lhAddress: createSummaryAddress(application),
          setts: createSettsFromApplication(application.Setts)
        },
        reference: `NS-SFO-${application.id}`,
        emailReplyToId: '4b49467e-2a35-4713-9d92-809c55bf1cdd'
      });
    } catch (error) {
      jsonConsoleLogger.error(unErrorJson(error));
      throw error;
    }
  }
};

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
const ApplicationController = {
  /**
   * Retrieve the specified application from the database.
   *
   * @param {number} id An existing application's ID.
   * @returns {Sequelize.Model} An existing application.
   */
  async findOne(id) {
    return Application.findByPk(id, {include: [Sett, Returns]});
  },

  /**
   * Retrieve all applications from the database.
   *
   * @returns  {Sequelize.Model} All existing applications.
   */
  async findAll() {
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
  async create(cleanObject) {
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

    // Add the application ID to the object used to create the email.
    cleanObject.id = newApp.id;

    // We also need the createdAt date to calculate the start and expiry dates.
    cleanObject.createdAt = newApp.createdAt;

    // Send the applicant their confirmation email.
    await sendSuccessEmail(config.notifyApiKey, cleanObject, cleanObject.emailAddress);

    // Send a copy of the licence to the licensing team too.
    await sendSuccessEmail(config.notifyApiKey, cleanObject, 'issuedlicence@nature.scot');

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
  async delete(id, cleanObject) {
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
  async update(id, application) {
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
  },

  /**
   *  Resend a licence to the applicant.
   *
   * @param {number} id The licence number of the licence to be resent.
   * @param {any} application The licence application details to use to recreate and resend the licence.
   * @returns {any} Returns the result of the attempted resend of licence.
   */
  async resend(id, application) {
    // Set the licence number of the licence application.
    application.id = id;

    // Resend the applicant their licence email.
    const result = await resendLicenceEmail(config.notifyApiKey, application, application.emailAddress);

    return result;
  }
};

/* eslint-enable unicorn/prevent-abbreviations */

export {ApplicationController as default, cleanPatchInput};
