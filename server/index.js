const app = require('./app');
const http = require('http');
const config = require('./config/config');
const logger = require('./utils/logger');

const server = http.createServer(app);
server.listen(config.PORT, () => {
  logger.info(`Listening on port ${config.PORT}`);
});