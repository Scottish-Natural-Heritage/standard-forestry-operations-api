import express from 'express';

const router = express.Router();

router.get('/health', async (request, response) => {
  response.status(200).send({message: 'OK'});
});

export {router as default};
