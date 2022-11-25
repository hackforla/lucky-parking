require('dotenv').config();

const { DB_USER } = process.env;
const { DB_PASSWORD } = process.env;
const { DB_HOST } = process.env;
const { DB_PORT } = process.env;
const { DB_DATABASE } = process.env;
const PORT = process.env.PORT || 3007;

module.exports = {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  PORT,
};
