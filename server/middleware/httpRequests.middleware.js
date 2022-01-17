const morgan = require('morgan');
const logger = require('../utils/logger');

morgan.token('req-info', (req, res) => {
  return JSON.stringify(req.path, req.body);
});
const requestInfo = morgan(':method :url :status :response-time ms - :res[content-length] :req-info');


module.exports = {
  requestInfo,
}