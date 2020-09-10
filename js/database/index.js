const { Client } = require("pg");
require("dotenv").config();

module.exports = pgClient = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

pgClient
  .connect()
  .then(() => {
    console.log("Database connected");
  })
  .catch((err) => console.error(err.stack));
