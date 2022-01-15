const logger = require('../utils/logger');

// middleware for simple console logging based on HTTP requests
const requestLogger = (request, response, next) => {
  logger.info('Method: ', request.method);
  logger.info('Path: ', request.path);
  logger.info('Body: ', request.body);
  logger.info('---');
  next();
}

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
  requestLogger,
  unknownEndpoint,
  errorHandler
}