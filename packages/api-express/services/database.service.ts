import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export async function connectToDatabase () {
  dotenv.config({ path: '../.env'});

  try {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING!);
    await client.connect();
    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    console.log(`Successfully connected to database: ${db.databaseName}`);
  } catch(e) {
    console.error(e);
  }
}
