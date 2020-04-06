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
    console.log("Database connected");
    pgClient.query(
      `CREATE TABLE IF NOT EXISTS citations (
    id INT,
    issue_date DATE,
    issue_time INT,
    location VARCHAR(255),
    violation_description VARCHAR(255),
    day_of_week VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT
  );`
    );
  })
  .catch((err) => console.error(err.stack));
