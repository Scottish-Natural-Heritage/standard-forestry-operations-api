import utils from 'naturescot-utils';
import NotifyClient from 'notifications-node-client';
import database from '../../models/index.js';
import config from '../../config/app.js';
import jsonConsoleLogger, {unErrorJson} from '../../json-console-logger.js';
import {
  EXPIRED_NO_RETURN_NOTIFY_TEMPLATE_ID,
  SOON_TO_EXPIRE_NOTIFY_TEMPLATE_ID,
  LICENSING_REPLY_TO_NOTIFY_EMAIL_ID
} from '../../notify-template-ids.js';

const {Application, Returns, Revocation, OldReturns} = database;

/**
 * Send reminder email to applicant informing them their licence
 * has expired and they have not yet submitted a return.
 *
 * @param {string} emailDetails The details to use in personalisation of email.
 * @param {any} emailAddress The email address of the recipient.
 */
const sendLicenceExpiredNoReturnEmail = async (emailDetails, emailAddress) => {
  if (config.notifyApiKey) {
    try {
      const notifyClient = new NotifyClient.NotifyClient(config.notifyApiKey);

      // Send the email via notify.
      await notifyClient.sendEmail(EXPIRED_NO_RETURN_NOTIFY_TEMPLATE_ID, emailAddress, {
        personalisation: emailDetails,
        emailReplyToId: LICENSING_REPLY_TO_NOTIFY_EMAIL_ID
      });
    } catch (error) {
      jsonConsoleLogger.error(unErrorJson(error));
      throw error;
    }
  }
};

/**
 * Send reminder email to applicant informing them their licence
 * will expire shortly and they have not yet submitted a return.
 *
 * @param {string} emailDetails The details to use in personalisation of email.
 * @param {any} emailAddress The email address of the recipient.
 */
const sendLicenceSoonExpiredNoReturnEmail = async (emailDetails, emailAddress) => {
  if (config.notifyApiKey) {
    try {
      const notifyClient = new NotifyClient.NotifyClient(config.notifyApiKey);

      // Send the email via notify.
      await notifyClient.sendEmail(SOON_TO_EXPIRE_NOTIFY_TEMPLATE_ID, emailAddress, {
        personalisation: emailDetails,
        emailReplyToId: LICENSING_REPLY_TO_NOTIFY_EMAIL_ID
      });
    } catch (error) {
      jsonConsoleLogger.error(unErrorJson(error));
      throw error;
    }
  }
};

const setReturnReminderEmailDetails = (application) => {
  return {
    id: application.id,
    lhName: application.fullName
  };
};

const ScheduledController = {
  /**
   * Retrieve all applications from the database.
   *
   * @returns  {Sequelize.Model} All existing applications.
   */
  async findAll() {
    return Application.findAll({include: Returns, OldReturns, Revocation});
  },

  sendExpiredReturnReminder: async (applications) => {
    // A count of the number of emails sent.
    let sentCount = 0;

    for (const application of applications) {
      const emailDetails = setReturnReminderEmailDetails(application);

      // eslint-disable-next-line no-await-in-loop
      await sendLicenceExpiredNoReturnEmail(emailDetails, application.emailAddress);
      sentCount++;
    }

    return sentCount;
  },

  sendSoonExpiredReturnReminder: async (applications) => {
    // A count of the number of emails sent.
    let sentCount = 0;

    for (const application of applications) {
      const emailDetails = setReturnReminderEmailDetails(application);

      // eslint-disable-next-line no-await-in-loop
      await sendLicenceSoonExpiredNoReturnEmail(emailDetails, application.emailAddress);
      sentCount++;
    }

    return sentCount;
  }
};

export {ScheduledController as default};
