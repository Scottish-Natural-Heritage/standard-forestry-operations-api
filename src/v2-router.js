import express from 'express';
import jwt from 'jsonwebtoken';
import NotifyClient from 'notifications-node-client';

import Application, {cleanPatchInput} from './controllers/v2/application.js';
import Sett from './controllers/v2/sett.js';
import Returns from './controllers/v2/returns.js';
import Note from './controllers/v2/note.js';
import jsonConsoleLogger, {unErrorJson} from './json-console-logger.js';
import config from './config/app.js';

import jwk from './config/jwk.js';

const process = require('process');

const v2router = express.Router();

v2router.get('/health', async (request, response) => {
  response.status(200).send({message: 'OK'});
});

/**
 * READs all applications.
 */
v2router.get('/applications', async (request, response) => {
  try {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const applications = await Application.findAll();

    if (applications === undefined || applications === null) {
      return response.status(404).send({message: `No applications found.`});
    }

    return response.status(200).send(applications);
  } catch (error) {
    jsonConsoleLogger.error(unErrorJson(error));
    return response.status(500).send({error});
  }
});

/**
 * READs a single application.
 */
v2router.get('/applications/:id', async (request, response) => {
  try {
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    // eslint-disable-next-line unicorn/prevent-abbreviations
    const application = await Application.findOne(existingId);

    if (application === undefined || application === null) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    return response.status(200).send(application);
  } catch (error) {
    jsonConsoleLogger.error(unErrorJson(error));
    return response.status(500).send({error});
  }
});

/**
 * Calculates the licence expiry date.
 *
 * @returns {Date} the calculated expiry date.
 */
const calculateExpiryDate = () => {
  let expiryDate;
  const currentYear = new Date().getFullYear();

  if (new Date().getMonth() + 1 < 7) {
    expiryDate = new Date(currentYear, 6, 1);
  } else if (new Date().getMonth() + 1 < 12) {
    expiryDate = new Date(currentYear, 10, 30);
  } else {
    expiryDate = new Date(currentYear + 1, 10, 30);
  }

  return expiryDate;
};

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} newAppId The ID we deemed suitable for the application.
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up fields on it.
 */
const cleanAppInput = (body) => {
  return {
    // The booleans are just copied across.
    convictions: body.convictions,
    complyWithTerms: body.complyWithTerms,

    // The strings are trimmed for leading and trailing whitespace and then
    // copied across if they're in the POST body or are set to undefined if
    // they're missing.
    fullName: body.fullName === undefined ? undefined : body.fullName.trim(),
    companyOrganisation: body.companyOrganisation === undefined ? undefined : body.companyOrganisation.trim(),
    addressLine1: body.addressLine1 === undefined ? undefined : body.addressLine1.trim(),
    addressLine2: body.addressLine2 === undefined ? undefined : body.addressLine2.trim(),
    addressTown: body.addressTown === undefined ? undefined : body.addressTown.trim(),
    addressCounty: body.addressCounty === undefined ? undefined : body.addressCounty.trim(),
    addressPostcode: body.addressPostcode === undefined ? undefined : body.addressPostcode.trim(),
    phoneNumber: body.phoneNumber === undefined ? undefined : body.phoneNumber.trim(),
    emailAddress: body.emailAddress === undefined ? undefined : body.emailAddress.trim(),
    createdByLicensingOfficer: body.createdByLicensingOfficer,
    expiryDate: calculateExpiryDate(),
    uprn: body.uprn === undefined ? undefined : body.uprn,

    // We copy across the setts, cleaning them as we go.
    setts:
      body.setts === undefined
        ? undefined
        : body.setts.map((sett) => {
            return {
              // The number is just copied across.
              entrances: sett.entrances,

              // The three strings are trimmed then copied.
              id: sett.id === undefined ? undefined : sett.id.trim(),
              gridReference: sett.gridReference === undefined ? undefined : sett.gridReference.trim(),
              createdByLicensingOfficer:
                sett.createdByLicensingOfficer === undefined ? undefined : sett.createdByLicensingOfficer.trim()
            };
          })
  };
};

/**
 * Creates a new application.
 */
v2router.post('/applications', async (request, response) => {
  try {
    // Create baseUrl.
    const baseUrl = new URL(
      `${request.protocol}://${request.hostname}:${config.port}${request.originalUrl}${
        request.originalUrl.endsWith('/') ? '' : '/'
      }`
    );

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanAppInput(request.body);

    // Create a new id wrapped in a database transaction
    const newId = await Application.create(cleanObject);

    // If we were not able to create the new application then we need to respond with a 500 error.
    if (newId === undefined) {
      return response.status(500).send({message: `Could not create application.`});
    }

    // Return the new location of the newly created application.
    return response.status(201).location(new URL(newId, baseUrl)).send();
  } catch (error) {
    return response.status(500).send({message: `Could not create application. in final catch ${error.message}`});
  }
});

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} existingId The ID of the license that the sett belongs to.
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up fields on it.
 */
const cleanSettInput = (existingId, body) => {
  return {
    ApplicationId: existingId,
    // The strings are trimmed for leading and trailing whitespace and then
    // copied across if they're in the POST body or are set to undefined if
    // they're missing.
    sett: body.sett === undefined ? undefined : body.sett.trim(),
    gridRef: body.gridReference === undefined ? undefined : body.gridReference.trim(),
    entrances: body.entrances === undefined ? undefined : body.entrances,
    createdByLicensingOfficer: body.createdByLicensingOfficer
  };
};

// Allow the API consumer to submit a sett against a application.
v2router.post('/applications/:id/setts', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    const baseUrl = new URL(
      `${request.protocol}://${request.hostname}:${config.port}${request.originalUrl}${
        request.originalUrl.endsWith('/') ? '' : '/'
      }`
    );

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanSettInput(existingId, request.body);

    // Create a new id wrapped in a database transaction
    const newId = await Sett.create(existingId, cleanObject);

    if (newId === undefined) {
      return response.status(500).send({message: `Could not create sett for license ${existingId}.`});
    }

    return response.status(201).location(new URL(newId, baseUrl)).send();
  } catch (error) {
    return response.status(500).send({error});
  }
});

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} existingId The ID of the license that the note belongs to.
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up fields on it.
 */
const cleanNoteInput = (existingId, body) => {
  return {
    ApplicationId: existingId,
    // The strings are trimmed for leading and trailing whitespace and then
    // copied across if they're in the POST body or are set to undefined if
    // they're missing.
    note: body.note.trim(),
    createdBy: body.createdBy
  };
};

// Allow the API consumer to submit a note against a application.
v2router.post('/applications/:id/notes', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    const baseUrl = new URL(
      `${request.protocol}://${request.hostname}:${config.port}${request.originalUrl}${
        request.originalUrl.endsWith('/') ? '' : '/'
      }`
    );

    // Check if there's a application allocated at the specified ID.
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const existingApplication = await Application.findOne(existingId);
    if (existingApplication === undefined || existingApplication === null) {
      return response.status(404).send({message: `application ${existingId} not allocated.`});
    }

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanNoteInput(existingId, request.body);

    // Create a new id wrapped in a database transaction
    const newNote = await Note.create(existingId, cleanObject);

    if (newNote === undefined) {
      return response.status(500).send({message: `Could not create note for licence ${existingId}.`});
    }

    return response.status(201).location(new URL(newNote, baseUrl)).send();
  } catch (error) {
    return response.status(500).send({error});
  }
});

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} existingId The return that is being created.
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up fields on it.
 */
const cleanReturnInput = (existingId, body) => {
  return {
    ApplicationId: existingId,
    // The strings are trimmed for leading and trailing whitespace and then
    // copied across if they're in the POST body or are set to undefined if
    // they're missing.
    beforeObjectiveRef: body.beforeObjectiveRef === undefined ? undefined : body.beforeObjectiveRef.trim(),
    afterObjectiveRef: body.afterObjectiveRef === undefined ? undefined : body.afterObjectiveRef.trim(),
    fromDate: body.fromDate === undefined ? undefined : body.fromDate,
    toDate: body.toDate === undefined ? undefined : body.toDate,
    comment: body.comment === undefined ? undefined : body.comment.trim(),
    createdByLicensingOfficer: body.createdByLicensingOfficer
  };
};

/**
 * Creates a new application return.
 */
v2router.post('/applications/:id/returns', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    // Create baseUrl.
    const baseUrl = new URL(
      `${request.protocol}://${request.hostname}:${config.port}${request.originalUrl}${
        request.originalUrl.endsWith('/') ? '' : '/'
      }`
    );

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanReturnInput(existingId, request.body);

    // Create a new return wrapped in a database transaction that will return the ID of the new return.
    const newId = await Returns.create(existingId, cleanObject);

    // If we were unable to create the new return then we need to send back a suitable response.
    if (newId === undefined) {
      return response.status(500).send({message: `Could not create return for license ${existingId}.`});
    }

    return response.status(201).location(new URL(newId, baseUrl)).send();
  } catch (error) {
    return response.status(500).send({error});
  }
});

// Allow an API consumer to save a application against an allocated but un-assigned application number.
// No PUT endpoint is required as we now use a PATCH method of updating details.
v2router.put('/applications/:id', async (request, response) => {
  return response.status(501).send({message: 'Not implemented.'});
});

/**
 * Clean the incoming request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} existingId The application that is being revoked.
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up fields on it.
 */
const cleanRevokeInput = (existingId, body) => {
  return {
    ApplicationId: existingId,
    // The strings are trimmed for leading and trailing whitespace and then
    // copied across if they're in the POST body or are set to undefined if
    // they're missing.
    reason: body.reason === undefined ? undefined : body.reason.trim(),
    createdBy: body.createdBy === undefined ? undefined : body.createdBy.trim(),
    isRevoked: body.isRevoked
  };
};

/**
 * UPDATEs part of a single application.
 */
v2router.patch('/applications/:id', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `application ${request.params.id} not valid.`});
    }

    // Check if there's a application allocated at the specified ID.
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const existingApplication = await Application.findOne(existingId);
    if (existingApplication === undefined || existingApplication === null) {
      return response.status(404).send({message: `application ${existingId} not allocated.`});
    }

    // Clean up the user's input before we store it in the database.
    let cleanObject;
    try {
      cleanObject = cleanPatchInput(request.body);
    } catch (error) {
      return response.status(400).send({message: `Could not update application ${existingId}. ${error.message}`});
    }

    // Update the application in the database with our client's values.
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const updatedApplication = await Application.update(existingId, cleanObject);

    // If they're not successful, send a 500 error.
    if (updatedApplication === undefined) {
      return response.status(500).send({message: `Could not update application ${existingId}.`});
    }

    // If they are, send back the updated fields.
    return response.status(200).send(updatedApplication);
  } catch (error) {
    // When anything else goes wrong send the error to the client.
    return response.status(500).send({error});
  }
});

/**
 * DELETEs a single application and all child records.
 */
v2router.delete('/applications/:id', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanRevokeInput(existingId, request.body);
    // Attempt to delete the application and all child records.
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const deleteApplication = await Application.delete(existingId, cleanObject);

    // If we were unable to delete the application we need to return a 500 with a suitable error message.
    if (deleteApplication === false) {
      return response.status(500).send({message: `Could not delete Application ${existingId}.`});
    }

    // If we were able to delete the application we need to return a 200.
    return response.status(200).send();
  } catch (error) {
    // If anything goes wrong (such as a validation error), tell the client.
    return response.status(500).send({error});
  }
});

// Save an incoming email address so we can email them later once the apply on
// behalf of others service is up and running.
// this may need done in the future but currently we cant apply on behalf of.
v2router.post('/apply-other', async (request, response) => {
  return response.status(501).send({message: 'Not implemented.'});
});

/**
 * DELETEs a single Sett.
 */
v2router.delete('/applications/:id/setts/:settId', async (request, response) => {
  try {
    // Try to parse the incoming application ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    // Try to parse the incoming Sett ID to make sure it's really a number.
    const existingSettId = Number(request.params.settId);
    if (Number.isNaN(existingSettId)) {
      return response.status(404).send({message: `Sett ${request.params.settId} not valid.`});
    }

    // Attempt to delete the sett.
    const deleteSett = await Sett.delete(existingSettId);
    // If we were unable to delete the sett we need to return a 500 with a suitable error message.
    if (deleteSett === false) {
      return response.status(500).send({message: `Could not delete Sett ${existingSettId}.`});
    }

    // If we were able to delete the sett we need to return a 200.
    return response.status(200).send();
  } catch (error) {
    // If anything goes wrong (such as a validation error), tell the client.
    return response.status(500).send({error});
  }
});

/**
 * READs all setts.
 */
v2router.get('/setts', async (request, response) => {
  try {
    const setts = await Sett.findAll();

    if (setts === undefined || setts === null) {
      return response.status(404).send({message: `No setts found.`});
    }

    return response.status(200).send(setts);
  } catch (error) {
    jsonConsoleLogger.error(unErrorJson(error));
    return response.status(500).send({error});
  }
});

/**
 * Resend a licence.
 */
v2router.post('/applications/:id/resend', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `application ${request.params.id} not valid.`});
    }

    // Check if there's a application allocated at the specified ID.
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const existingApplication = await Application.findOne(existingId);
    if (existingApplication === undefined || existingApplication === null) {
      return response.status(404).send({message: `application ${existingId} not allocated.`});
    }

    // Call the application's resend function to resend the licence email.
    const result = await Application.resend(existingId, existingApplication);

    // Return success response.
    return response.status(200).send(result);
  } catch (error) {
    jsonConsoleLogger.error(unErrorJson(error));
    return response.status(500).send({error});
  }
});

// Disabling as I'd rather not abbreviate application to app.
/* eslint-disable unicorn/prevent-abbreviations */
v2router.get('/applications/:id/login', async (request, response) => {
  // Try to parse the incoming ID to make sure it's really a number.
  const existingId = Number(request.params.id);
  const idInvalid = Number.isNaN(existingId);

  // Check if there's an application allocated at the specified ID.
  const existingApplication = await Application.findOne(existingId);
  const idNotFound = existingApplication === undefined || existingApplication === null;

  // Check that the visitor's given us a postcode.
  const {postcode} = request.query;
  const postcodeInvalid = postcode === undefined;

  // Check that the visitor's supplied postcode matches their stored one.
  const postcodeIncorrect =
    existingApplication !== undefined &&
    existingApplication !== null &&
    !postcodesMatch(existingApplication.addressPostcode, postcode);

  // Check that the visitor's given us a base url.
  const {redirectBaseUrl} = request.query;
  const urlInvalid = redirectBaseUrl === undefined || redirectBaseUrl === null;

  // As long as we're happy that the visitor's provided use with valid
  // information, build them a token for logging in with.
  let token;
  if (!idInvalid && !idNotFound && !postcodeInvalid && !postcodeIncorrect) {
    token = buildToken(jwk.getPrivateKey(), existingId);
  }

  // If the visitor has give us enough information, build them a link that will
  // allow them to click-to-log-in.
  let loginLink;
  if (!urlInvalid && token !== undefined) {
    loginLink = `${redirectBaseUrl}${token}`;
  }

  // As long as we've managed to build a login link, send the visitor an email
  // with that link included.
  if (loginLink !== undefined) {
    await sendLoginEmail(config.notifyApiKey, existingApplication.emailAddress, loginLink, existingId);
  }

  // If we're in production, no matter what, tell the API consumer that everything went well.
  if (process.env.NODE_ENV === 'production') {
    return response.status(200).send();
  }

  // If we're in development mode, send back a debug message, with the link for
  // the developer, to avoid sending unnecessary emails.
  return response.status(200).send({
    idInvalid,
    idNotFound,
    postcodeInvalid,
    postcodeIncorrect,
    urlInvalid,
    token,
    loginLink
  });
});
/* eslint-enable unicorn/prevent-abbreviations */

// Allow an API consumer to retrieve the public half of our ECDSA key to
// validate our signed JWTs.
v2router.get('/public-key', async (request, response) => response.status(200).send(jwk.getPublicKey()));

/**
 * Build a JWT to allow a visitor to log in to the supply a return flow.
 *
 * @param {string} jwtPrivateKey
 * @param {string} id
 * @returns {string} a signed JWT
 */
const buildToken = (jwtPrivateKey, id) =>
  jwt.sign({}, jwtPrivateKey, {subject: `${id}`, algorithm: 'ES256', expiresIn: '30m', noTimestamp: true});

/**
 * Send an email to the visitor that contains a link which allows them to log in
 * to the rest of the meat bait return system.
 *
 * @param {string} notifyApiKey API key for sending emails
 * @param {string} emailAddress where to send the log in email
 * @param {string} loginLink link to log in via
 * @param {string} regNo trap registration number for notify's records
 */
const sendLoginEmail = async (notifyApiKey, emailAddress, loginLink, regNo) => {
  if (notifyApiKey) {
    const notifyClient = new NotifyClient.NotifyClient(notifyApiKey);

    await notifyClient.sendEmail('f727cb31-6259-4ee3-a593-6838d1399618', emailAddress, {
      personalisation: {
        loginLink
      },
      reference: `${regNo}`,
      emailReplyToId: '4b49467e-2a35-4713-9d92-809c55bf1cdd'
    });
  }
};

/**
 * Test if two postcodes match.
 *
 * A match is when the alphanumeric characters in the supplied strings equal
 * each other once all other characters have been removed and everything's been
 * transformed to lower-case. It's extreme, but ' !"£IV3$%^8NW&*( ' should match
 * 'iv3 8nw'.
 *
 * @param {string} postcode1 a postcode to check
 * @param {string} postcode2 the other postcode to check
 * @returns {boolean} true if they kinda match, false otherwise
 */
const postcodesMatch = (postcode1, postcode2) => {
  // Regex that matches any and all non alpha-num characters.
  const notAlphaNumber = /[^a-z\d]/gi;

  // Clean our two strings to the 'same' representation.
  const cleanPostcode1 = postcode1.replace(notAlphaNumber, '').toLocaleLowerCase();
  const cleanPostcode2 = postcode2.replace(notAlphaNumber, '').toLocaleLowerCase();

  // Check if they match, now that they're clean.
  return cleanPostcode1 === cleanPostcode2;
};

export {v2router as default};
