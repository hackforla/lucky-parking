import { Db } from "mongodb";
import client from "./client";

let db: Db;

try {
  const mongoClient = await client.connect();
  db = mongoClient.db(process.env.DB_NAME);
  console.log("Server connected to MongoDB");
} catch (e) {
  console.error(e);
} finally {
  //await client.close();
}
export { db };
