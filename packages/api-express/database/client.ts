import { MongoClient } from "mongodb";

const { DB_HOST, DB_PASSWORD, DB_USERNAME } = process.env;

const options = new URLSearchParams({
  retryWrites: "true",
}).toString();

const uri = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/?${options}`;

const client = new MongoClient(uri);

export default client;
