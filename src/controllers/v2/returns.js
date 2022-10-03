import database from '../../models/index.js';

const {Application, Returns, SettPhotos} = database;

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
   * @returns {number} The newly created returns id.
   */
  async create(id, cleanObject, settIds, uploadUUIDs) {
    try {
      const newReturnTransaction = await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        const newReturn = await Returns.create(cleanObject, {transaction: t});

        // We need a separate index for the uploaded UUIDs.
        let uploadUUIDsIndex = 0;

        // Loop through the settId and uploadUUID arrays and create the entries in the SettPhotos table.
        for (let index = 0; index < settIds.length; index++) {
          const settPhotos = {
            ReturnId: newReturn.id,
            SettId: Number(settIds[index]),
            beforeObjConRef: uploadUUIDs[uploadUUIDsIndex].uuid,
            beforeFileName: uploadUUIDs[uploadUUIDsIndex].fileName,
            afterObjConRef: uploadUUIDs[uploadUUIDsIndex + 1].uuid,
            afterFileName: uploadUUIDs[uploadUUIDsIndex + 1].fileName
          };

          const newSettPhotosId = await SettPhotos.create(settPhotos, {transaction: t});

          // If something went wrong return a 500 and cancel the transaction.
          if (newSettPhotosId === undefined) {
            return response.status(500).send({message: `Could not create sett photos for return ${newId}.`});
          }

          uploadUUIDsIndex += 2;
        }

        // Return the newly created return object.
        return newReturn;
      });

      return newReturnTransaction.id;
    } catch {
      return undefined;
    }
  }
};

export {ReturnsController as default};
