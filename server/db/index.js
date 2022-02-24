const { Pool } = require('pg');
const config = require('../config/config');
const logger = require('../utils/logger');

const poolParameters = {
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  port: config.DB_PORT,
  max: 20,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 1000,
  maxUses: 7500,
};

const pool = new Pool(poolParameters);

(async () => {
  const client = await pool.connect();
  try {
    logger.info('Database connected on port', config.DB_PORT);
  } finally {
    client.release();
  }
})().catch((err) => logger.error(err.stack));

module.exports = pool;
