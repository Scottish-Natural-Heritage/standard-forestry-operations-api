import database from '../../models/index.js';

const {Returns, SettPhotos} = database;

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
   * Create a new randomly allocated Return in a database transaction,
   * for a return on a licence that was not used.
   *
   * Transaction completes all requests and returns the new return id.
   *
   * @param {any} submittedReturn A new return object to be added to the database.
   * @returns {number} The newly created returns id.
   */
  async createLicenceNotUsed(submittedReturn) {
    const newReturn = await database.sequelize.transaction(async (t) => {
      const newReturn = await Returns.create(submittedReturn, {transaction: t});

      return newReturn;
    });

    return newReturn.id;
  }
};

export {ReturnsController as default};
