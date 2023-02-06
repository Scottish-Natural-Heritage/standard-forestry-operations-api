// Use node-cron for scheduled tasks.
import cron from 'node-cron';

// Use to make HTTP calls.
import axios from 'axios';

/**
 * Start up node-cron.
 */
const initScheduledJobs = () => {
  const scheduledJobFunction = cron.schedule('0 6 * * *', async () => {
    console.log("Triggering cron job(s).");

    // Get the date.
    const currentDate = new Date();

    // Tasks here.

    // Check for expired licences with not returns submitted, on the 1st of January and 1st of February.
    if (currentDate.getDate() === 1 && (currentDate.getMonth() === 0 || currentDate.getMonth === 1)) {
      try {
        await axios.post(`http://localhost:3017${config.pathPrefix}/expired-no-return-reminder`);
      } catch (error) {
        console.error(JsonUtils.unErrorJson(error));
      }
    }

    console.log('Ending cron job(s).');
  });

  scheduledJobFunction.start();
};

export {initScheduledJobs as default};
