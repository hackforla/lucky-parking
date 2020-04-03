const { Client } = require("pg");
require("dotenv").config();

module.exports = pgClient = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

pgClient
  .connect()
  .then(() => {
    console.log("connected");
    pgClient.query(`CREATE TABLE IF NOT EXISTS location (
    longitude float,
    latitude float
  )`);
  })
  .catch((err) => console.error(err.stack));

// COPY location FROM '/Users/EuiHyo_Mi/Desktop/lucky-parking/data/test.csv' DELIMITER ',' CSV HEADER;
