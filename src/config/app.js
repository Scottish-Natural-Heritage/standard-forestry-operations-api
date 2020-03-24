module.exports = Object.freeze({
  port: process.env.SFO_API_PORT || 3003,
  pathPrefix: process.env.SFO_API_PATH_PREFIX
    ? `/${process.env.SFO_API_PATH_PREFIX}`
    : '/standard-forestry-operations-api'
});
