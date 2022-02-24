// middleware for unknown endpoints
const unknownEndpoint = (req, res) => {
  res.status(404).json({
    error: 'Unknown endpoint',
    success: false,
  });
};

// middleware for handling errors
const errorHandler = (err, req, res, next) => {
  // logger.error(err.message);
  res.status(400).json({
    error: err.message,
    success: false,
  });

  next(err);
};

module.exports = {
  unknownEndpoint,
  errorHandler,
};
