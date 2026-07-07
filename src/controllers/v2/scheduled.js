import NotifyClient from 'notifications-node-client';
import database from '../../models/index.js';
import config from '../../config/app.js';
import jsonConsoleLogger, {unErrorJson} from '../../json-console-logger.js';
import {
  EXPIRED_NO_RETURN_NOTIFY_TEMPLATE_ID,
  SOON_TO_EXPIRE_NOTIFY_TEMPLATE_ID,
  LICENSING_REPLY_TO_NOTIFY_EMAIL_ID
} from '../../notify-template-ids.js';

const {Application, Returns, Revocation, OldReturns, Note} = database;

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
   * Retrieve all applications from the database. Include old returns, new returns and revocations.
   * Used to decide which email addresses need reminder emails sent.
   *
   * @returns  {Sequelize.Model} All existing applications.
   */
  async findAll() {
    return Application.findAll({
      include: [{model: Returns}, {model: OldReturns}, {model: Revocation}]
    });
  },

  async sendExpiredReturnReminder(applications) {
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

  async sendSoonExpiredReturnReminder(applications) {
    // A count of the number of emails sent.
    let sentCount = 0;

    for (const application of applications) {
      const emailDetails = setReturnReminderEmailDetails(application);

      // eslint-disable-next-line no-await-in-loop
      await sendLicenceSoonExpiredNoReturnEmail(emailDetails, application.emailAddress);
      sentCount++;
    }

    return sentCount;
  },

  /**
   * Retrieve all applications that have not yet had their PII redacted,
   * including soft-deleted (cancelled/revoked) records and their Revocation.
   *
   * @returns {Sequelize.Model[]} Applications pending retention processing.
   */
  async findApplicationsForRetention() {
    return Application.findAll({
      where: {piiRedactedAt: null},
      include: [{model: Revocation, paranoid: false}],
      paranoid: false
    });
  },

  /**
   * Apply the retention policy to the supplied applications by redacting PII
   * fields and hard-deleting associated Notes, Returns and OldReturns.
   *
   * @param {Sequelize.Model[]} applications Applications whose retention period has expired.
   * @returns {number} The number of applications processed.
   */
  async applyRetentionPolicy(applications) {
    let processedCount = 0;

    for (const application of applications) {
      // eslint-disable-next-line no-await-in-loop
      await database.sequelize.transaction(async (t) => {
        // Redact PII on the Application row (addressPostcode is retained per spec).
        await Application.update(
          {
            fullName: 'No data',
            companyOrganisation: null,
            emailAddress: 'No data',
            phoneNumber: 'No data',
            addressLine1: 'No data',
            addressLine2: null,
            addressTown: null,
            addressCounty: null,
            piiRedactedAt: new Date()
          },
          {where: {id: application.id}, paranoid: false, validate: false, transaction: t}
        );

        // Hard-delete officer notes.
        await Note.destroy({where: {ApplicationId: application.id}, force: true, transaction: t});

        // Hard-delete Returns history.
        await Returns.destroy({where: {ApplicationId: application.id}, force: true, transaction: t});

        // Hard-delete OldReturns history.
        await OldReturns.destroy({where: {ApplicationId: application.id}, force: true, transaction: t});
      });

      processedCount++;
    }

    return processedCount;
  }
};

export {ScheduledController as default};
