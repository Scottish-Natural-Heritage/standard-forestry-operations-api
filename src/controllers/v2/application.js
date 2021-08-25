import Sequelize from 'sequelize';
// eslint-disable-next-line unicorn/import-index, import/no-useless-path-segments
import database from '../../models/index.js';

const {Application, Returns, Sett, Revocation} = database;

/**
 * Clean an incoming PATCH request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} body the incoming request's body
 * @returns {any} cleanedBody a json object that's just got our cleaned up fields on it
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
   * Soft delete a application in the database.
   *
   * @param {number} id A possible ID of a application.
   * @param {object} cleanObject A new revocation object to be added to the database.
   * @returns {boolean} True if the record is deleted, otherwise false.
   */
  delete: async (id, cleanObject) => {
    try {
      await database.sequelize.transaction(async (t) => {
        await Application.findByPk(id, {transaction: t, rejectOnEmpty: true});
        await Revocation.create(cleanObject, {transaction: t});
        await Application.destroy({where: {id}, transaction: t});
        return true;
      });
    } catch {
      return false;
    }
  }
};

export {ApplicationController as default, cleanPatchInput};
