// Use node-cron for scheduled tasks.
import cron from 'node-cron';

// Use to make HTTP calls.
import axios from 'axios';

import config from './config/app.js';

// Let us log structured messages to the console.
import jsonConsoleLogger, {unErrorJson} from './json-console-logger.js';

/**
 * Start up node-cron.
 */
const initScheduledJobs = () => {
  const scheduledJobFunction = cron.schedule('0 6 * * *', async () => {
    console.log('Triggering cron job(s).');

    // Get the date.
    const currentDate = new Date();

    // Tasks here.

    // Check for expired licences with no returns submitted, on the 1st of January and 1st of February.
    if (currentDate.getDate() === 1 && (currentDate.getMonth() === 0 || currentDate.getMonth() === 1)) {
      try {
        await axios.post(`http://localhost:${config.port}${config.pathPrefix}/v2/expired-no-return-reminder`);
      } catch (error) {
        jsonConsoleLogger.error(unErrorJson(error));
      }
    }

    // Check for soon-to-expire licences, on 1st of November.
    if (currentDate.getDate() === 1 && currentDate.getMonth() === 10) {
      try {
        await axios.post(`http://localhost:${config.port}${config.pathPrefix}/v2/soon-to-expire-return-reminder`);
      } catch (error) {
        jsonConsoleLogger.error(unErrorJson(error));
      }
    }

    console.log('Ending cron job(s).');
  });

  scheduledJobFunction.start();
};

export {initScheduledJobs as default};
