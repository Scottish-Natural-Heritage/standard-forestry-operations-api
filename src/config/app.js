const assert = require('assert');

assert(
  process.env.LICENSING_DB_PASS !== undefined,
  'A password for the licensing user (LICENSING_DB_PASS) is required.'
);
assert(process.env.SFO_DB_PASS !== undefined, 'A password for the sfo user (SFO_DB_PASS) is required.');
assert(process.env.SFO_NOTIFY_API_KEY !== undefined, 'An API Key for GOV.UK Notify (SFO_NOTIFY_API_KEY) is required.');

module.exports = Object.freeze({
  port: process.env.SFO_API_PORT || 3003,
  pathPrefix: process.env.SFO_API_PATH_PREFIX
    ? `/${process.env.SFO_API_PATH_PREFIX}`
    : '/standard-forestry-operations-api',
  databaseHost: process.env.LICENSING_DB_HOST || 'localhost',
  licensingPassword: process.env.LICENSING_DB_PASS,
  sfoPassword: process.env.SFO_DB_PASS,
  notifyApiKey: process.env.SFO_NOTIFY_API_KEY
});
