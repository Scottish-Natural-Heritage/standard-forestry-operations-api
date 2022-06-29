const assert = require('assert');
const process = require('process');

assert(process.env.SFO_NOTIFY_API_KEY !== undefined, 'An API Key for GOV.UK Notify (SFO_NOTIFY_API_KEY) is required.');

module.exports = Object.freeze({
  port: process.env.SFO_API_PORT || 3003,
  pathPrefix: process.env.SFO_API_PATH_PREFIX
    ? `/${process.env.SFO_API_PATH_PREFIX}`
    : '/standard-forestry-operations-api',
  databaseHost: process.env.LICENSING_DB_HOST || 'localhost',
  licensingPassword: process.env.LICENSING_DB_PASS || 'override_this_value',
  sfoPassword: process.env.SFO_DB_PASS || 'override_this_value',
  notifyApiKey: process.env.SFO_NOTIFY_API_KEY,
  roSfoPassword: process.env.RO_SFO_DB_PASS || 'override_this_value'
});
