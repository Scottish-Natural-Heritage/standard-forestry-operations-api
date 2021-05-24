// eslint-disable-next-line unicorn/import-index, import/no-useless-path-segments
import database from '../models/index.js';
import Sequelize from 'sequelize';

const {ApplyOther} = database;

/**
 * A controller to perform 'persistence' operations on our apply-on-behalf-of-others-email-notification
 * objects.
 */
const ApplyOtherController = {
  /**
   * Create a new apply-on-behalf-of-others-email-notification object.
   *
   * @param {any} jsonApplyOther A JSON version of the model to insert into the database.
   * @returns {Sequelize.Model} The new apply-on-behalf-of-others-email-notification
   * object.
   */
  create: async (jsonApplyOther) => {
    return ApplyOther.create({
      emailAddress: jsonApplyOther.emailAddress
    });
  }
};

export {ApplyOtherController as default};
