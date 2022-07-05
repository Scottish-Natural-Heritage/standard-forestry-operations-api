import express from 'express';

import Application, {cleanPatchInput} from './controllers/v2/application.js';
import Sett from './controllers/v2/sett.js';
import Returns from './controllers/v2/returns.js';
import Note from './controllers/v2/note.js';
import jsonConsoleLogger, {unErrorJson} from './json-console-logger.js';
import config from './config/app.js';

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
    Note: body.note.trim(),
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

export {v2router as default};
