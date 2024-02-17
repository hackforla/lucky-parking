import { Db } from "mongodb";
import client from "./client";

const { DB_NAME } = process.env;

let db: Db = null;

try {
  const mongo = await client.connect();
  db = mongo.db(DB_NAME);
  console.log("Server connected to MongoDB");
} catch (e) {
  console.error(e);
}

export default db;
