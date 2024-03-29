const fs = require('fs');
const process = require('process');

/**
 * An EC public+private keypair used to sign links during our automated
 * testing processes ONLY. They will not generate links that can be
 * validated by the production authentication system.
 */
const testKeyPair = {
  // The following five fields are all that are required to represent
  // the public part of the EC keypair.
  kty: 'EC',
  kid: 'KMzSz_C_LDlN-dj7J3u9qYlpTpYtANo4unsy9pFRwqI',
  crv: 'P-256',
  x: 'i6e0757Y7-fATWDxXQmSIsXfNjWWHhRosBvnK3RVnq8',
  y: 'IThf8O6eI8IL6jpHfFltv9vYCFHNyy0Eb4_kfmuXlzU',
  // This last field is needed to fill our the private part of the
  // keypair.
  d: '4mIv-_lOX5pbEo--C_Lx84APD29w0dAQAj8odDIlnxY'
};

/**
 * This is the public EC key the standard-forestry-operations-return app asks us
 * for. It will be used to validate login links in the production
 * environment. It will not sign new links or validate the test login
 * links.
 */
const publicKey = {
  kty: 'EC',
  crv: 'P-256',
  x: 'tJp3nHPEbYhGgqHw4M3KBhkSo1sLIk_VDHFjw0ZRo88',
  y: '7Rb4A4VjdLpj_gAhg_aSxcP5s7On83I2hqYsIvRQxPc'
};

/**
 * Get the public EC key used for verifying login links.
 *
 * @returns {any} A public EC key.
 */
const getPublicKey = () => {
  // If we're running under an automated testing process, extract the
  // public key from the test keypair and return it.
  if (process.env.NODE_ENV !== 'production') {
    return {
      kty: testKeyPair.kty,
      kid: testKeyPair.kid,
      crv: testKeyPair.crv,
      x: testKeyPair.x,
      y: testKeyPair.y
    };
  }

  // If we're running 'normally' return the production public key.
  return publicKey;
};

const getPrivateKey = () => {
  if (process.env.NODE_ENV !== 'production') {
    const jwkToPem = require('jwk-to-pem');
    return jwkToPem(testKeyPair, {private: true});
  }

  return fs.readFileSync('./.secrets/jwt-key');
};

/**
 * Interact with NatureScot's Standard Forestry Operations Return's JWKs.
 */
module.exports = {
  getPublicKey,
  getPrivateKey
};
