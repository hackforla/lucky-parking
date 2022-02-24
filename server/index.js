const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

const server = http.createServer(app);
server.listen(config.PORT, () => {
  logger.info(`Listening on port ${config.PORT}`);
});
