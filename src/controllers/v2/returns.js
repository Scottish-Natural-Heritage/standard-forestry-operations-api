import NotifyClient from 'notifications-node-client';
import database from '../../models/index.js';
import config from '../../config/app.js';
import jsonConsoleLogger, {unErrorJson} from '../../json-console-logger.js';

const {Application, Returns, SettPhotos} = database;

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
   * @param {any} submittedReturn A new return object to be added to the database.
   * @param {string[]} settIds The IDs of the setts the return applies to.
   * @param {any[]} uploadedFileData The IDs of the uploaded images, returned by Objective Connect.
   * @returns {number} The newly created return id.
   */
  async create(submittedReturn, settIds, uploadedFileData) {
    const newReturn = await database.sequelize.transaction(async (t) => {
      const newReturn = await Returns.create(submittedReturn, {transaction: t});

      // For each sett, create a SettPhotos object
      const settPhotoPromises = [];
      for (const settId of settIds) {
        const beforePhoto = uploadedFileData.find(
          (u) => u.appMetadata.settid === settId && u.appMetadata.isbefore === 'true'
        );
        const afterPhoto = uploadedFileData.find(
          (u) => u.appMetadata.settid === settId && u.appMetadata.isbefore === 'false'
        );

        if (beforePhoto && afterPhoto) {
          const settPhoto = {
            ReturnId: newReturn.id,
            SettId: Number(settId),
            beforeObjConRef: beforePhoto.uuid,
            beforeFileName: beforePhoto.fileName,
            afterObjConRef: afterPhoto.uuid,
            afterFileName: afterPhoto.fileName
          };

          settPhotoPromises.push(SettPhotos.create(settPhoto, {transaction: t}));
        }
      }

      await Promise.all(settPhotoPromises);

      // Return the newly created return object.
      return newReturn;
    });

    return newReturn.id;
  },

  /**
   * Create a new randomly allocated Return wrapped in a database transaction,
   * for a return on a licence that was not used.
   *
   * Transaction completes all requests and returns the new return transaction id.
   *
   * @param {number | undefined} id An existing application/license ID.
   * @param {any} cleanObject A new return object to be added to the database.
   * @param {any} application The licence application details.
   * @returns {number} The newly created returns id.
   */
  // eslint-disable-next-line unicorn/prevent-abbreviations
  async createLicenceNotUsed(id, cleanObject, application) {
    try {
      const newReturnTransaction = await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newReturn = await Returns.create(cleanObject, {transaction: t});

        await sendReturnEmailNotUsedLicence(config.notifyApiKey, application, application.emailAddress);
        await sendReturnEmailNotUsedLicence(config.notifyApiKey, application, 'issuedlicence@nature.scot');
        return newReturn;
      });

      return newReturnTransaction.id;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
};

export {ReturnsController as default};
