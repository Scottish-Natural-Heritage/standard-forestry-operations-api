import express from 'express';
import config from './config/app.js';

const router = express.Router();

import Application from './controllers/application.js';
import ApplyOther from './controllers/apply-other.js';

router.get('/health', async (request, response) => {
  response.status(200).send({message: 'OK'});
});

router.get('/applications', async (request, response) => {
  try {
    const applications = await Application.findAll();

    if (applications === undefined || applications === null) {
      return response.status(404).send({message: `No applications found.`});
    }

    return response.status(200).send(applications);
  } catch (error) {
    return response.status(500).send({error});
  }
});

/**
 * READs a single application.
 */
router.get('/applications/:id', async (request, response) => {
  try {
    const existingId = Number(request.params.id);
    if (Number.isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    const applications = await Application.findOne(existingId);

    if (applications === undefined || applications === null) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    return response.status(200).send(applications);
  } catch (error) {
    return response.status(500).send({error});
  }
});

// Allow an API consumer to allocate a new application number.
router.post('/applications', async (request, response) => {
  const baseUrl = new URL(
    `${request.protocol}://${request.hostname}:${config.port}${request.originalUrl}${
      request.originalUrl.endsWith('/') ? '' : '/'
    }`
  );

  try {
    const newApplication = await Application.create();
    response.status(201).location(new URL(newApplication.id, baseUrl)).send();
  } catch (error) {
    response.status(500).send({error});
  }
});

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up fields on it.
 */
const cleanInput = (body) => {
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

    // We copy across the setts, cleaning them as we go.
    setts:
      body.setts === undefined
        ? undefined
        : body.setts.map((sett) => {
            return {
              // The number is just copied across.
              entrances: sett.entrances,

              // The two strings are trimmed then copied.
              id: sett.id === undefined ? undefined : sett.id.trim(),
              gridReference: sett.gridReference === undefined ? undefined : sett.gridReference.trim()
            };
          })
  };
};

// Allow an API consumer to save a application against an allocated but un-assigned application number.
router.put('/applications/:id', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (isNaN(existingId)) {
      response.status(404).send({message: `Application ${request.params.id} not valid.`});
      return;
    }

    // Check if there's a application allocated at the specified ID.
    const existingApp = await Application.findOne(existingId);
    if (existingApp === undefined || existingApp === null) {
      response.status(404).send({message: `Application ${existingId} not allocated.`});
      return;
    }

    // Check the specified application hasn't been assigned yet.
    if (existingApp.fullName !== undefined && existingApp.fullName !== null) {
      response.status(409).send({message: `Application ${existingId} already assigned.`});
      return;
    }

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanInput(request.body);

    // Update the registration in the database with our client's values.
    const updatedApp = await Application.update(existingId, cleanObject);

    // If they're not successful, send a 500 error.
    if (updatedApp === undefined) {
      response.status(500).send({message: `Could not update application ${existingId}.`});
    }

    // If they are, send back the finalised registration.
    response.status(200).send(updatedApp);
  } catch (error) {
    // If anything goes wrong (such as a validation error), tell the client.
    response.status(500).send({error});
  }
});

/**
 * Clean the incoming request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} existingId the application that is being revoked
 * @param {any} body the incoming request's body
 * @returns {any} a json object that's just got our cleaned up fields on it
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

// Allow an API consumer to delete a application.
router.delete('/applications/:id', async (request, response) => {
  try {
    // Try to parse the incoming ID to make sure it's really a number.
    const existingId = Number(request.params.id);
    if (isNaN(existingId)) {
      return response.status(404).send({message: `Application ${request.params.id} not valid.`});
    }

    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanRevokeInput(existingId, request.body);

    const deleteApplication = await Application.delete(existingId, cleanObject);

    if (deleteApplication === false) {
      return response.status(500).send({message: `Could not delete Application ${existingId}.`});
    }

    // If they are, send back true.
    return response.status(200).send();
  } catch (error) {
    // If anything goes wrong (such as a validation error), tell the client.
    return response.status(500).send({error});
  }
});

/**
 * Clean the incoming POST request body to make it more compatible with the
 * database and its validation rules.
 *
 * @param {any} body The incoming request's body.
 * @returns {any} A json object that's just got our cleaned up field on it.
 */
const cleanApplyOther = (body) => {
  return {
    // The string is trimmed for leading and trailing whitespace and then copied
    // across if it's in the POST body or is set to undefined if it's missing.
    emailAddress: body.emailAddress === undefined ? undefined : body.emailAddress.trim()
  };
};

// Save an incoming email address so we can email them later once the apply on
// behalf of others service is up and running.
router.post('/apply-other', async (request, response) => {
  const baseUrl = new URL(
    `${request.protocol}://${request.hostname}:${config.port}${request.originalUrl}${
      request.originalUrl.endsWith('/') ? '' : '/'
    }`
  );

  try {
    // Clean up the user's input before we store it in the database.
    const cleanObject = cleanApplyOther(request.body);

    const newApplyOther = await ApplyOther.create(cleanObject);
    response.status(201).location(new URL(newApplyOther.id, baseUrl)).send();
  } catch (error) {
    response.status(500).send({error});
  }
});

export {router as default};
