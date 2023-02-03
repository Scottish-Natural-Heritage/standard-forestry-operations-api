// Use node-cron for scheduled tasks.
import cron from 'node-cron';

/**
 * Start up node-cron.
 */
const initScheduledJobs = () => {
  const scheduledJobFunction = cron.schedule('5 * * * * *', () => {
    console.log("Triggering cron job(s).");

    // Tasks here.

    console.log('Ending cron job(s).');
  });

  scheduledJobFunction.start();
};

export {initScheduledJobs as default};
