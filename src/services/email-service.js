import NotifyClient from 'notifications-node-client';
import config from '../config/app.js';

const NOTIFY_TEMPLATE_RETURN_DID_USE_LICENCE = '0147bd8f-8f8e-4272-9f62-a2228289db1c';
const NOTIFY_TEMPLATE_RETURN_DID_NOT_USE_LICENCE = 'db12bfaa-05aa-43f3-b6d1-eabb48c60b84';
const NOTIFY_TEMPLATE_RETURN_MAGIC_LINK = 'f727cb31-6259-4ee3-a593-6838d1399618';

const NOTIFY_REPLY_EMAIL_LICENSING_NATURE_SCOT = '4b49467e-2a35-4713-9d92-809c55bf1cdd';

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
 * Sends the details of the submitted return to the Notify API, asking it to send off an email.
 * The email sent is the one used if the licence holder used the licence.
 *
 * @param {any} application
 * @param {any} newReturn
 * @param {string[]} settNames
 * @param {any[]} uploadDetails
 * @param {string} emailAddress
 */
const sendReturnEmailUsedLicence = async (application, newReturn, settNames, uploadDetails, emailAddress) => {
  if (config.notifyApiKey) {
    const notifyClient = new NotifyClient.NotifyClient(config.notifyApiKey);

    await notifyClient.sendEmail(NOTIFY_TEMPLATE_RETURN_DID_USE_LICENCE, emailAddress, {
      personalisation: {
        id: application.id,
        fullName: application.fullName,
        startDate: createDisplayDate(new Date(newReturn.startDate)),
        endDate: createDisplayDate(new Date(newReturn.endDate)),
        compliance: newReturn.compliance ? 'Yes' : 'No',
        moreDetails: newReturn?.complianceDetails ?? 'No additional compliance details provided.',
        photosDetails: createDisplayablePhotoDetails(uploadDetails, settNames)
      },
      reference: `NS-SFO-${application.id}`,
      emailReplyToId: NOTIFY_REPLY_EMAIL_LICENSING_NATURE_SCOT
    });
  }
};

/**
 * Sends the details of the return to the Notify API, asking it to send off an email.
 * The email sent is the one used if the licence holder did not use the licence.
 *
 * @param {any} application
 * @param {string} emailAddress
 */
const sendReturnEmailNotUsedLicence = async (application, emailAddress) => {
  if (config.notifyApiKey) {
    const notifyClient = new NotifyClient.NotifyClient(config.notifyApiKey);

    await notifyClient.sendEmail(NOTIFY_TEMPLATE_RETURN_DID_NOT_USE_LICENCE, emailAddress, {
      personalisation: {
        id: application.id,
        fullName: application.fullName
      },
      reference: `NS-SFO-${application.id}`,
      emailReplyToId: NOTIFY_REPLY_EMAIL_LICENSING_NATURE_SCOT
    });
  }
};

/**
 * Send an email to the visitor that contains a link which allows them to log in
 * to the rest of the meat bait return system.
 *
 * @param {string} notifyApiKey API key for sending emails.
 * @param {string} emailAddress where to send the log in email.
 * @param {string} loginLink link to log in via.
 * @param {string} existingId SFO licence number for notify's records.
 * @param {string} fullName The name of the licence holder.
 */
const sendLoginEmail = async (emailAddress, loginLink, licenceNumber, fullName) => {
  if (config.notifyApiKey) {
    const notifyClient = new NotifyClient.NotifyClient(config.notifyApiKey);

    await notifyClient.sendEmail(NOTIFY_TEMPLATE_RETURN_MAGIC_LINK, emailAddress, {
      personalisation: {
        loginLink,
        licenceNumber,
        fullName
      },
      reference: `${licenceNumber}`,
      emailReplyToId: NOTIFY_REPLY_EMAIL_LICENSING_NATURE_SCOT
    });
  }
};

export const EmailService = {sendReturnEmailUsedLicence, sendReturnEmailNotUsedLicence, sendLoginEmail};
