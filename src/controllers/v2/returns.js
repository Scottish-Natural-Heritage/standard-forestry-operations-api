import NotifyClient from 'notifications-node-client';
import database from '../../models/index.js';
import config from '../../config/app.js';
import jsonConsoleLogger, {unErrorJson} from '../../json-console-logger.js';

const {Application, Returns, SettPhotos} = database;

// Create a more user friendly displayable date from a date object, format (dd/mm/yyy).
const createDisplayDate = (date) => {
  return date.toLocaleDateString('en-GB', {year: 'numeric', month: 'numeric', day: 'numeric'});
};

/**
 * Creates a single string of details of the uploaded sett photographs for display
 * in the Notify email.
 *
 * @param {any} uploadDetails The filenames of the uploaded files.
 * @param {string[]} settNames The names of the setts associated with the photographs.
 * @returns {string} The string to use in the Notify email.
 */
const createDisplayablePhotoDetails = (uploadDetails, settNames) => {
  const photoDetails = [];

  for (let index = 0; index < settNames.length; index += 2) {
    const settDetails = `${settNames[index]}: Before Image - ${uploadDetails[index].fileName} - After Image - ${
      uploadDetails[index + 1].fileName
    }`;

    photoDetails.push(settDetails);
  }

  return photoDetails.join('\n');
};

/**
 * Sends the details of the return to the Notify API, asking it to send off an email.
 * The email sent is the one used if the licence holder used the licence.
 *
 * @param {string} notifyApiKey
 * @param {any} application
 * @param {any} newReturn
 * @param {string[]} settNames
 * @param {any} uploadDetails
 * @param {string} emailAddress
 */
const sendReturnEmailUsedLicence = async (
  notifyApiKey,
  // eslint-disable-next-line unicorn/prevent-abbreviations
  application,
  newReturn,
  settNames,
  uploadDetails,
  emailAddress
) => {
  if (notifyApiKey) {
    try {
      const notifyClient = new NotifyClient.NotifyClient(notifyApiKey);

      await notifyClient.sendEmail('0147bd8f-8f8e-4272-9f62-a2228289db1c', emailAddress, {
        personalisation: {
          id: application.id,
          fullName: application.fullName,
          startDate: createDisplayDate(new Date(newReturn.startDate)),
          endDate: createDisplayDate(new Date(newReturn.endDate)),
          compliance: newReturn.compliance ? 'Yes' : 'No',
          moreDetails: newReturn.complianceDetails
            ? newReturn.complianceDetails
            : 'No additional compliance details provided.',
          photosDetails: createDisplayablePhotoDetails(uploadDetails, settNames)
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
 * Sends the details of the return to the Notify API, asking it to send off an email.
 * The email sent is the one used if the licence holder did not use the licence.
 *
 * @param {string} notifyApiKey
 * @param {any} application
 * @param {string} emailAddress
 */
// eslint-disable-next-line unicorn/prevent-abbreviations
const sendReturnEmailNotUsedLicence = async (notifyApiKey, application, emailAddress) => {
  if (notifyApiKey) {
    try {
      const notifyClient = new NotifyClient.NotifyClient(notifyApiKey);

      await notifyClient.sendEmail('db12bfaa-05aa-43f3-b6d1-eabb48c60b84', emailAddress, {
        personalisation: {
          id: application.id,
          fullName: application.fullName
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
 * An object to perform 'persistence' operations on our Return objects.
 */
const ReturnsController = {
  /**
   * Create a new randomly allocated Return wrapped in a database transaction.
   *
   * Transaction completes all requests and returns the new return transaction id.
   *
   * @param {number | undefined} id An existing application/license ID.
   * @param {any} cleanObject A new return object to be added to the database.
   * @param {string[]} settIds The IDs of the setts the return applies to.
   * @param {any} uploadUUIDs The IDs of the uploaded images, returned by Objective Connect.
   * @param {string[]} settNames The names of the setts to which the return applies.
   * @param {any} application The licence application details.
   * @returns {number} The newly created returns id.
   */
  // eslint-disable-next-line unicorn/prevent-abbreviations
  async create(id, cleanObject, settIds, uploadUUIDs, settNames, application) {
    try {
      const newReturnTransaction = await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newReturn = await Returns.create(cleanObject, {transaction: t});

        // We need a separate index for the uploaded UUIDs.
        let uploadUUIDsIndex = 0;

        // Loop through the settId and uploadUUID arrays and create the entries in the SettPhotos table.
        // Disabling as it's easier to read as an indexed loop.
        // eslint-disable-next-line unicorn/no-for-loop
        for (let index = 0; index < settIds.length; index++) {
          const settPhotos = {
            ReturnId: newReturn.id,
            SettId: Number(settIds[index]),
            beforeObjConRef: uploadUUIDs[uploadUUIDsIndex].uuid,
            beforeFileName: uploadUUIDs[uploadUUIDsIndex].fileName,
            afterObjConRef: uploadUUIDs[uploadUUIDsIndex + 1].uuid,
            afterFileName: uploadUUIDs[uploadUUIDsIndex + 1].fileName
          };

          // Disabling as this await needs to be inside this loop.
          // eslint-disable-next-line no-await-in-loop
          const newSettPhotosId = await SettPhotos.create(settPhotos, {transaction: t});

          // If something went wrong return undefined.
          if (newSettPhotosId === undefined) {
            return undefined;
          }

          uploadUUIDsIndex += 2;
        }

        // Send out the success email, checking if they used the licence or not.
        if (cleanObject.usedLicence) {
          await sendReturnEmailUsedLicence(
            config.notifyApiKey,
            application,
            cleanObject,
            settNames,
            uploadUUIDs,
            application.emailAddress
          );
          await sendReturnEmailUsedLicence(
            config.notifyApiKey,
            application,
            cleanObject,
            settNames,
            uploadUUIDs,
            'issuedlicence@nature.scot'
          );
        } else {
          await sendReturnEmailNotUsedLicence(config.notifyApiKey, application, application.emailAddress);
          await sendReturnEmailNotUsedLicence(config.notifyApiKey, application, 'issuedlicence@nature.scot');
        }

        // Return the newly created return object.
        return newReturn;
      });

      return newReturnTransaction.id;
    } catch {
      return undefined;
    }
  },

  /**
   * Create a new randomly allocated Return wrapped in a database transaction,
   * for a return on a licence that was not used.
   *
   * Transaction completes all requests and returns the new return transaction id.
   *
   * @param {number | undefined} id An existing application/license ID.
   * @param {any} cleanObject A new return object to be added to the database.
   * @returns {number} The newly created returns id.
   */
  async createLicenceNotUsed(id, cleanObject) {
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
