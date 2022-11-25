const morgan = require('morgan');

morgan.token('req-info', (req) => JSON.stringify(req.path, req.body));
const requestInfo = morgan(
  ':method :url :status :response-time ms - :res[content-length] :req-info'
);

module.exports = {
  requestInfo,
};
