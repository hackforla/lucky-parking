const logger = require('../utils/logger');

// middleware for unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
}

// middleware for handling errors
const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  response.status(404).send(error);
  
  next(error);
}

module.exports = {
  unknownEndpoint,
  errorHandler
}