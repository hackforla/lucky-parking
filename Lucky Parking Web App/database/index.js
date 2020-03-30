const { Client } = require("pg");

module.exports = pgClient = new Client({
  user: "luckyparking",
  password: "password",
  database: "luckyParking",
  port: 5432
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
  .catch(err => console.error(err.stack));

// COPY location FROM '/Users/EuiHyo_Mi/Desktop/lucky-parking/data/test.csv' DELIMITER ',' CSV HEADER;
