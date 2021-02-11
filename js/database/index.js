const { Pool } = require("pg");
require("dotenv").config();

module.exports = pgPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  max: 20, 
  idleTimeoutMillis: 1000, 
  connectionTimeoutMillis: 1000,
  maxUses: 7500,
});

pgPool
  .connect()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.error(err.stack));
