const http = require('http');
const app = require('./app/app');
const config = require('./app/config/config');
const logger = require('./app/utils/logger');

const server = http.createServer(app);
server.listen(config.PORT, () => {
  logger.info(`Listening on port ${config.PORT}`);
});
