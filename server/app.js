const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const compression = require('compression');
const router = require('./routes/router');
const middleware = require('./middleware/middleware');
const logger = require('./utils/logger');

app.use(cors({
  origin: '*'
}));
app.use(express.static('build'));
app.use(compression());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api', router);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;