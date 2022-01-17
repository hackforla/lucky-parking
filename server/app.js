const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const compression = require('compression');
const router = require('./routes/router');

const httpRequestsLogger = require('./middleware/httpRequests.middleware');
const errorHandler = require('./middleware/errors.middleware');
const logger = require('./utils/logger');

app.use(cors({
  origin: '*'
}));
app.use(express.static('build'));
app.use(compression());
app.use(express.json());

app.use(httpRequestsLogger.requestInfo);

app.use('/api', router);

app.use(errorHandler.unknownEndpoint);
app.use(errorHandler.errorHandler);

module.exports = app;