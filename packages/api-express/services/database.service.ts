import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: { test?: mongoDB.Collection } = {};

export async function connectToDatabase() {
  dotenv.config({ path: "../.env" });

  try {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(
      process.env.DB_CONN_STRING!,
    );

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const testCollection: mongoDB.Collection = db.collection(
      process.env.TEST_COLLECTION_NAME!,
    );

    console.log(`Successfully connected to database: ${db.databaseName}`);
  } catch (e) {
    console.error(e);
  }
}
