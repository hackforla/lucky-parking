const { Client } = require("pg");

module.exports = pgClient = new Client({
  user: "luckyparking",
  password: "password",
  database: "luckyparking",
  port: 5432
});

pgClient
  .connect()
  .then(() => {
    console.log("connected");
    pgClient.query(`CREATE TABLE IF NOT EXISTS location (
    longitude int,
    latitude int
  )`);
  })
  .catch(err => console.error(err.stack));
